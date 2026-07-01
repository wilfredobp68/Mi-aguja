"""
database.py — Conexión a la base de datos con SQLAlchemy.

SQLAlchemy es un "ORM": nos permite trabajar con la base de datos usando clases y
objetos de Python en lugar de escribir SQL a mano. Aquí preparamos 3 cosas:

  1. engine        -> el "motor" que se conecta físicamente a la base de datos.
  2. SessionLocal  -> una fábrica de "sesiones" (cada petición usa una sesión).
  3. Base          -> la clase de la que heredan todos nuestros modelos (tablas).

Y la función get_db(), que entrega una sesión a cada endpoint y la cierra al final.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import config

# Algunos proveedores (como Render) entregan la URL como "postgres://...",
# pero SQLAlchemy espera "postgresql://...". Lo corregimos aquí en silencio.
url_bd = config.DATABASE_URL
if url_bd.startswith("postgres://"):
    url_bd = url_bd.replace("postgres://", "postgresql://", 1)

# SQLite necesita este argumento extra para funcionar bien con FastAPI.
# (Con PostgreSQL no hace falta; por eso lo activamos solo si usamos SQLite.)
connect_args = {"check_same_thread": False} if url_bd.startswith("sqlite") else {}

# pool_pre_ping=True: antes de usar una conexión "vieja", verifica que siga viva.
# Evita errores raros cuando la base de datos en la nube cierra conexiones inactivas.
engine = create_engine(url_bd, connect_args=connect_args, pool_pre_ping=True)

# Cada sesión es una "conversación" temporal con la base de datos.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Todos los modelos (Usuario, Aviso, etc.) heredarán de esta Base.
Base = declarative_base()


def get_db():
    """
    Entrega una sesión de base de datos a un endpoint y se asegura de cerrarla
    al terminar, incluso si ocurre un error. FastAPI usa esto con Depends().
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
