"""
config.py — Configuración central de la aplicación.

Aquí guardamos los "ajustes" del backend (dónde está la base de datos, la clave
secreta para los tokens, etc.). Usamos `pydantic-settings`, que lee estos valores
desde un archivo `.env` si existe, y si no, usa los valores por defecto de abajo.

Ventaja: nunca escribimos contraseñas/claves "a mano" dentro del código.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracion(BaseSettings):
    # Lee automáticamente un archivo llamado ".env" (si existe) en esta carpeta.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Base de datos ---
    # Por defecto usamos SQLite: un archivo local llamado "mi_aguja.db".
    # Para producción (más adelante) bastaría con poner aquí la URL de PostgreSQL.
    DATABASE_URL: str = "sqlite:///./mi_aguja.db"

    # --- Seguridad / Tokens JWT ---
    # IMPORTANTE: en producción cambia esta clave por una larga y aleatoria.
    SECRET_KEY: str = "cambia-esta-clave-secreta-en-produccion-por-favor-1234567890"
    ALGORITHM: str = "HS256"                       # Algoritmo estándar para firmar el token
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24     # El token dura 24 horas

    # --- CORS ---
    # Qué direcciones del frontend pueden consumir esta API (Vite usa el puerto 5173).
    # Se escriben separadas por comas.
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"


# Creamos una única instancia de configuración que se importa en todo el proyecto.
config = Configuracion()
