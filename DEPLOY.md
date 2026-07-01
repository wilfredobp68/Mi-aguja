# 🚀 Publicar Mi Aguja en internet (Render + Neon)

Esta guía te lleva de "funciona en mi compu" a "funciona en internet con https"
usando **planes gratuitos**. Al final tendrás:

- **Backend:** `https://mi-aguja-api.onrender.com` (FastAPI en Render)
- **Frontend:** `https://mi-aguja-web.onrender.com` (React en Render)
- **Base de datos:** PostgreSQL en Neon (gratis, no se borra)

> ⏱️ Tiempo estimado: 30-45 minutos la primera vez.
> 💰 Costo: $0 (planes gratuitos de las tres plataformas).

---

## Paso 1 — Cuenta de GitHub y subir el código

Render despliega leyendo tu código desde GitHub.

1. Crea una cuenta en [github.com](https://github.com) (si no tienes).
2. Crea un repositorio nuevo: botón **New repository** → nombre `mi-aguja` →
   **Private** (recomendado) → **Create repository** (sin README, el nuestro ya existe).
3. En tu PowerShell, conecta y sube el código (GitHub te muestra estos mismos
   comandos al crear el repo; usa los de "push an existing repository"):

```powershell
cd C:\dev\mi-aguja
git remote add origin https://github.com/TU-USUARIO/mi-aguja.git
git push -u origin main
```

> Si te pide iniciar sesión, se abre el navegador y autorizas. Si algo falla,
> pídele ayuda a Claude con el mensaje de error.

---

## Paso 2 — Base de datos PostgreSQL en Neon

SQLite es un archivo local; en la nube necesitamos PostgreSQL de verdad.
Neon la regala y **no se borra a los 30 días** (la de Render sí).

1. Crea una cuenta en [neon.tech](https://neon.tech) (puedes entrar con GitHub).
2. Crea un proyecto: nombre `mi-aguja`, región la más cercana (US East).
3. En el panel del proyecto busca **Connection string** y copia la URL completa.
   Se ve así: `postgresql://usuario:clave@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Guárdala en un lugar seguro** — la pegarás en Render en el paso 3.

---

## Paso 3 — Desplegar en Render (backend + frontend de un solo golpe)

1. Crea una cuenta en [render.com](https://render.com) (entra con GitHub).
2. En el panel: **New** → **Blueprint**.
3. Conecta tu repositorio `mi-aguja`. Render leerá el archivo `render.yaml`
   y propondrá crear los dos servicios (`mi-aguja-api` y `mi-aguja-web`).
4. Antes de aprobar, te pedirá las variables marcadas como manuales:
   - **`DATABASE_URL`** (en mi-aguja-api): pega la URL de Neon del paso 2.
   - **`VITE_API_URL`** (en mi-aguja-web): déjala vacía por ahora o pon
     `https://mi-aguja-api.onrender.com` (el nombre exacto lo confirma Render).
5. Aprueba (**Apply**). Render construye los dos servicios (~5 minutos).
6. Cuando el backend esté "Live", copia su URL real (ej.
   `https://mi-aguja-api.onrender.com`) y verifica que **`VITE_API_URL`** del
   frontend tenga exactamente esa URL (Settings → Environment → si la cambias,
   dale **Manual Deploy → Deploy latest commit** para recompilar).

---

## Paso 4 — Probar

1. Abre la URL del frontend (ej. `https://mi-aguja-web.onrender.com`).
2. Entra con las cuentas demo de siempre (`ana@miaguja.com` / `ana123`, etc.).
   Los datos demo se siembran solos la primera vez (variable `SEMBRAR_AL_INICIAR`).
3. Prueba el flujo de visitantes con dos pestañas (guardia + Carlos).

---

## ⚠️ Cosas que hay que saber del plan gratuito

| Tema | Detalle |
|------|---------|
| **Arranque en frío** | Si nadie usa la app por 15 min, Render la "duerme". La siguiente visita tarda ~1 minuto en despertar. Para un DEMO: abre la app 2 minutos antes de presentar. |
| **Fotos subidas** | Las imágenes (fotos de visitantes/reportes) se guardan en el disco del servidor y **se pierden en cada redespliegue**. Para el piloto real: migrar a Cloudinary (gratis). Pendiente de Fase 2. |
| **Neon gratis** | 0.5 GB de datos — de sobra para varios residenciales piloto. |
| **Actualizar la app** | Cada `git push` a GitHub redespliega automáticamente. |

---

## Cómo se conecta todo (mapa mental)

```
Navegador del residente
        │  https
        ▼
mi-aguja-web (Render, React estático)
        │  fetch() a VITE_API_URL
        ▼
mi-aguja-api (Render, FastAPI)
        │  DATABASE_URL
        ▼
PostgreSQL (Neon)
```

Para desarrollo local nada cambia: sin variables de entorno, el backend usa
SQLite y el frontend apunta a `http://localhost:8000`, como siempre.
