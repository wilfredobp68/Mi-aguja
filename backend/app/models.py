"""
models.py — Los modelos de la base de datos (las "tablas").

Cada clase es una tabla. Cada atributo (Column) es una columna.
Estos son los datos que "Mi Aguja" guarda:

  - Usuario    : las personas (admin, residente, guardia)
  - Aviso      : Módulo 1 (comunicados)
  - Amenidad   : Módulo 2 (piscina, casa club, etc.)
  - Reserva    : Módulo 2 (una solicitud de reserva de un residente)
  - Visitante  : Módulo 3 (registro de quien llega a la aguja)
"""

from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey,
)
from sqlalchemy.orm import relationship

from .database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # nunca guardamos la contraseña real

    # Rol del usuario: "admin" | "residente" | "guardia"
    rol = Column(String, nullable=False)

    casa_lote = Column(String, nullable=True)   # solo para residentes (ej. "Casa 12")
    telefono = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)


class Aviso(Base):
    __tablename__ = "avisos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    contenido = Column(Text, nullable=False)

    # Categoría: "urgente" | "construccion" | "evento" | "mantenimiento" | "general"
    categoria = Column(String, nullable=False, default="general")

    imagen_url = Column(String, nullable=True)  # opcional
    autor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    # Relación: nos deja acceder a aviso.autor para obtener el Usuario que lo creó.
    autor = relationship("Usuario")


class Amenidad(Base):
    __tablename__ = "amenidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    capacidad_maxima = Column(Integer, nullable=False, default=10)

    # Horarios guardados como texto "HH:MM" para mantenerlo simple.
    hora_apertura = Column(String, nullable=False, default="08:00")
    hora_cierre = Column(String, nullable=False, default="20:00")

    activa = Column(Boolean, default=True)


class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    amenidad_id = Column(Integer, ForeignKey("amenidades.id"), nullable=False)
    residente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    fecha = Column(Date, nullable=False)           # día de la reserva (YYYY-MM-DD)
    hora_inicio = Column(String, nullable=False)   # "HH:MM"
    hora_fin = Column(String, nullable=False)      # "HH:MM"
    numero_personas = Column(Integer, nullable=False, default=1)

    # Estado: "pendiente" | "aprobada" | "rechazada"
    estado = Column(String, nullable=False, default="pendiente")
    mensaje_admin = Column(String, nullable=True)  # mensaje opcional del admin al decidir
    created_at = Column(DateTime, default=datetime.now)

    # Relaciones para acceder fácilmente a la amenidad y al residente.
    amenidad = relationship("Amenidad")
    residente = relationship("Usuario")


class Visitante(Base):
    __tablename__ = "visitantes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)

    visita_a_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # el residente
    guardia_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)   # quién lo registró

    foto_url = Column(String, nullable=True)  # opcional

    # Estado: "pendiente" | "autorizado" | "rechazado"
    estado = Column(String, nullable=False, default="pendiente")

    hora_registro = Column(DateTime, default=datetime.now)
    hora_respuesta = Column(DateTime, nullable=True)  # cuándo respondió el residente

    # Como hay DOS relaciones hacia Usuario, debemos indicar la columna de cada una.
    visita_a = relationship("Usuario", foreign_keys=[visita_a_id])
    guardia = relationship("Usuario", foreign_keys=[guardia_id])


class Pase(Base):
    """
    Módulo 4: un "pase de acceso" con un código de 6 dígitos.

    Sirve para dos cosas según su `tipo`:
      - "visita":   un invitado pre-autorizado. Vence en una fecha (`valido_hasta`).
      - "personal": alguien recurrente (doméstica, jardinero...). Es válido en ciertos
                    días de la semana (`dias_permitidos`), sin fecha de vencimiento.

    El residente lo crea; el guardia escribe el código en la aguja para validarlo.
    """
    __tablename__ = "pases"

    id = Column(Integer, primary_key=True, index=True)
    residente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nombre = Column(String, nullable=False)  # nombre del invitado o del trabajador

    tipo = Column(String, nullable=False)                 # "visita" | "personal"
    codigo = Column(String, unique=True, index=True, nullable=False)  # 6 dígitos

    valido_hasta = Column(DateTime, nullable=True)   # solo "visita": cuándo vence
    dias_permitidos = Column(String, nullable=True)  # solo "personal": ej. "0,1,2,3,4" (lun-vie)
    rol_personal = Column(String, nullable=True)     # solo "personal": ej. "Doméstica"

    estado = Column(String, nullable=False, default="activo")  # "activo" | "revocado"
    created_at = Column(DateTime, default=datetime.now)

    residente = relationship("Usuario")

    @property
    def vigente(self) -> bool:
        """
        ¿El pase es válido AHORA? (lo usamos tanto para mostrarlo como para validarlo)
          - Revocado  -> nunca vigente.
          - Visita     -> vigente si aún no ha pasado su fecha de vencimiento.
          - Personal   -> vigente si HOY es uno de sus días permitidos.
        """
        if self.estado != "activo":
            return False
        if self.tipo == "visita":
            return self.valido_hasta is None or self.valido_hasta >= datetime.now()
        if self.tipo == "personal":
            if not self.dias_permitidos:
                return True
            # weekday(): lunes=0 ... domingo=6  (misma convención que el frontend)
            hoy = str(date.today().weekday())
            return hoy in self.dias_permitidos.split(",")
        return False


class Encomienda(Base):
    """
    Módulo 5: el residente ANUNCIA que viene un delivery/encomienda para él
    (ej. PedidosYa, Amazon). El guardia lo ve en la lista de "esperados" y, cuando
    el repartidor llega, lo deja pasar y marca el ingreso. No se queda en la caseta.
    """
    __tablename__ = "encomiendas"

    id = Column(Integer, primary_key=True, index=True)
    residente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # quién la anuncia
    empresa = Column(String, nullable=True)        # ej. "PedidosYa", "Amazon"
    descripcion = Column(String, nullable=True)
    fecha_esperada = Column(Date, nullable=True)

    estado = Column(String, nullable=False, default="en_camino")  # "en_camino" | "ingresado"

    guardia_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)  # quién la dejó entrar
    created_at = Column(DateTime, default=datetime.now)
    hora_ingreso = Column(DateTime, nullable=True)

    # Dos relaciones hacia Usuario: indicamos la columna de cada una.
    residente = relationship("Usuario", foreign_keys=[residente_id])
    guardia = relationship("Usuario", foreign_keys=[guardia_id])
