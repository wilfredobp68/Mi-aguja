"""
reportes.py — Módulo 7: Reportes de mantenimiento / incidentes.

El residente reporta un problema en áreas comunes (con foto opcional) y la
administración le da seguimiento cambiando el estado.

  POST  /reportes             -> crear un reporte (residente).
  GET   /reportes/mios        -> mis reportes y su avance (residente).
  GET   /reportes             -> todos los reportes (admin; ?estado=abiertos filtra).
  PATCH /reportes/{id}        -> cambiar estado / responder (admin).
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/reportes", tags=["Módulo 7 · Reportes"])


@router.post("", response_model=schemas.ReporteOut, status_code=status.HTTP_201_CREATED)
def crear_reporte(
    datos: schemas.ReporteCrear,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    reporte = models.Reporte(
        residente_id=residente.id,
        categoria=datos.categoria,
        descripcion=datos.descripcion,
        foto_url=datos.foto_url,
    )
    db.add(reporte)
    db.commit()
    db.refresh(reporte)
    return reporte


@router.get("/mios", response_model=list[schemas.ReporteOut])
def mis_reportes(
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    return (
        db.query(models.Reporte)
        .filter(models.Reporte.residente_id == residente.id)
        .order_by(models.Reporte.created_at.desc())
        .all()
    )


@router.get("", response_model=list[schemas.ReporteOut])
def listar_reportes(
    estado: str | None = None,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    """Todos los reportes (admin). Con ?estado=abiertos devuelve solo los no resueltos."""
    consulta = db.query(models.Reporte)
    if estado == "abiertos":
        consulta = consulta.filter(models.Reporte.estado != "resuelto")
    elif estado:
        consulta = consulta.filter(models.Reporte.estado == estado)
    return consulta.order_by(models.Reporte.created_at.desc()).all()


@router.patch("/{reporte_id}", response_model=schemas.ReporteOut)
def actualizar_reporte(
    reporte_id: int,
    datos: schemas.ReporteActualizar,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    reporte = db.query(models.Reporte).filter(models.Reporte.id == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="El reporte no existe")

    reporte.estado = datos.estado
    if datos.comentario_admin is not None:
        reporte.comentario_admin = datos.comentario_admin
    reporte.actualizado_en = datetime.now()
    db.commit()
    db.refresh(reporte)
    return reporte
