"""
visitantes.py — Módulo 3: Control de visitantes.

  POST  /visitantes              -> el guardia registra un visitante (queda "pendiente").
  GET   /visitantes/pendientes   -> el residente ve quién pregunta por él (se consulta cada ~4s).
  PATCH /visitantes/{id}         -> el residente autoriza o rechaza.
  GET   /visitantes/activos      -> el guardia ve el estado de los que registró hoy (cada ~4s).
  GET   /visitantes/log          -> el admin ve el historial completo.

Nota: en esta Fase 1 el "tiempo real" se logra con polling (el frontend pregunta
cada pocos segundos). En la Fase 2 se reemplazará por notificaciones push.
"""

from datetime import datetime, date, time

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/visitantes", tags=["Módulo 3 · Visitantes"])


@router.post("", response_model=schemas.VisitanteOut, status_code=status.HTTP_201_CREATED)
def registrar_visitante(
    datos: schemas.VisitanteCrear,
    db: Session = Depends(get_db),
    guardia: models.Usuario = Depends(auth.requiere_rol("guardia")),
):
    # Verificamos que la persona a visitar exista y sea un residente.
    residente = db.query(models.Usuario).filter(
        models.Usuario.id == datos.visita_a_id,
        models.Usuario.rol == "residente",
    ).first()
    if not residente:
        raise HTTPException(status_code=404, detail="El residente indicado no existe")

    visitante = models.Visitante(
        nombre=datos.nombre,
        visita_a_id=datos.visita_a_id,
        guardia_id=guardia.id,
        foto_url=datos.foto_url,
        estado="pendiente",
    )
    db.add(visitante)
    db.commit()
    db.refresh(visitante)
    return visitante


@router.get("/pendientes", response_model=list[schemas.VisitanteOut])
def visitantes_pendientes(
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    """Visitas dirigidas al residente logueado que aún esperan respuesta."""
    return (
        db.query(models.Visitante)
        .filter(
            models.Visitante.visita_a_id == residente.id,
            models.Visitante.estado == "pendiente",
        )
        .order_by(models.Visitante.hora_registro.desc())
        .all()
    )


@router.patch("/{visitante_id}", response_model=schemas.VisitanteOut)
def decidir_visitante(
    visitante_id: int,
    datos: schemas.VisitanteDecidir,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    visitante = db.query(models.Visitante).filter(models.Visitante.id == visitante_id).first()
    if not visitante:
        raise HTTPException(status_code=404, detail="El registro de visitante no existe")

    # Un residente solo puede decidir sobre SUS propios visitantes.
    if visitante.visita_a_id != residente.id:
        raise HTTPException(status_code=403, detail="Este visitante no pregunta por ti")

    visitante.estado = datos.estado
    visitante.hora_respuesta = datetime.now()
    db.commit()
    db.refresh(visitante)
    return visitante


@router.get("/activos", response_model=list[schemas.VisitanteOut])
def visitantes_de_hoy(
    db: Session = Depends(get_db),
    guardia: models.Usuario = Depends(auth.requiere_rol("guardia")),
):
    """
    Visitantes que ESTE guardia registró hoy, con su estado actual.
    El frontend del guardia consulta esto cada pocos segundos para ver, en vivo,
    si el residente ya autorizó o rechazó.
    """
    inicio_de_hoy = datetime.combine(date.today(), time.min)
    return (
        db.query(models.Visitante)
        .filter(
            models.Visitante.guardia_id == guardia.id,
            models.Visitante.hora_registro >= inicio_de_hoy,
        )
        .order_by(models.Visitante.hora_registro.desc())
        .all()
    )


@router.get("/log", response_model=list[schemas.VisitanteOut])
def log_completo(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    """Historial completo de todos los visitantes (para el administrador)."""
    return (
        db.query(models.Visitante)
        .order_by(models.Visitante.hora_registro.desc())
        .all()
    )
