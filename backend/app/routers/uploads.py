"""
uploads.py — Subida simple de imágenes.

  POST /upload  -> recibe una imagen y la guarda en la carpeta "uploads/".
                   Devuelve { "url": "/uploads/abc123.jpg" }.

Lo usan el Módulo 1 (imagen del aviso) y el Módulo 3 (foto del visitante).
Para mantenerlo simple, guardamos los archivos en disco (no en la nube).
"""

import os
import uuid
import shutil

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from .. import models, auth

router = APIRouter(tags=["Imágenes"])

CARPETA_SUBIDAS = "uploads"
EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


@router.post("/upload")
def subir_imagen(
    archivo: UploadFile = File(...),
    usuario: models.Usuario = Depends(auth.get_current_user),  # cualquiera logueado
):
    extension = os.path.splitext(archivo.filename or "")[1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail="Formato no permitido. Usa JPG, PNG, GIF o WEBP.",
        )

    # Nombre único para evitar que dos archivos se pisen.
    nombre_archivo = f"{uuid.uuid4().hex}{extension}"
    ruta = os.path.join(CARPETA_SUBIDAS, nombre_archivo)

    os.makedirs(CARPETA_SUBIDAS, exist_ok=True)
    with open(ruta, "wb") as destino:
        shutil.copyfileobj(archivo.file, destino)

    return {"url": f"/{CARPETA_SUBIDAS}/{nombre_archivo}"}
