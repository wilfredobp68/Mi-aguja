# 🌿 Mi Aguja

Aplicación para la **gestión de residenciales cerrados de lujo** en Nicaragua.
"La aguja" es el punto de acceso/portería del residencial — de ahí el nombre.

Tiene **3 tipos de usuario**, cada uno con su propio panel:

| Rol | Qué hace |
|-----|----------|
| 👔 **Administrador** | Publica avisos, crea amenidades, aprueba/rechaza reservas, ve el log de visitantes |
| 🏠 **Residente** | Lee avisos, reserva amenidades, autoriza/rechaza visitantes |
| 💂 **Guardia** | Registra visitantes en la aguja y ve la respuesta del residente en vivo |

Y **3 módulos**:
1. **Avisos y comunicados** (con banner rojo para los urgentes)
2. **Reservas de amenidades** (con disponibilidad por franja horaria)
3. **Control de visitantes** (el guardia registra → el residente responde → el guardia ve la respuesta)

> **Esta es la Fase 1**: backend + web, funcionando de punta a punta con datos de ejemplo.
> La app móvil (React Native) y las notificaciones push reales (Firebase) son la **Fase 2** (ver el final).

---

## 🧰 Tecnologías

- **Backend:** Python + [FastAPI](https://fastapi.tiangolo.com/) + SQLAlchemy + SQLite
- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/) v4
- **Autenticación:** tokens JWT (`PyJWT`) + contraseñas encriptadas (`bcrypt`)

---

## ✅ Requisitos previos

Ya tienes ambos instalados en esta computadora:

- **Python 3.10 o superior** (probado con 3.14) → comprueba con `python --version`
- **Node.js 18 o superior** (probado con 24) → comprueba con `node --version`

> 💡 **Si la terminal dice que `node` o `npm` "no se reconoce":** cierra la terminal y ábrela
> de nuevo (Node ya está instalado, solo necesita que la terminal recargue su configuración).
> Si aun así no funciona, reinicia la computadora una vez.

---

## 📁 Estructura del proyecto

```
mi-aguja/
├── backend/          → la API (FastAPI)
│   ├── app/
│   │   ├── main.py        (arranca la app)
│   │   ├── models.py      (tablas de la base de datos)
│   │   ├── schemas.py     (forma de los datos de la API)
│   │   ├── auth.py        (login, JWT, contraseñas)
│   │   ├── seed.py        (datos de ejemplo)
│   │   └── routers/       (los endpoints de cada módulo)
│   └── requirements.txt
└── frontend/         → la web (React)
    └── src/
        ├── pages/         (las pantallas, organizadas por rol)
        ├── components/    (piezas reutilizables: botones, tarjetas...)
        ├── context/       (la sesión del usuario)
        └── api/client.js  (puente con el backend)
```

---

## 🚀 Cómo correr el proyecto (paso a paso)

Necesitas **dos terminales abiertas a la vez**: una para el backend y otra para el frontend.
Usa **PowerShell** (la terminal de Windows).

### Terminal 1 — Backend (la API)

```powershell
# 1. Entra a la carpeta del backend
cd "C:\Users\maria\OneDrive\Escritorio\Claude Code\mi-aguja\backend"

# 2. Crea el entorno virtual (solo la PRIMERA vez)
python -m venv venv

# 3. Actívalo (esto debes hacerlo CADA vez que abras la terminal)
.\venv\Scripts\Activate.ps1

# 4. Instala las dependencias (solo la PRIMERA vez)
pip install -r requirements.txt

# 5. Carga los datos de ejemplo (solo la PRIMERA vez)
python -m app.seed

# 6. Arranca el servidor
uvicorn app.main:app --reload
```

✅ La API queda corriendo en **http://localhost:8000**
📖 Y puedes ver/probar TODOS los endpoints en **http://localhost:8000/docs**

> Si al activar el venv aparece un error de permisos, ejecuta una vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y responde "S".

### Terminal 2 — Frontend (la web)

```powershell
# 1. Entra a la carpeta del frontend
cd "C:\Users\maria\OneDrive\Escritorio\Claude Code\mi-aguja\frontend"

# 2. Instala las dependencias (solo la PRIMERA vez)
npm install

# 3. Arranca la web
npm run dev
```

✅ La web queda en **http://localhost:5173** — ábrela en tu navegador.

---

## 🔑 Cuentas de prueba

Ya vienen creadas con el seed. En la pantalla de login hay **botones de acceso rápido**,
o puedes escribirlas a mano:

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@miaguja.com` | `admin123` |
| Residente (Ana) | `ana@miaguja.com` | `ana123` |
| Residente (Carlos) | `carlos@miaguja.com` | `carlos123` |
| Guardia | `guardia@miaguja.com` | `guardia123` |

---

## 🧪 Cómo probar cada módulo

### Módulo 1 — Avisos
1. Entra como **Administrador** → pestaña **Avisos** → botón **"Nuevo aviso"**.
2. Escribe un título y contenido, elige categoría **Urgente** y publícalo.
3. Cierra sesión y entra como **Ana** (residente): verás el aviso arriba con **banner rojo**.

### Módulo 2 — Reservas
1. Entra como **Carlos** (residente) → pestaña **Reservar**.
2. Elige una amenidad y una fecha: verás la **disponibilidad por hora** (cupos libres).
3. Elige hora y personas → **Solicitar reserva**. Quedará en "Mis reservas" como *Pendiente*.
4. Entra como **Administrador** → pestaña **Reservas** → **Aprueba o rechaza** (con mensaje).
5. Vuelve como **Carlos** → **Mis reservas**: verás el estado actualizado y el mensaje.

### Módulo 3 — Visitantes (el más vistoso)
> Truco: abre **dos ventanas del navegador** (o una normal y una de incógnito) para ver el flujo en vivo.
1. En una ventana entra como **Guardia** → escribe un visitante, elige **"A quién visita: Carlos"** → **Avisar al residente**.
2. En la otra ventana, ya logueado como **Carlos**, en pocos segundos aparece arriba:
   *"María González pregunta por usted"* con botones **Autorizar / Rechazar**.
3. Pulsa **Autorizar**.
4. Vuelve a la ventana del **Guardia**: la lista "Visitantes de hoy" cambia sola a **Autorizado**.
5. Entra como **Administrador** → pestaña **Visitantes**: verás el **log completo**.

> ⏱️ El "tiempo real" en esta Fase 1 se logra preguntando al servidor cada 4 segundos (*polling*).
> En la Fase 2 se reemplazará por notificaciones push instantáneas.

---

## 🛠️ Solución de problemas

| Problema | Solución |
|----------|----------|
| `node`/`npm` no se reconoce | Cierra y reabre la terminal (o reinicia la PC una vez). |
| "Puerto 8000 en uso" | Hay otra instancia del backend abierta; ciérrala o reinicia la terminal. |
| La web no carga datos | Revisa que la **Terminal 1 (backend)** siga corriendo. |
| Quiero borrar todo y empezar de cero | Borra el archivo `backend/mi_aguja.db` y corre de nuevo `python -m app.seed`. |
| Error de permisos al activar el venv | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## 🔭 Fase 2 (lo que sigue, más adelante)

- 📱 **App móvil** con React Native + Expo (reutilizando la lógica del frontend).
- 🔔 **Notificaciones push reales** con Firebase Cloud Messaging (en vez del polling).
- ☁️ **Publicar en internet**: backend en Railway/Render + base de datos PostgreSQL.

---

Hecho con cariño para residenciales que valoran la seguridad y la elegancia. 🌿
