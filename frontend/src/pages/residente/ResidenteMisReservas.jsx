// ===================================================================
// ResidenteMisReservas.jsx — Módulo 2 (vista residente): historial propio.
//
// Lista las reservas del residente con su estado (pendiente/aprobada/rechazada)
// y, si el admin dejó un mensaje, lo muestra.
// ===================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Clock, Users } from "lucide-react";
import { api } from "../../api/client";
import { Tarjeta, SkeletonLista, EstadoVacio } from "../../components/UI";
import { EtiquetaEstado } from "../../components/Etiquetas";
import { fechaCorta } from "../../utils";

export default function ResidenteMisReservas() {
  const [reservas, setReservas] = useState(null);
  const navegar = useNavigate();

  useEffect(() => {
    api.get("/reservas/mias").then(setReservas).catch(() => setReservas([]));
  }, []);

  if (reservas === null) return <SkeletonLista />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-5">Mis reservas</h1>

      {reservas.length === 0 ? (
        <EstadoVacio
          icono={CalendarCheck}
          titulo="Todavía no tienes reservas"
          descripcion="Reserva la piscina, la casa club u otra amenidad en segundos."
          accion={{ texto: "Reservar una amenidad", onClick: () => navegar("/residente/reservar") }}
        />
      ) : (
        <div className="space-y-4">
          {reservas.map((r) => (
            <Tarjeta key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-verde">{r.amenidad?.nombre}</h3>
                <EtiquetaEstado estado={r.estado} />
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-texto-suave mt-3 cifras-tabulares">
                <span className="inline-flex items-center gap-1">
                  <CalendarCheck className="w-4 h-4" /> {fechaCorta(r.fecha)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {r.hora_inicio}–{r.hora_fin}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-4 h-4" /> {r.numero_personas} personas
                </span>
              </div>

              {r.mensaje_admin && (
                <p className="text-sm mt-3 bg-fondo rounded-xl px-3 py-2">
                  <span className="font-medium">Administración:</span> {r.mensaje_admin}
                </p>
              )}
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
