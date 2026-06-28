// ===================================================================
// MenuInicio.jsx — La pantalla principal de cada rol.
//
// Arriba: una tarjeta de bienvenida (ResumenHoy). Abajo: una cuadrícula de
// "burbujas" (una por sección) que aparecen en cascada, cada una con su ícono,
// nombre y un badge dorado si tiene pendientes.
// ===================================================================

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useContadores } from "./useContadores";
import { Tarjeta } from "./UI";
import ResumenHoy from "./ResumenHoy";
import { Cascada, CascadaItem } from "./Cascada";

export default function MenuInicio({ secciones = [] }) {
  const { usuario } = useAuth();
  const contadores = useContadores(usuario?.rol);

  return (
    <div>
      <ResumenHoy />

      <Cascada className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {secciones.map((s) => {
          const pendientes = s.clave ? contadores[s.clave] || 0 : 0;
          return (
            <CascadaItem key={s.to}>
              <Link to={s.to} className="block h-full">
                <Tarjeta interactiva className="p-5 h-full relative flex flex-col items-center text-center gap-3">
                  {pendientes > 0 && (
                    <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-oro text-verde-profundo text-xs font-bold">
                      {pendientes}
                    </span>
                  )}
                  <span className="w-14 h-14 rounded-2xl bg-verde/10 grid place-items-center text-verde">
                    <s.icono className="w-7 h-7" />
                  </span>
                  <span className="font-semibold text-verde leading-tight">{s.texto}</span>
                </Tarjeta>
              </Link>
            </CascadaItem>
          );
        })}
      </Cascada>
    </div>
  );
}
