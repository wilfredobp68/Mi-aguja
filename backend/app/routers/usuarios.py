"""
usuarios.py — Endpoints auxiliares sobre usuarios.

  GET /usuarios/residentes  -> lista de residentes (id, nombre, casa/lote).

Lo usa el guardia para elegir a qué residente busca un visitante.
Disponible para guardia y administrador.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/residentes", response_model=list[schemas.UsuarioMini])
def listar_residentes(
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(auth.requiere_rol("guardia", "admin")),
):
    return (
        db.query(models.Usuario)
        .filter(models.Usuario.rol == "residente")
        .order_by(models.Usuario.nombre)
        .all()
    )
