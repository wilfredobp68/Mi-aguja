"""
sos.py — Módulo 8: Botón de emergencia (SOS).

El residente presiona el botón SOS y el guardia + admin ven la alerta al
instante (vía polling). Quien la atiende la marca como "atendida".

  POST  /sos               -> disparar una alerta (residente).
  GET   /sos/activas       -> alertas sin atender (guardia y admin, lista en vivo).
  PATCH /sos/{id}/atender  -> marcar como atendida (guardia o admin).
  GET   /sos/log           -> historial completo (admin).
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/sos", tags=["Módulo 8 · SOS"])


@router.post("", response_model=schemas.SOSOut, status_code=status.HTTP_201_CREATED)
def disparar_sos(
    datos: schemas.SOSCrear,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    # Si el residente ya tiene una alerta activa, no creamos otra (evita duplicados
    # si presiona el botón varias veces por nervios).
    existente = (
        db.query(models.AlertaSOS)
        .filter(
            models.AlertaSOS.residente_id == residente.id,
            models.AlertaSOS.estado == "activa",
        )
        .first()
    )
    if existente:
        return existente

    alerta = models.AlertaSOS(residente_id=residente.id, mensaje=datos.mensaje)
    db.add(alerta)
    db.commit()
    db.refresh(alerta)
    return alerta


@router.get("/activas", response_model=list[schemas.SOSOut])
def alertas_activas(
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(auth.requiere_rol("guardia", "admin")),
):
    return (
        db.query(models.AlertaSOS)
        .filter(models.AlertaSOS.estado == "activa")
        .order_by(models.AlertaSOS.created_at.desc())
        .all()
    )


@router.patch("/{alerta_id}/atender", response_model=schemas.SOSOut)
def atender_alerta(
    alerta_id: int,
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(auth.requiere_rol("guardia", "admin")),
):
    alerta = db.query(models.AlertaSOS).filter(models.AlertaSOS.id == alerta_id).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="La alerta no existe")

    alerta.estado = "atendida"
    alerta.atendida_en = datetime.now()
    alerta.atendida_por_id = usuario.id
    db.commit()
    db.refresh(alerta)
    return alerta


@router.get("/log", response_model=list[schemas.SOSOut])
def log_sos(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    return (
        db.query(models.AlertaSOS)
        .order_by(models.AlertaSOS.created_at.desc())
        .all()
    )
