"""
encuestas.py — Módulo 9: Encuestas y votaciones de la comunidad.

El admin crea una encuesta con opciones y fecha de cierre. Cada residente vota
UNA sola vez y los resultados se ven en vivo (conteo por opción).

  POST   /encuestas             -> crear encuesta (admin).
  GET    /encuestas             -> listar encuestas con resultados (todos los roles).
  POST   /encuestas/{id}/votar  -> votar una opción (residente, una sola vez).
  DELETE /encuestas/{id}        -> borrar encuesta (admin).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/encuestas", tags=["Módulo 9 · Encuestas"])


def _encuesta_con_resultados(
    encuesta: models.Encuesta, db: Session, usuario_id: int
) -> dict:
    """Arma la respuesta de una encuesta: opciones con conteo, total y mi voto."""
    opciones = []
    total = 0
    for opcion in encuesta.opciones:
        votos = db.query(models.Voto).filter(models.Voto.opcion_id == opcion.id).count()
        total += votos
        opciones.append({"id": opcion.id, "texto": opcion.texto, "votos": votos})

    mi_voto = (
        db.query(models.Voto)
        .filter(
            models.Voto.encuesta_id == encuesta.id,
            models.Voto.usuario_id == usuario_id,
        )
        .first()
    )

    return {
        "id": encuesta.id,
        "pregunta": encuesta.pregunta,
        "descripcion": encuesta.descripcion,
        "cierra_el": encuesta.cierra_el,
        "abierta": encuesta.abierta,
        "created_at": encuesta.created_at,
        "opciones": opciones,
        "total_votos": total,
        "mi_voto": mi_voto.opcion_id if mi_voto else None,
    }


@router.post("", response_model=schemas.EncuestaOut, status_code=status.HTTP_201_CREATED)
def crear_encuesta(
    datos: schemas.EncuestaCrear,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    # Limpiamos opciones vacías y exigimos al menos 2.
    textos = [t.strip() for t in datos.opciones if t.strip()]
    if len(textos) < 2:
        raise HTTPException(status_code=400, detail="La encuesta necesita al menos 2 opciones")

    encuesta = models.Encuesta(
        pregunta=datos.pregunta,
        descripcion=datos.descripcion,
        cierra_el=datos.cierra_el,
        creada_por_id=admin.id,
        opciones=[models.OpcionEncuesta(texto=t) for t in textos],
    )
    db.add(encuesta)
    db.commit()
    db.refresh(encuesta)
    return _encuesta_con_resultados(encuesta, db, admin.id)


@router.get("", response_model=list[schemas.EncuestaOut])
def listar_encuestas(
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(auth.get_current_user),
):
    encuestas = (
        db.query(models.Encuesta)
        .order_by(models.Encuesta.created_at.desc())
        .all()
    )
    return [_encuesta_con_resultados(e, db, usuario.id) for e in encuestas]


@router.post("/{encuesta_id}/votar", response_model=schemas.EncuestaOut)
def votar(
    encuesta_id: int,
    datos: schemas.VotarIn,
    db: Session = Depends(get_db),
    residente: models.Usuario = Depends(auth.requiere_rol("residente")),
):
    encuesta = db.query(models.Encuesta).filter(models.Encuesta.id == encuesta_id).first()
    if not encuesta:
        raise HTTPException(status_code=404, detail="La encuesta no existe")
    if not encuesta.abierta:
        raise HTTPException(status_code=400, detail="Esta encuesta ya cerró")

    # La opción debe pertenecer a ESTA encuesta.
    opcion = (
        db.query(models.OpcionEncuesta)
        .filter(
            models.OpcionEncuesta.id == datos.opcion_id,
            models.OpcionEncuesta.encuesta_id == encuesta.id,
        )
        .first()
    )
    if not opcion:
        raise HTTPException(status_code=400, detail="Esa opción no es de esta encuesta")

    # ¿Ya votó? Solo se permite un voto por persona.
    ya_voto = (
        db.query(models.Voto)
        .filter(
            models.Voto.encuesta_id == encuesta.id,
            models.Voto.usuario_id == residente.id,
        )
        .first()
    )
    if ya_voto:
        raise HTTPException(status_code=400, detail="Ya votaste en esta encuesta")

    db.add(models.Voto(encuesta_id=encuesta.id, opcion_id=opcion.id, usuario_id=residente.id))
    db.commit()
    return _encuesta_con_resultados(encuesta, db, residente.id)


@router.delete("/{encuesta_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_encuesta(
    encuesta_id: int,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(auth.requiere_rol("admin")),
):
    encuesta = db.query(models.Encuesta).filter(models.Encuesta.id == encuesta_id).first()
    if not encuesta:
        raise HTTPException(status_code=404, detail="La encuesta no existe")
    db.delete(encuesta)
    db.commit()
