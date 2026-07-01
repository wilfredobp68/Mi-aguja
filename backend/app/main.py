"""
main.py — El corazón de la aplicación FastAPI.

Aquí:
  1. Creamos las tablas de la base de datos (si no existen).
  2. Configuramos CORS (para que el frontend pueda hablar con la API).
  3. Servimos la carpeta de imágenes subidas.
  4. Conectamos (incluimos) los routers de cada módulo.

Para correr el servidor (desde la carpeta backend, con el venv activado):
    uvicorn app.main:app --reload

Y abrir la documentación interactiva en:  http://localhost:8000/docs
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import config
from .database import Base, engine
from .routers import (
    auth_router, avisos, reservas, visitantes, uploads, usuarios, pases, encomiendas,
    reportes, sos, encuestas,
)

# 1. Crea las tablas en la base de datos a partir de los modelos (si no existen ya).
#    Para un proyecto de aprendizaje esto es suficiente; en uno grande se usaría
#    una herramienta de migraciones como Alembic.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mi Aguja API",
    description="API para la gestión de residenciales cerrados de lujo. "
                "Módulos: Avisos, Reservas de amenidades y Control de visitantes.",
    version="1.0.0",
)

# 2. CORS: qué páginas web pueden consumir esta API.
#    En desarrollo permitimos CUALQUIER origen, así da igual si Vite usa el
#    puerto 5173, 5174, 5175... La app NO usa cookies (el token JWT viaja en la
#    cabecera Authorization), por eso 'allow_credentials' va en False: eso es lo
#    que permite usar "*" sin problemas.
#    👉 En producción, cambia ["*"] por la lista de tus dominios reales.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Carpeta de imágenes: lo que se sube queda disponible en /uploads/...
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 4. Incluimos los endpoints de cada módulo.
app.include_router(auth_router.router)
app.include_router(usuarios.router)
app.include_router(avisos.router)
app.include_router(reservas.router)
app.include_router(visitantes.router)
app.include_router(pases.router)
app.include_router(encomiendas.router)
app.include_router(reportes.router)
app.include_router(sos.router)
app.include_router(encuestas.router)
app.include_router(uploads.router)


@app.get("/", tags=["Inicio"])
def inicio():
    """Mensaje de bienvenida. Útil para confirmar que la API está viva."""
    return {
        "mensaje": "Bienvenido a la API de Mi Aguja 🌿",
        "documentacion": "Abre /docs en el navegador para ver y probar todos los endpoints",
    }
