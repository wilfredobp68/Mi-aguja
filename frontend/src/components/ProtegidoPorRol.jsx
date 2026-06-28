// ===================================================================
// ProtegidoPorRol.jsx — Protege las páginas según quién esté logueado.
//
// - Si todavía estamos comprobando la sesión: muestra "Cargando".
// - Si no hay nadie logueado: manda a /login.
// - Si el rol no coincide con el de la página: lo manda a SU propio panel.
// ===================================================================

import { Navigate } from "react-router-dom";
import { useAuth, rutaSegunRol } from "../context/AuthContext";
import { PantallaCargando } from "./UI";

export default function ProtegidoPorRol({ rol, children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <PantallaCargando texto="Verificando tu sesión..." />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== rol) return <Navigate to={rutaSegunRol(usuario.rol)} replace />;

  return children;
}
