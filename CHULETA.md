# 📌 Chuleta rápida — Mi Aguja

Guía corta para el día a día. (La guía completa está en [README.md](README.md).)

---

## 🟢 Encender la app (abrir la "tienda")

Necesitas **2 terminales de PowerShell** abiertas a la vez.

**Terminal 1 — Backend** (enciéndela PRIMERO):
```powershell
cd "C:\Users\maria\OneDrive\Escritorio\Claude Code\mi-aguja\backend"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend:**
```powershell
cd "C:\Users\maria\OneDrive\Escritorio\Claude Code\mi-aguja\frontend"
npm run dev
```

Luego abre en el navegador 👉 **http://localhost:5173**

---

## 🔴 Apagar la app

En cada terminal presiona **Ctrl + C** (o cierra la ventana).
No se borra nada: tu código y tus datos quedan guardados.

---

## 🔑 Cuentas de prueba (hay botones de acceso rápido en el login)

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@miaguja.com | admin123 |
| Residente | ana@miaguja.com | ana123 |
| Residente | carlos@miaguja.com | carlos123 |
| Guardia | guardia@miaguja.com | guardia123 |

---

## 🧠 Conceptos en 10 segundos

- **Frontend** (puerto 5173) = las pantallas que ves. Lo enciende `npm run dev`.
- **Backend** (puerto 8000) = guarda y entrega los datos. Lo enciende `uvicorn`.
- **Base de datos** (`backend/mi_aguja.db`) = la "memoria"; guarda usuarios, avisos, reservas...
- Para que la app funcione, **el Frontend y el Backend deben estar encendidos al mismo tiempo.**

---

## 🆘 Problemas comunes

| Si pasa esto... | Haz esto |
|-----------------|----------|
| `localhost:5173` no abre | Revisa que las **2 terminales** sigan corriendo. |
| `node`/`npm` "no se reconoce" | Cierra y reabre la terminal (o reinicia la PC una vez). |
| "Puerto 8000 en uso" | Ya hay un backend abierto; ciérralo o reinicia la terminal. |
| Quiero borrar todo y empezar limpio | Borra `backend\mi_aguja.db`, activa el venv y corre `python -m app.seed`. |
| Error de permisos al activar el venv | Corre una vez: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (responde "S"). |

---

## ⚙️ Solo la PRIMERA vez (NO se repite cada día)

```powershell
# Backend
cd "...\mi-aguja\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed

# Frontend
cd "...\mi-aguja\frontend"
npm install
```
Después de esto, para el día a día usa solo los comandos de **"Encender la app"** de arriba.
