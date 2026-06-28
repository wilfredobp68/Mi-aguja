"""
pases.py — Módulo 4: Pases de acceso (código de 6 dígitos / QR).

El residente crea un pase (para una visita puntual o para personal recurrente) y
recibe un código de 6 dígitos. El guardia ESCRIBE ese código en la aguja para validarlo.

  POST  /pases            -> crear un pase (residente).
  GET   /pases/mios       -> ver mis pases (residente).
  PATCH /pases/{id}/revocar -> anular un pase (residente).
  POST  /pases/validar    -> el guardia valida un código.
"""

import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/pases", tags=["Módulo 4 · Pases de acceso"])


def generar_codigo_unico(db: Session) -> str:
    """Genera un código de 6 dígitos que no esté en uso por otro pase activo."""
    while True:
        codigo = f"{random.randint(0, 999999):06d}"  # ej. "042817"
        ya_existe = (
            db.query(models.Pase)
            .filter(models.Pase.codigo == codigo, models.Pase.estado == "activo")
            .first()
        )
        if not ya_existe:
            return codigo


@router.post("", response_model=schemas.PaseOut, status_code=status.HTTP_201_CREATED)
def crear_pase(
    datos: schemas.PaseCrear,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    # Validaciones según el tipo de pase.
    if datos.tipo == "visita" and not datos.valido_hasta:
        raise HTTPException(status_code=400, detail="Una visita necesita una fecha de validez")
    if datos.tipo == "personal" and not datos.dias_permitidos:
        raise HTTPException(status_code=400, detail="El personal necesita días permitidos")

    pase = models.Pase(
        residente_id=residente.id,
        nombre=datos.nombre,
        tipo=datos.tipo,
        codigo=generar_codigo_unico(db),
        valido_hasta=datos.valido_hasta,
        dias_permitidos=datos.dias_permitidos,
        rol_personal=datos.rol_personal,
        estado="activo",
    )
    db.add(pase)
    db.commit()
    db.refresh(pase)
    return pase


@router.get("/mios", response_model=list[schemas.PaseOut])
def mis_pases(
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    return (
        db.query(models.Pase)
        .filter(models.Pase.residente_id == residente.id)
        .order_by(models.Pase.created_at.desc())
        .all()
    )


@router.patch("/{pase_id}/revocar", response_model=schemas.PaseOut)
def revocar_pase(
    pase_id: int,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    pase = db.query(models.Pase).filter(models.Pase.id == pase_id).first()
    if not pase:
        raise HTTPException(status_code=404, detail="El pase no existe")
    if pase.residente_id != residente.id:
        raise HTTPException(status_code=403, detail="Ese pase no es tuyo")

    pase.estado = "revocado"
    db.commit()
    db.refresh(pase)
    return pase


@router.post("/validar", response_model=schemas.PaseValidarOut)
def validar_pase(
    datos: schemas.PaseValidarIn,
    db: Session = Depends(get_db),
    guardia: models.Usuario = Depends(auth.requiere_rol("guardia")),
):
    """
    El guardia escribe el código. Comprobamos que exista, que no esté revocado y que
    esté vigente. Si todo está bien, registramos el acceso en el log de visitantes
    (como "autorizado") y respondemos con los datos para mostrarlos en pantalla.
    """
    pase = db.query(models.Pase).filter(models.Pase.codigo == datos.codigo).first()

    if not pase:
        return {"valido": False, "motivo": "Código no encontrado"}
    if pase.estado != "activo":
        return {"valido": False, "motivo": "El pase fue revocado"}
    if not pase.vigente:
        motivo = "El pase está vencido" if pase.tipo == "visita" else "Hoy no está autorizado"
        return {"valido": False, "motivo": motivo}

    # Pase válido -> dejamos constancia en el log de visitantes.
    registro = models.Visitante(
        nombre=pase.nombre,
        visita_a_id=pase.residente_id,
        guardia_id=guardia.id,
        estado="autorizado",
        hora_respuesta=datetime.now(),
    )
    db.add(registro)
    db.commit()

    return {
        "valido": True,
        "nombre": pase.nombre,
        "tipo": pase.tipo,
        "residente": pase.residente,
    }
