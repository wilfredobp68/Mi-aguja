// ===================================================================
// BarraInferior.jsx — La barra de navegación fija abajo (estilo app de celular).
//
// Siempre visible, con íconos + nombre corto. Resalta la sección actual en
// dorado y muestra un puntito rojo con el número de pendientes cuando aplica.
// Permite saltar entre secciones desde cualquier pantalla con un solo toque.
// ===================================================================

import { NavLink } from "react-router-dom";

export default function BarraInferior({ nav = [], contadores = {} }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-superficie border-t border-black/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-5xl mx-auto flex justify-around overflow-x-auto">
        {nav.map((item) => {
          const pendientes = item.clave ? contadores[item.clave] || 0 : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 min-w-[64px] flex flex-col items-center gap-0.5 py-2 min-h-[56px] justify-center transition ${
                  isActive ? "text-verde" : "text-texto-suave"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`relative grid place-items-center w-11 h-8 rounded-full transition ${
                      isActive ? "bg-oro/25" : ""
                    }`}
                  >
                    <item.icono className="w-5 h-5" />
                    {pendientes > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-urgente text-white text-[10px] font-bold grid place-items-center">
                        {pendientes}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-medium whitespace-nowrap">{item.texto}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
