# 🔭 Fase 2 — Notas para cuando arranquemos (paso a paso)

Resumen de lo que conversamos, para tenerlo a mano. **Nada de esto está construido todavía.**
Cuando empecemos, primero armamos el plan y lo apruebas antes de tocar código.

---

## ¿Qué es la Fase 2?
Pasar de "una web que corre en tu computadora" a "una **app de celular** de verdad, **en internet**, con **avisos push**". Son 3 piezas:

1. **App de celular** (React Native + Expo)
   - Una sola base de código → sirve para **Android y iPhone**.
   - Reutiliza casi todo lo aprendido con React.
   - **Expo** lo hace fácil: ves la app en tu propio celular escaneando un QR (app gratis "Expo Go").

2. **Notificaciones push reales** (Firebase Cloud Messaging — gratis)
   - El aviso suena en el celular **aunque la app esté cerrada** (como WhatsApp).
   - Reemplaza el "polling" cada 4 s que usamos hoy.
   - Flujo: el celular obtiene un *token* de Firebase → lo guarda en nuestro backend → cuando pasa algo (visitante en la aguja), el backend le pide a Firebase que avise a ese celular.

3. **Ponerlo en internet** (Railway o Render + PostgreSQL)
   - El backend deja de vivir solo en tu compu y queda público 24/7 (ej. `https://miaguja.up.railway.app`).
   - La base de datos pasa de **SQLite** (local, para aprender) a **PostgreSQL** (para producción). Dejamos el backend casi listo para ese cambio.

---

## Publicar en las tiendas (Android e iOS)

| | 🤖 Google Play (Android) | 🍎 App Store (iPhone) |
|---|---|---|
| Cuenta de desarrollador | Pago único (~$25 USD) | Suscripción anual (~$99 USD/año) |
| ¿Necesitas Mac? | No | **No** (Expo compila iOS en la nube con EAS Build) |
| Revisión de la tienda | Rápida y flexible | Apple revisa cada app (~1–3 días, más estricto) |
| Probar antes de publicar | Pruebas internas de Google Play | **TestFlight** |

> Montos aproximados — verificar el precio actual al momento de publicar.
> Desarrollar y probar en tus propios celulares es **gratis**. Pagar solo es para publicar.

### ✈️ Qué es TestFlight
App oficial y gratuita de Apple para **probar** la app en iPhones reales **antes** de publicarla.
Invitas testers por correo; ellos instalan "TestFlight" y desde ahí prueban tu app. Cada versión
de prueba dura 90 días. Android tiene su equivalente (pruebas internas/cerradas en Google Play).

---

## 🪜 Orden recomendado (de menos a más)
1. **Subir el backend a internet** (Railway/Render + PostgreSQL) — es la base para que el celular lo alcance.
2. **Crear la app con Expo**, reutilizando las pantallas, apuntando al backend en línea.
3. **Agregar las notificaciones push** (Firebase).
4. (Opcional) **Publicar**: pruebas con TestFlight / Google Play, luego lanzamiento.

## 🎒 Qué preparar (cuentas) cuando empecemos
- Cuenta de **Google** (para Firebase) — ya la tienes. ✅
- Cuenta **gratis** en Railway o Render.
- App **"Expo Go"** (gratis) en tu celular para ver avances.
- Un **iPhone** a mano para probar la versión de iOS (no hace falta Mac).
- *Opcional, solo para publicar:* Google Play (~$25 único) y/o Apple Developer (~$99/año).

---

## ✨ Lo que se reutiliza de lo ya hecho
- El **backend** (FastAPI) sirve casi igual: solo le agregamos el envío de push y cambiamos la base de datos.
- Tu conocimiento de **React** se traslada a **React Native**.
