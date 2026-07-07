// ===================================================================
// Layout.jsx — El "marco" común de todas las páginas (una vez logueado).
//
// Contiene:
//   - La barra superior con la marca "Mi Aguja", el usuario y el botón Salir.
//   - El <Outlet/> dentro de un motion.div: cada cambio de pantalla se anima suave.
//   - La BarraInferior fija abajo (navegación por íconos, siempre visible).
//   - Para el residente, el VigilanteVisitantes (aviso de visitas) arriba.
// ===================================================================

import { Outlet, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useContadores } from "./useContadores";
import VigilanteVisitantes from "./VigilanteVisitantes";
import VigilanteSOS from "./VigilanteSOS";
import BarraInferior from "./BarraInferior";
import { branding } from "../branding";

const NOMBRE_ROL = { admin: "Administración", residente: "Residente", guardia: "Portería" };

export default function Layout({ nav = [], rol }) {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const location = useLocation();
  const contadores = useContadores(rol);

  function salir() {
    cerrarSesion();
    navegar("/login", { replace: true });
  }

  return (
    <div className="min-h-dvh">
      {/* Para el residente: aviso de visitantes siempre visible arriba */}
      {rol === "residente" && <VigilanteVisitantes />}

      {/* Para guardia y admin: la alarma de emergencias SOS (banda roja) */}
      {(rol === "guardia" || rol === "admin") && <VigilanteSOS />}

      {/* ---------- Barra superior ---------- */}
      <header className="bg-verde text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.nombre} className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <span className="w-9 h-9 rounded-full bg-oro grid place-items-center text-verde font-bold font-display">
                {branding.logoTexto}
              </span>
            )}
            <div className="leading-tight">
              <p className="font-display text-xl font-bold">{branding.nombre}</p>
              <p className="text-white/70 text-xs">{NOMBRE_ROL[rol]}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-white/90">{usuario?.nombre}</span>
            <button
              onClick={salir}
              className="inline-flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 transition active:scale-95 rounded-xl px-3 py-2 min-h-11"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Contenido (con transición suave). pb-28 deja espacio para la barra ---------- */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-28">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ---------- Navegación fija abajo ---------- */}
      <BarraInferior nav={nav} contadores={contadores} />
    </div>
  );
}
