"""
avisos.py — Módulo 1: Avisos y comunicados.

  GET    /avisos        -> lista de avisos (todos los roles la pueden ver).
  POST   /avisos        -> crear aviso (solo admin).
  DELETE /avisos/{id}   -> borrar aviso (solo admin).

Los avisos vienen ordenados del más nuevo al más viejo. El frontend resalta en
rojo los de categoría "urgente".
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/avisos", tags=["Módulo 1 · Avisos"])


@router.get("", response_model=list[schemas.AvisoOut])
def listar_avisos(
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(auth.get_current_user),  # cualquiera logueado
):
    return (
        db.query(models.Aviso)
        .order_by(models.Aviso.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.AvisoOut, status_code=status.HTTP_201_CREATED)
def crear_aviso(
    datos: schemas.AvisoCrear,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),  # solo admin
):
    aviso = models.Aviso(**datos.model_dump(), autor_id=admin.id)
    db.add(aviso)
    db.commit()
    db.refresh(aviso)
    return aviso


@router.delete("/{aviso_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_aviso(
    aviso_id: int,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),  # solo admin
):
    aviso = db.query(models.Aviso).filter(models.Aviso.id == aviso_id).first()
    if not aviso:
        raise HTTPException(status_code=404, detail="El aviso no existe")
    db.delete(aviso)
    db.commit()
    # 204 = "hecho, sin contenido que devolver"
