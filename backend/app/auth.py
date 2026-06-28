"""
auth.py — Autenticación y seguridad.

Aquí vive toda la lógica de seguridad:
  - Encriptar (hashear) contraseñas con bcrypt, para no guardarlas en texto plano.
  - Crear y verificar tokens JWT (la "credencial" que el frontend guarda tras el login).
  - get_current_user(): saca al usuario a partir del token de la petición.
  - requiere_rol(): protege endpoints según el rol (admin / residente / guardia).

¿Qué es un token JWT? Es un texto firmado por el servidor que dice "yo soy el
usuario #5 y mi rol es residente". El frontend lo envía en cada petición y el
servidor lo verifica. Si la firma no coincide, se rechaza.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt  # viene de la librería PyJWT
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import config
from .database import get_db
from . import models

# Esto le dice a FastAPI dónde se obtiene el token (el endpoint de login).
# Gracias a esto, el botón "Authorize" de /docs funciona automáticamente.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ───────────────────────── Contraseñas ─────────────────────────
def hashear_password(password: str) -> str:
    """Convierte una contraseña en un 'hash' seguro e irreversible."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")  # lo guardamos como texto


def verificar_password(password: str, hashed: str) -> bool:
    """Comprueba si una contraseña coincide con su hash guardado."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


# ───────────────────────── Tokens JWT ─────────────────────────
def crear_token_acceso(usuario_id: int, rol: str) -> str:
    """Genera un token firmado que identifica al usuario por un tiempo limitado."""
    expira = datetime.now(timezone.utc) + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    datos = {
        "sub": str(usuario_id),  # "subject": a quién pertenece el token
        "rol": rol,
        "exp": expira,           # cuándo deja de ser válido
    }
    return jwt.encode(datos, config.SECRET_KEY, algorithm=config.ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Usuario:
    """
    Lee el token de la petición, lo verifica y devuelve el Usuario correspondiente.
    Si el token es inválido o el usuario no existe, devuelve error 401.
    """
    error_credenciales = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o sesión expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        usuario_id = int(payload.get("sub"))
    except (jwt.PyJWTError, TypeError, ValueError):
        raise error_credenciales

    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if usuario is None:
        raise error_credenciales
    return usuario


def requiere_rol(*roles_permitidos: str):
    """
    Fábrica de "guardianes" por rol. Se usa así en un endpoint:

        admin = Depends(requiere_rol("admin"))

    Si el usuario logueado no tiene un rol permitido, devuelve error 403.
    """
    def verificador(usuario: models.Usuario = Depends(get_current_user)) -> models.Usuario:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para realizar esta acción",
            )
        return usuario

    return verificador
