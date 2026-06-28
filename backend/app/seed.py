"""
seed.py — Datos de ejemplo (para ver la app funcionando desde el primer día).

Crea usuarios, amenidades, avisos, reservas y visitantes de prueba.
Corre así (desde la carpeta backend, con el venv activado):

    python -m app.seed

Es SEGURO correrlo varias veces: si ya hay datos, no los duplica.
Para empezar de cero: borra el archivo backend/mi_aguja.db y vuelve a correrlo.
"""

from datetime import date, datetime, timedelta

from .database import Base, engine, SessionLocal
from . import models
from .auth import hashear_password


def crear_datos():
    # Aseguramos que las tablas existan.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Si ya hay usuarios, no volvemos a sembrar.
        if db.query(models.Usuario).first():
            print("[i] La base de datos ya tiene datos. No se sembro de nuevo.")
            print("    (Para reiniciar: borra backend/mi_aguja.db y corre 'python -m app.seed')")
            return

        # ─────────────── Usuarios ───────────────
        admin = models.Usuario(
            nombre="Administración Residencial",
            email="admin@miaguja.com",
            hashed_password=hashear_password("admin123"),
            rol="admin",
            telefono="8888-0000",
        )
        ana = models.Usuario(
            nombre="Ana Martínez",
            email="ana@miaguja.com",
            hashed_password=hashear_password("ana123"),
            rol="residente",
            casa_lote="Casa 12",
            telefono="8888-1212",
        )
        carlos = models.Usuario(
            nombre="Carlos López",
            email="carlos@miaguja.com",
            hashed_password=hashear_password("carlos123"),
            rol="residente",
            casa_lote="Casa 27",
            telefono="8888-2727",
        )
        guardia = models.Usuario(
            nombre="Don Pedro (Portería)",
            email="guardia@miaguja.com",
            hashed_password=hashear_password("guardia123"),
            rol="guardia",
            telefono="8888-9999",
        )
        db.add_all([admin, ana, carlos, guardia])
        db.commit()
        for u in (admin, ana, carlos, guardia):
            db.refresh(u)

        # ─────────────── Amenidades ───────────────
        piscina = models.Amenidad(
            nombre="Piscina", descripcion="Piscina principal con área de descanso.",
            capacidad_maxima=20, hora_apertura="08:00", hora_cierre="20:00",
        )
        casa_club = models.Amenidad(
            nombre="Casa Club", descripcion="Salón de eventos para celebraciones.",
            capacidad_maxima=50, hora_apertura="09:00", hora_cierre="22:00",
        )
        cancha = models.Amenidad(
            nombre="Cancha de Tenis", descripcion="Cancha de tenis iluminada.",
            capacidad_maxima=4, hora_apertura="06:00", hora_cierre="21:00",
        )
        gimnasio = models.Amenidad(
            nombre="Gimnasio", descripcion="Gimnasio equipado.",
            capacidad_maxima=10, hora_apertura="05:00", hora_cierre="22:00",
        )
        db.add_all([piscina, casa_club, cancha, gimnasio])
        db.commit()
        for a in (piscina, casa_club, cancha, gimnasio):
            db.refresh(a)

        # ─────────────── Avisos ───────────────
        avisos = [
            models.Aviso(
                titulo="Corte de agua programado",
                contenido="Mañana de 9:00 a.m. a 1:00 p.m. se suspenderá el servicio de agua "
                          "por mantenimiento de la cisterna. Almacene agua con anticipación.",
                categoria="urgente", autor_id=admin.id,
            ),
            models.Aviso(
                titulo="Fiesta de fin de año en la Casa Club",
                contenido="Los esperamos el 31 de diciembre a partir de las 7:00 p.m. "
                          "Habrá música en vivo y cena. ¡Confirme su asistencia!",
                categoria="evento", autor_id=admin.id,
            ),
            models.Aviso(
                titulo="Poda de árboles esta semana",
                contenido="El equipo de jardinería realizará poda en las áreas verdes "
                          "de miércoles a viernes. Disculpe las molestias.",
                categoria="mantenimiento", autor_id=admin.id,
            ),
            models.Aviso(
                titulo="Trabajos de construcción en Casa 30",
                contenido="Se autorizó remodelación en Casa 30. Horario de obra: "
                          "lunes a sábado de 7:00 a.m. a 5:00 p.m.",
                categoria="construccion", autor_id=admin.id,
            ),
            models.Aviso(
                titulo="Recordatorio de cuota de mantenimiento",
                contenido="Le recordamos que la cuota mensual vence el día 5 de cada mes. "
                          "Puede pagar en la administración o por transferencia.",
                categoria="general", autor_id=admin.id,
            ),
        ]
        db.add_all(avisos)

        # ─────────────── Reservas (en distintos estados) ───────────────
        manana = date.today() + timedelta(days=1)
        en_tres_dias = date.today() + timedelta(days=3)
        ayer = date.today() - timedelta(days=1)

        reservas = [
            models.Reserva(
                amenidad_id=piscina.id, residente_id=ana.id, fecha=manana,
                hora_inicio="10:00", hora_fin="12:00", numero_personas=4,
                estado="aprobada", mensaje_admin="¡Aprobada! Disfrute la piscina.",
            ),
            models.Reserva(
                amenidad_id=casa_club.id, residente_id=carlos.id, fecha=en_tres_dias,
                hora_inicio="18:00", hora_fin="22:00", numero_personas=30,
                estado="pendiente",
            ),
            models.Reserva(
                amenidad_id=cancha.id, residente_id=ana.id, fecha=ayer,
                hora_inicio="07:00", hora_fin="08:00", numero_personas=2,
                estado="rechazada", mensaje_admin="La cancha estaba en mantenimiento ese día.",
            ),
        ]
        db.add_all(reservas)

        # ─────────────── Visitantes ───────────────
        visitantes = [
            # Uno ya respondido (autorizado), para que el log y la pantalla del guardia muestren historial.
            models.Visitante(
                nombre="Juan Pérez (mensajería)", visita_a_id=ana.id, guardia_id=guardia.id,
                estado="autorizado",
                hora_registro=datetime.now() - timedelta(hours=2),
                hora_respuesta=datetime.now() - timedelta(hours=2, minutes=-3),
            ),
            # Uno PENDIENTE dirigido a Carlos: al iniciar sesión como Carlos lo verá esperando respuesta.
            models.Visitante(
                nombre="María González (familiar)", visita_a_id=carlos.id, guardia_id=guardia.id,
                estado="pendiente",
                hora_registro=datetime.now(),
            ),
        ]
        db.add_all(visitantes)

        # ─────────────── Pases de acceso (Módulo 4) ───────────────
        pases = [
            # Visita pre-autorizada para Ana, válida por 2 días, código fijo de demo.
            models.Pase(
                residente_id=ana.id, nombre="Roberto (cumpleaños)", tipo="visita",
                codigo="246810", valido_hasta=datetime.now() + timedelta(days=2),
            ),
            # Personal recurrente (doméstica) de Carlos, lunes a viernes (0..4).
            models.Pase(
                residente_id=carlos.id, nombre="Marta Jiménez", tipo="personal",
                codigo="135790", dias_permitidos="0,1,2,3,4", rol_personal="Doméstica",
            ),
        ]
        db.add_all(pases)

        # ─────────────── Encomiendas (Módulo 5) ───────────────
        encomiendas = [
            models.Encomienda(
                residente_id=ana.id, empresa="Amazon", descripcion="Caja mediana",
                fecha_esperada=date.today(), estado="en_camino",
            ),
        ]
        db.add_all(encomiendas)

        db.commit()

        # ─────────────── Resumen / credenciales ───────────────
        print("\n=== Datos de ejemplo creados con exito! ===\n")
        print("Inicia sesion con cualquiera de estas cuentas (correo / contrasena):\n")
        print("  Rol            Correo                 Contrasena")
        print("  -------------  ---------------------  -----------")
        print("  Administrador  admin@miaguja.com      admin123")
        print("  Residente      ana@miaguja.com        ana123")
        print("  Residente      carlos@miaguja.com     carlos123")
        print("  Guardia        guardia@miaguja.com    guardia123")
        print("\nSugerencia: abre la app como 'guardia' en una pestana y como 'carlos' en otra")
        print("para ver el flujo de visitantes en accion.\n")

    finally:
        db.close()


if __name__ == "__main__":
    crear_datos()
