// ===================================================================
// client.js — El "puente" entre el frontend y el backend (la API).
//
// Todas las llamadas a la API pasan por aquí. Ventajas:
//   - Un solo lugar define la dirección del backend (API_BASE).
//   - Adjunta automáticamente el token JWT a cada petición.
//   - Convierte errores del backend en mensajes legibles.
// ===================================================================

// Dirección donde corre el backend de FastAPI.
export const API_BASE = "http://localhost:8000";

// Nombre con el que guardamos el token en el navegador (localStorage).
const CLAVE_TOKEN = "mi_aguja_token";

export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token);
}
export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}
export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN);
}

// Convierte una ruta de imagen del backend ("/uploads/x.jpg") en URL completa.
export function urlImagen(ruta) {
  if (!ruta) return null;
  return ruta.startsWith("http") ? ruta : API_BASE + ruta;
}

// Función interna que hace la petición real con fetch.
// Tiene un timeout de 10 segundos: si el backend no responde, lanza un error
// legible en vez de quedarse colgado para siempre.
async function peticion(ruta, { metodo = "GET", cuerpo, esFormulario = false } = {}) {
  const cabeceras = {};
  const token = obtenerToken();
  if (token) cabeceras["Authorization"] = `Bearer ${token}`;

  let datos;
  if (esFormulario) {
    datos = cuerpo;
  } else if (cuerpo !== undefined) {
    cabeceras["Content-Type"] = "application/json";
    datos = JSON.stringify(cuerpo);
  }

  // AbortController permite cancelar el fetch si tarda más de 10 segundos.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 10000);

  let respuesta;
  try {
    respuesta = await fetch(API_BASE + ruta, {
      method: metodo,
      headers: cabeceras,
      body: datos,
      signal: controlador.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("El servidor tardó demasiado. Verifica que el backend esté corriendo.");
    }
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    // Intentamos leer el mensaje de error que envía el backend.
    let detalle = "Ocurrió un error. Inténtalo de nuevo.";
    try {
      const error = await respuesta.json();
      if (error.detail) detalle = error.detail;
    } catch {
      /* la respuesta no era JSON; usamos el mensaje genérico */
    }
    throw new Error(detalle);
  }

  if (respuesta.status === 204) return null; // "sin contenido" (ej. al borrar)
  return respuesta.json();
}

// Atajos cómodos para usar en los componentes.
export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, cuerpo) => peticion(ruta, { metodo: "POST", cuerpo }),
  patch: (ruta, cuerpo) => peticion(ruta, { metodo: "PATCH", cuerpo }),
  borrar: (ruta) => peticion(ruta, { metodo: "DELETE" }),
};

// Inicio de sesión: el backend espera un formulario con "username" y "password".
export async function iniciarSesionApi(email, password) {
  const formulario = new URLSearchParams();
  formulario.append("username", email); // aquí va el CORREO
  formulario.append("password", password);
  return peticion("/auth/login", { metodo: "POST", cuerpo: formulario, esFormulario: true });
}

// Subir una imagen (foto de visitante o imagen de aviso). Devuelve { url }.
export async function subirImagen(archivo) {
  const formulario = new FormData();
  formulario.append("archivo", archivo);
  return peticion("/upload", { metodo: "POST", cuerpo: formulario, esFormulario: true });
}
