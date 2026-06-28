"""
schemas.py — Esquemas de Pydantic (la "forma" de los datos de la API).

Diferencia clave con models.py:
  - models.py  = cómo se guardan los datos en la base de datos.
  - schemas.py = cómo entran y salen los datos por la API (lo que ve el frontend).

Los esquemas que terminan en "Crear" describen lo que el frontend ENVÍA.
Los que terminan en "Out" describen lo que la API DEVUELVE.

`from_attributes=True` permite construir una respuesta directamente a partir de
un objeto de la base de datos (un modelo de SQLAlchemy).
`Literal[...]` limita un campo a una lista cerrada de valores válidos.
"""

from datetime import datetime, date
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, ConfigDict


# ───────────────────────── Usuario ─────────────────────────
class UsuarioMini(BaseModel):
    """Versión corta de un usuario, para incrustar dentro de otras respuestas."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    rol: str
    casa_lote: Optional[str] = None


class UsuarioOut(BaseModel):
    """Datos completos del usuario que sí son seguros de mostrar (sin contraseña)."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    email: EmailStr
    rol: str
    casa_lote: Optional[str] = None
    telefono: Optional[str] = None


# ───────────────────────── Autenticación ─────────────────────────
class TokenOut(BaseModel):
    """Lo que devuelve /auth/login: el token + los datos del usuario."""
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


# ───────────────────────── Módulo 1: Avisos ─────────────────────────
class AvisoCrear(BaseModel):
    titulo: str
    contenido: str
    categoria: Literal["urgente", "construccion", "evento", "mantenimiento", "general"] = "general"
    imagen_url: Optional[str] = None


class AvisoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    titulo: str
    contenido: str
    categoria: str
    imagen_url: Optional[str] = None
    created_at: datetime
    autor: UsuarioMini


# ───────────────────────── Módulo 2: Amenidades y Reservas ─────────────────────────
class AmenidadCrear(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    capacidad_maxima: int = 10
    hora_apertura: str = "08:00"
    hora_cierre: str = "20:00"


class AmenidadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    descripcion: Optional[str] = None
    capacidad_maxima: int
    hora_apertura: str
    hora_cierre: str
    activa: bool


class FranjaDisponibilidad(BaseModel):
    """Una franja horaria con cuántos cupos quedan libres."""
    hora_inicio: str
    hora_fin: str
    cupos_totales: int
    cupos_disponibles: int


class ReservaCrear(BaseModel):
    amenidad_id: int
    fecha: date
    hora_inicio: str
    hora_fin: str
    numero_personas: int = 1


class ReservaDecidir(BaseModel):
    """Lo que envía el admin para aprobar o rechazar una reserva."""
    estado: Literal["aprobada", "rechazada"]
    mensaje_admin: Optional[str] = None


class ReservaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    fecha: date
    hora_inicio: str
    hora_fin: str
    numero_personas: int
    estado: str
    mensaje_admin: Optional[str] = None
    created_at: datetime
    amenidad: AmenidadOut
    residente: UsuarioMini


# ───────────────────────── Módulo 3: Visitantes ─────────────────────────
class VisitanteCrear(BaseModel):
    nombre: str
    visita_a_id: int                  # id del residente al que visita
    foto_url: Optional[str] = None


class VisitanteDecidir(BaseModel):
    """Lo que envía el residente para autorizar o rechazar al visitante."""
    estado: Literal["autorizado", "rechazado"]


class VisitanteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    estado: str
    foto_url: Optional[str] = None
    hora_registro: datetime
    hora_respuesta: Optional[datetime] = None
    visita_a: UsuarioMini
    guardia: UsuarioMini


# ───────────────────────── Módulo 4: Pases de acceso ─────────────────────────
class PaseCrear(BaseModel):
    tipo: Literal["visita", "personal"]
    nombre: str
    valido_hasta: Optional[datetime] = None  # requerido para "visita"
    dias_permitidos: Optional[str] = None    # requerido para "personal", ej. "0,1,2,3,4"
    rol_personal: Optional[str] = None       # opcional para "personal", ej. "Doméstica"


class PaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    tipo: str
    nombre: str
    codigo: str
    valido_hasta: Optional[datetime] = None
    dias_permitidos: Optional[str] = None
    rol_personal: Optional[str] = None
    estado: str
    vigente: bool          # campo calculado (lo expone la propiedad del modelo Pase)
    created_at: datetime
    residente: UsuarioMini


class PaseValidarIn(BaseModel):
    codigo: str


class PaseValidarOut(BaseModel):
    valido: bool
    motivo: Optional[str] = None
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    residente: Optional[UsuarioMini] = None


# ───────────────────────── Módulo 5: Encomiendas ─────────────────────────
class EncomiendaCrear(BaseModel):
    empresa: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_esperada: Optional[date] = None


class EncomiendaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    empresa: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_esperada: Optional[date] = None
    estado: str
    created_at: datetime
    hora_ingreso: Optional[datetime] = None
    residente: UsuarioMini
    guardia: Optional[UsuarioMini] = None
