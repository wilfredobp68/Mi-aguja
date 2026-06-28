"""
encomiendas.py — Módulo 5: Encomiendas / deliveries en camino.

El residente ANUNCIA que viene un delivery para él (ej. PedidosYa, Amazon).
El guardia ve la lista de "esperados" y, cuando el repartidor llega, lo deja pasar
(va directo a la casa) y marca el ingreso. El paquete NO se queda en la caseta.

  POST   /encomiendas             -> anunciar (residente).
  GET    /encomiendas/mias        -> mis encomiendas y su estado (residente).
  DELETE /encomiendas/{id}        -> cancelar una que aún viene en camino (residente).
  GET    /encomiendas/esperadas   -> deliveries en camino (guardia, lista en vivo).
  PATCH  /encomiendas/{id}/ingreso-> marcar que ya ingresó (guardia).
  GET    /encomiendas/log         -> historial completo (admin).
"""

from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/encomiendas", tags=["Módulo 5 · Encomiendas"])


@router.post("", response_model=schemas.EncomiendaOut, status_code=status.HTTP_201_CREATED)
def anunciar_encomienda(
    datos: schemas.EncomiendaCrear,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    encomienda = models.Encomienda(
        residente_id=residente.id,
        empresa=datos.empresa,
        descripcion=datos.descripcion,
        fecha_esperada=datos.fecha_esperada or date.today(),
        estado="en_camino",
    )
    db.add(encomienda)
    db.commit()
    db.refresh(encomienda)
    return encomienda


@router.get("/mias", response_model=list[schemas.EncomiendaOut])
def mis_encomiendas(
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    return (
        db.query(models.Encomienda)
        .filter(models.Encomienda.residente_id == residente.id)
        .order_by(models.Encomienda.created_at.desc())
        .all()
    )


@router.delete("/{encomienda_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_encomienda(
    encomienda_id: int,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    encomienda = db.query(models.Encomienda).filter(models.Encomienda.id == encomienda_id).first()
    if not encomienda:
        raise HTTPException(status_code=404, detail="La encomienda no existe")
    if encomienda.residente_id != residente.id:
        raise HTTPException(status_code=403, detail="Esa encomienda no es tuya")
    if encomienda.estado != "en_camino":
        raise HTTPException(status_code=400, detail="Ya ingresó, no se puede cancelar")
    db.delete(encomienda)
    db.commit()


@router.get("/esperadas", response_model=list[schemas.EncomiendaOut])
def encomiendas_esperadas(
    db: Session = Depends(get_db),
    guardia: models.Usuario = Depends(auth.requiere_rol("guardia")),
):
    """Todos los deliveries anunciados que aún no han ingresado (para el guardia)."""
    return (
        db.query(models.Encomienda)
        .filter(models.Encomienda.estado == "en_camino")
        .order_by(models.Encomienda.created_at.desc())
        .all()
    )


@router.patch("/{encomienda_id}/ingreso", response_model=schemas.EncomiendaOut)
def marcar_ingreso(
    encomienda_id: int,
    db: Session = Depends(get_db),
    guardia: models.Usuario = Depends(auth.requiere_rol("guardia")),
):
    encomienda = db.query(models.Encomienda).filter(models.Encomienda.id == encomienda_id).first()
    if not encomienda:
        raise HTTPException(status_code=404, detail="La encomienda no existe")

    encomienda.estado = "ingresado"
    encomienda.guardia_id = guardia.id
    encomienda.hora_ingreso = datetime.now()
    db.commit()
    db.refresh(encomienda)
    return encomienda


@router.get("/log", response_model=list[schemas.EncomiendaOut])
def log_encomiendas(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    return (
        db.query(models.Encomienda)
        .order_by(models.Encomienda.created_at.desc())
        .all()
    )
