// ===================================================================
// TarjetaAviso.jsx — Muestra un aviso en el feed.
//
// Los avisos URGENTES se resaltan con un borde y banda roja, para que
// nadie se los pierda. Si tiene `onBorrar`, muestra el botón de eliminar
// (solo lo usa el administrador).
// ===================================================================

import { Trash2 } from "lucide-react";
import { EtiquetaCategoria } from "./Etiquetas";
import { Tarjeta } from "./UI";
import { urlImagen } from "../api/client";
import { fechaHora } from "../utils";

export default function TarjetaAviso({ aviso, onBorrar }) {
  const esUrgente = aviso.categoria === "urgente";

  return (
    <Tarjeta className={`overflow-hidden ${esUrgente ? "ring-2 ring-urgente" : ""}`}>
      {/* Banda roja en la parte superior de los avisos urgentes */}
      {esUrgente && (
        <div className="bg-urgente text-white text-xs font-bold uppercase tracking-wide px-4 py-1.5">
          Aviso urgente
        </div>
      )}

      {aviso.imagen_url && (
        <img src={urlImagen(aviso.imagen_url)} alt={aviso.titulo} className="w-full h-44 object-cover" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <EtiquetaCategoria categoria={aviso.categoria} />
          {onBorrar && (
            <button
              onClick={() => onBorrar(aviso)}
              className="text-texto-suave hover:text-urgente transition p-1"
              aria-label={`Borrar aviso: ${aviso.titulo}`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <h3 className="text-lg font-bold text-verde">{aviso.titulo}</h3>
        <p className="text-texto whitespace-pre-line mt-1">{aviso.contenido}</p>

        <p className="text-xs text-texto-suave mt-3">
          {aviso.autor?.nombre} · {fechaHora(aviso.created_at)}
        </p>
      </div>
    </Tarjeta>
  );
}
