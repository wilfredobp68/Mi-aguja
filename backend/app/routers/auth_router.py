"""
auth_router.py — Endpoints de autenticación.

  POST /auth/login  -> inicia sesión y devuelve el token + datos del usuario.
  GET  /auth/me     -> devuelve el usuario de la sesión actual (según el token).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=schemas.TokenOut)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Inicia sesión. El formulario estándar usa el campo "username":
    aquí ese campo debe contener el CORREO del usuario.
    """
    usuario = db.query(models.Usuario).filter(models.Usuario.email == form.username).first()

    # Mismo mensaje para correo inexistente o contraseña mala (buena práctica de seguridad).
    if not usuario or not auth.verificar_password(form.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    token = auth.crear_token_acceso(usuario.id, usuario.rol)
    return {"access_token": token, "token_type": "bearer", "usuario": usuario}


@router.get("/me", response_model=schemas.UsuarioOut)
def usuario_actual(usuario: models.Usuario = Depends(auth.get_current_user)):
    """Devuelve los datos del usuario logueado. Útil para que el frontend sepa quién es."""
    return usuario
