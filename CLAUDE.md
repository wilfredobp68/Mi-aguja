# CLAUDE.md — Guía para Claude (Mi Aguja)

> Contexto e instrucciones para trabajar en este proyecto. El tutorial paso a paso para
> humanos está en [README.md](README.md); aquí va lo que Claude necesita para ser eficiente.

## Qué es
App para gestionar **residenciales cerrados de lujo en Nicaragua**. "La aguja" = la portería.
3 roles (**admin**, **residente**, **guardia**) que comparten módulos. Proyecto separado de
CASABELLA (esa es el `index.html` de la carpeta padre — **NO tocar CASABELLA**).

## Preferencias de la dueña (importante)
- Es **programadora principiante que aprende construyendo**. Código **simple y legible**, con
  **comentarios en español**. Nada de abstracciones ingeniosas innecesarias.
- Para features grandes: **proponer el plan y esperar aprobación** antes de programar.
- **Mobile-first** y botones grandes (usuarios mayores, poco técnicos).
- **Nunca quitar sus imágenes** ni romper el look premium. La app se presenta a clientes: el
  aspecto importa tanto como que funcione.

## Stack y gotchas
- **Backend:** FastAPI + SQLAlchemy + SQLite (`backend/mi_aguja.db`), JWT (PyJWT) + bcrypt. Puerto 8000.
- **Frontend:** React 19 + Vite 8 + **Tailwind v4** + React Router 7 + lucide-react + framer-motion +
  react-hot-toast. Puerto 5173.
- **Tailwind v4:** NO hay `tailwind.config.js`. Los tokens están en `frontend/src/index.css` con
  `@theme`. Para agregar un color, se define ahí.
- **`vite.config.js`** tiene `resolve.dedupe: ["react","react-dom"]` — NO quitarlo: evita el
  "Invalid hook call" por React duplicado (lo trae framer-motion).
- **`api/client.js`**: `peticion()` tiene timeout de 10s con `AbortController`. Si el backend no
  responde, lanza error legible en vez de colgarse. No volver a quitar el timeout.
- **fetch sin timeout = spinner infinito**: si agregas llamadas nuevas, deja que el error caiga en
  un `.catch` que muestre estado de error + botón "Reintentar" (ver `ResidenteReservar.jsx`).

## ⚠️ OneDrive (causa raíz de muchos problemas)
Si el proyecto está dentro de OneDrive, la sincronización **mata el proceso de uvicorn** y puede
corromper `mi_aguja.db`. Mitigaciones:
- Correr el backend **sin `--reload`** y **desde la propia PowerShell de la dueña** (los procesos
  en segundo plano de Claude se mueren solos).
- Comando: `uvicorn app.main:app --host 127.0.0.1 --port 8000`
- Si sale error 10048 (puerto ocupado): `Get-Process python | Stop-Process -Force` y relanzar.
- **Solución de fondo (recomendada): mover el proyecto fuera de OneDrive** (ej. `C:\dev\mi-aguja`).

## Cómo correr / verificar
- Backend y frontend: ver [README.md](README.md) (dos terminales PowerShell).
- Para verificar cambios de frontend sin tocar el server de la dueña: `node_modules/vite/bin/vite.js build`
  (compila y detecta errores de sintaxis/imports). El dev server con HMR recarga solo.
- Antes de una demo: confirmar que `http://localhost:8000` responde y que el frontend carga.

## Diseño ("Lujo sereno")
- Colores (tokens en `index.css`): verde `#1B4332`, oro `#C9A84C`, fondo `#FAFAF7`,
  superficie `#FFFFFF`, urgente `#C0392B`, éxito `#2E7D5B`.
- Fuentes: **Playfair Display** (títulos) + **Inter** (cuerpo).
- Gotcha: columnas grid/flex con inputs grandes necesitan `min-w-0` para no desbordar en móvil.

## Arquitectura
- **Rutas y navegación:** `frontend/src/App.jsx`. Por rol hay `SECCIONES_*` (burbujas del Inicio) y
  `NAV_*` (= Inicio + secciones, para la barra inferior). `clave` conecta una sección con su badge.
- **Inicio de cada rol:** `components/MenuInicio.jsx` (burbujas) + `components/ResumenHoy.jsx` (hero).
- **Navegación:** `components/BarraInferior.jsx` (barra fija abajo).
- **Reutilizables:** `components/UI.jsx` (Boton, Tarjeta, EstadoVacio, Skeleton*, MensajeError),
  `components/HojaInferior.jsx` (bottom sheet para formularios), `components/Cascada.jsx`
  (animación de entrada en cascada), `useContadores.js` (badges por polling).
- **Branding configurable:** `src/branding.js` (nombre, subtítulo, logo, portada). Imágenes en
  `frontend/public/`. Para personalizar una demo de cliente, editar ese archivo.
- **Páginas:** `src/pages/<rol>/`. **Puente con la API:** `src/api/client.js`.
- **Helpers:** `src/utils.js` (`fechaCorta`, `fechaHora`, `haceCuanto`, `hoyISO`, `cordobas`,
  `fotoAmenidad` — mapea nombre de amenidad → foto en `public/amenidades/`).
- **Navegación:** la barra inferior lleva máx. 5 ítems por rol (`NAV_* = SECCIONES_*.slice(0,4)`
  en App.jsx); el Inicio muestra TODAS las secciones como burbujas.

## Módulos (estado actual)
1. Avisos/comunicados (banner rojo para urgentes)
2. Reservas de amenidades (disponibilidad por franja; foto hero de la amenidad)
3. Control de visitantes (guardia registra → residente autoriza → guardia ve resultado, polling 4s)
4. Pases de acceso (código 6 dígitos + QR, visita/personal)
5. Encomiendas (residente anuncia delivery → guardia lo deja pasar)
6. **Pagos (VISTA DEMO, solo frontend, sin cobro real)** — agua/luz/cuota casa/fee condominio +
   historial de pagados. El pago es simulación. Cuando se conecte el banco (convenio de
   recaudación) esta pantalla hará el cobro real.
7. Reportes de mantenimiento (residente reporta con foto → admin: recibido/en_proceso/resuelto)
8. Botón SOS (residente dispara → banda roja para guardia/admin vía polling → marcar atendida)
9. Encuestas (admin crea con 2-5 opciones y fecha de cierre → residentes votan 1 vez → barras)

Las imágenes de marca (logo/portada/amenidades) fueron generadas con IA (Higgsfield) y viven en
`frontend/public/` como .webp. La cuenta Higgsfield de la dueña es plan free (1 job a la vez).

## Cuentas de prueba (seed)
`admin@miaguja.com`/`admin123` · `ana@miaguja.com`/`ana123` · `carlos@miaguja.com`/`carlos123` ·
`guardia@miaguja.com`/`guardia123`. Códigos de pase demo: 246810, 135790.

## Fase 2 (no construido)
App móvil React Native + Expo, push con Firebase, deploy en Railway/Render + PostgreSQL.
Detalles en `FASE-2.md`.
