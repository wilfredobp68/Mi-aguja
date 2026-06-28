"""
reservas.py — Módulo 2: Amenidades y reservas.

Amenidades (piscina, casa club, etc.):
  GET  /amenidades                          -> lista de amenidades activas (todos).
  POST /amenidades                          -> crear amenidad (solo admin).
  GET  /amenidades/{id}/disponibilidad      -> cupos libres por franja en una fecha (todos).

Reservas:
  POST  /reservas        -> solicitar una reserva (solo residente). Queda "pendiente".
  GET   /reservas/mias   -> historial del residente logueado.
  GET   /reservas        -> todas las reservas (solo admin), filtrables por estado.
  PATCH /reservas/{id}   -> aprobar / rechazar una reserva (solo admin).
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(tags=["Módulo 2 · Reservas"])


def _hora_a_entero(hora_texto: str) -> int:
    """Convierte un texto 'HH:MM' a su hora como número entero. Ej: '14:30' -> 14."""
    return int(hora_texto.split(":")[0])


# ───────────────────────── Amenidades ─────────────────────────
@router.get("/amenidades", response_model=list[schemas.AmenidadOut])
def listar_amenidades(
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(auth.get_current_user),
):
    return db.query(models.Amenidad).filter(models.Amenidad.activa == True).all()  # noqa: E712


@router.post("/amenidades", response_model=schemas.AmenidadOut, status_code=status.HTTP_201_CREATED)
def crear_amenidad(
    datos: schemas.AmenidadCrear,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    amenidad = models.Amenidad(**datos.model_dump())
    db.add(amenidad)
    db.commit()
    db.refresh(amenidad)
    return amenidad


@router.get("/amenidades/{amenidad_id}/disponibilidad", response_model=list[schemas.FranjaDisponibilidad])
def disponibilidad(
    amenidad_id: int,
    fecha: date,  # se envía en la URL como ?fecha=2026-06-23
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(auth.get_current_user),
):
    """
    Genera franjas de 1 hora entre la apertura y el cierre de la amenidad, y
    calcula cuántos cupos quedan libres en cada franja para la fecha pedida.
    Cuenta las reservas que ya están "aprobadas" o "pendientes".
    """
    amenidad = db.query(models.Amenidad).filter(models.Amenidad.id == amenidad_id).first()
    if not amenidad:
        raise HTTPException(status_code=404, detail="La amenidad no existe")

    reservas = (
        db.query(models.Reserva)
        .filter(
            models.Reserva.amenidad_id == amenidad_id,
            models.Reserva.fecha == fecha,
            models.Reserva.estado.in_(["aprobada", "pendiente"]),
        )
        .all()
    )

    apertura = _hora_a_entero(amenidad.hora_apertura)
    cierre = _hora_a_entero(amenidad.hora_cierre)

    franjas = []
    for h in range(apertura, cierre):
        # Cuántas personas ya ocupan esta hora (sumando reservas que la cubren).
        ocupados = sum(
            r.numero_personas
            for r in reservas
            if _hora_a_entero(r.hora_inicio) <= h < _hora_a_entero(r.hora_fin)
        )
        franjas.append(
            schemas.FranjaDisponibilidad(
                hora_inicio=f"{h:02d}:00",
                hora_fin=f"{h + 1:02d}:00",
                cupos_totales=amenidad.capacidad_maxima,
                cupos_disponibles=max(0, amenidad.capacidad_maxima - ocupados),
            )
        )
    return franjas


# ───────────────────────── Reservas ─────────────────────────
@router.post("/reservas", response_model=schemas.ReservaOut, status_code=status.HTTP_201_CREATED)
def crear_reserva(
    datos: schemas.ReservaCrear,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    amenidad = db.query(models.Amenidad).filter(
        models.Amenidad.id == datos.amenidad_id,
        models.Amenidad.activa == True,  # noqa: E712
    ).first()
    if not amenidad:
        raise HTTPException(status_code=404, detail="La amenidad no existe o no está activa")

    if datos.numero_personas < 1:
        raise HTTPException(status_code=400, detail="El número de personas debe ser al menos 1")
    if datos.numero_personas > amenidad.capacidad_maxima:
        raise HTTPException(
            status_code=400,
            detail=f"Esa amenidad admite como máximo {amenidad.capacidad_maxima} personas",
        )

    reserva = models.Reserva(
        amenidad_id=datos.amenidad_id,
        residente_id=residente.id,
        fecha=datos.fecha,
        hora_inicio=datos.hora_inicio,
        hora_fin=datos.hora_fin,
        numero_personas=datos.numero_personas,
        estado="pendiente",
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva


@router.get("/reservas/mias", response_model=list[schemas.ReservaOut])
def mis_reservas(
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    return (
        db.query(models.Reserva)
        .filter(models.Reserva.residente_id == residente.id)
        .order_by(models.Reserva.created_at.desc())
        .all()
    )


@router.get("/reservas", response_model=list[schemas.ReservaOut])
def todas_las_reservas(
    estado: str | None = None,  # opcional: ?estado=pendiente
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    consulta = db.query(models.Reserva)
    if estado:
        consulta = consulta.filter(models.Reserva.estado == estado)
    return consulta.order_by(models.Reserva.created_at.desc()).all()


@router.patch("/reservas/{reserva_id}", response_model=schemas.ReservaOut)
def decidir_reserva(
    reserva_id: int,
    datos: schemas.ReservaDecidir,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    reserva = db.query(models.Reserva).filter(models.Reserva.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="La reserva no existe")

    reserva.estado = datos.estado
    reserva.mensaje_admin = datos.mensaje_admin
    db.commit()
    db.refresh(reserva)
    return reserva
