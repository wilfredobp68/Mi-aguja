# 🚀 Publicar Mi Aguja en internet (Render + Neon)

Esta guía te lleva de "funciona en mi compu" a "funciona en internet con https"
usando **planes gratuitos**. Al final tendrás:

- **Backend:** `https://mi-aguja-api.onrender.com` (FastAPI en Render)
- **Frontend:** `https://mi-aguja-web.onrender.com` (React en Render)
- **Base de datos:** PostgreSQL en Neon (gratis, no se borra)

> ⏱️ Tiempo estimado: 30-45 minutos la primera vez.
> 💰 Costo: $0 (planes gratuitos de las tres plataformas).

---

## 🍽️ Para qué sirve cada plataforma (analogía de restaurante)

Antes de meterte a los pasos, esto te ahorra confusión: cada plataforma hace UNA
cosa distinta, y las tres trabajan juntas como un restaurante.

- **GitHub = la bodega central del código.** Guarda la copia maestra de tu
  proyecto en internet. Sirve de respaldo (si tu compu se dañara, el código
  sigue existiendo ahí) y es de donde Render **lee** el código para publicarlo.
  Cuando haces `git push`, mandas tu código del taller (tu compu) a esta bodega.

- **Neon = la memoria de la app (la base de datos).** Aquí viven los **datos**:
  usuarios, reservas, avisos, reportes, votos... todo lo que la gente crea al
  usar la app. En tu compu esa memoria es el archivo `mi_aguja.db`; en la nube
  es PostgreSQL, una base de datos profesional que vive en Neon.
  ¿Por qué separada de Render? Porque Render **borra el disco de su servidor
  en cada actualización**. Si los datos vivieran ahí, cada `git push` borraría
  todas las reservas y usuarios. Neon los guarda aparte, permanentes, pase lo
  que pase con el servidor.

- **Render = el local del restaurante, con dos empleados:**
  - **mi-aguja-api** (el cocinero 🧑‍🍳): una computadora encendida 24/7 corriendo
    tu backend de Python. Recibe peticiones ("dame los avisos", "crea esta
    reserva"), consulta la memoria en Neon, y responde.
  - **mi-aguja-web** (el mesero 🤵): entrega los archivos del frontend (React
    ya compilado) a cada navegador que visita tu URL. No piensa — solo reparte
    la "cara" de la app.

**Cómo fluye todo cuando un residente usa la app:**
```
Celular del residente
   → mi-aguja-web le entrega la app (Render)
   → la app pide datos a mi-aguja-api (Render)
   → la api lee/escribe en la base de datos (Neon)
```

⚠️ **Ojo:** tu compu y la nube tienen memorias SEPARADAS. Si creas una reserva
en la URL pública, NO aparece en tu `localhost` (y viceversa) — localhost usa
el archivo SQLite local, la nube usa Neon. Son dos mundos. Esto es bueno:
puedes experimentar en tu compu sin miedo a romper lo que ven los clientes.

---

## 🔁 Cómo editar la app una vez que ya está publicada

Regla de oro: **la nube nunca se edita directamente — se edita en tu compu y
se "empuja"**. Tu compu es el taller; la nube es la tienda.

```
1. Editamos el código aquí (vos y Claude) → probás en http://localhost:5173
2. Cuando está listo:
     git add -A
     git commit -m "descripción del cambio"
     git push
3. Render detecta el push → reconstruye solo (~5 min)
4. La URL pública ya tiene la nueva versión ✅
```

Eso es todo. Cada `git push` = actualización automática en internet. Los
residentes solo recargan la página (o reabren la app instalada) y ya tienen
lo nuevo. Ni Google ni Apple ni instaladores de por medio.

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

> ✅ **Ya hecho (2026-07-01):** el repo real de Wilfredo es
> `github.com/wilfredobp68/Mi-aguja`. Si alguna vez necesitas re-verificar el
> remoto configurado: `git remote -v`.

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

## Paso 5 — 📱 "Instalarla" en el celular (así la usan los residentes)

Mi Aguja **no se descarga de Play Store ni App Store** (eso es la Fase 2, con la
app nativa). Es una **PWA**: se instala desde el navegador en 10 segundos y queda
con su icono dorado en la pantalla de inicio, a pantalla completa, como cualquier app.

**En Android (Chrome):**
1. Abre la URL de la app en Chrome.
2. Menú `⋮` (arriba a la derecha) → **"Agregar a pantalla de inicio"**
   (o "Instalar app" si Chrome lo ofrece).
3. Listo: aparece el icono de Mi Aguja como una app más.

**En iPhone (Safari):**
1. Abre la URL en Safari.
2. Botón **Compartir** (el cuadrito con flecha, abajo al centro).
3. **"Agregar a pantalla de inicio"** → **Agregar**.

**Para repartirla a los residentes:** manda la URL por el grupo de WhatsApp del
residencial con las dos instrucciones de arriba. Punto de venta para el pitch:
*"sin tiendas, sin esperas de aprobación de Google/Apple, y las actualizaciones
les llegan solas al instante".*

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
