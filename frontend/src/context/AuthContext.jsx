// ===================================================================
// AuthContext.jsx — Maneja la sesión del usuario en TODA la app.
//
// Un "Context" de React es como una caja compartida: cualquier componente
// puede preguntar "¿quién está logueado?" sin pasar datos manualmente.
//
// Expone:
//   usuario        -> el usuario logueado (o null si nadie lo está)
//   cargando       -> true mientras comprobamos la sesión al abrir la app
//   iniciarSesion  -> función para entrar (email + contraseña)
//   cerrarSesion   -> función para salir
// ===================================================================

import { createContext, useContext, useEffect, useState } from "react";
import { api, iniciarSesionApi, guardarToken, borrarToken, obtenerToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app: si hay un token guardado, pedimos al backend quién es.
  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      setCargando(false);
      return;
    }
    api
      .get("/auth/me")
      .then((datos) => setUsuario(datos))
      .catch(() => borrarToken()) // token vencido o inválido
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(email, password) {
    const datos = await iniciarSesionApi(email, password);
    guardarToken(datos.access_token);
    setUsuario(datos.usuario);
    return datos.usuario; // lo devolvemos para saber a qué dashboard ir
  }

  function cerrarSesion() {
    borrarToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

// Atajo para usar el contexto: const { usuario } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}

// Dada una persona, devuelve la ruta de su panel principal.
export function rutaSegunRol(rol) {
  if (rol === "admin") return "/admin";
  if (rol === "residente") return "/residente";
  if (rol === "guardia") return "/guardia";
  return "/login";
}
