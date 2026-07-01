// ===================================================================
// VigilanteSOS.jsx — La alarma de emergencias para el guardia y el admin.
//
// Igual que VigilanteVisitantes, pero para alertas SOS: pregunta al backend
// cada 4 segundos si hay alertas activas. Si las hay, muestra una banda ROJA
// imposible de ignorar con el nombre y la casa del residente, y el botón
// para marcarla como atendida.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Siren, MapPin, Phone } from "lucide-react";
import { api } from "../api/client";
import { Boton } from "./UI";
import { haceCuanto } from "../utils";

const SEGUNDOS_REFRESCO = 4000;

export default function VigilanteSOS() {
  const [alertas, setAlertas] = useState([]);
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    let activo = true;
    async function consultar() {
      try {
        const datos = await api.get("/sos/activas");
        if (activo) setAlertas(datos);
      } catch {
        /* si falla una consulta, reintenta en el próximo ciclo */
      }
    }
    consultar();
    const intervalo = setInterval(consultar, SEGUNDOS_REFRESCO);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  async function atender(alerta) {
    setProcesando(alerta.id);
    try {
      await api.patch(`/sos/${alerta.id}/atender`);
      setAlertas((lista) => lista.filter((a) => a.id !== alerta.id));
      toast.success("Alerta marcada como atendida");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesando(null);
    }
  }

  if (alertas.length === 0) return null;

  return (
    // Banda roja fija arriba del todo: una emergencia manda sobre todo lo demás.
    <div className="sticky top-0 z-50 bg-urgente text-white shadow-lg">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
          <Siren className="w-5 h-5 animate-pulse" />
          Emergencia SOS
        </div>

        {alertas.map((a) => (
          <div key={a.id} className="bg-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-lg font-semibold leading-tight">{a.residente.nombre}</p>
              <p className="text-white/85 text-sm flex items-center gap-3 mt-0.5">
                {a.residente.casa_lote && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {a.residente.casa_lote}
                  </span>
                )}
                <span>{haceCuanto(a.created_at)}</span>
              </p>
              {a.mensaje && <p className="text-white/90 text-sm mt-1">"{a.mensaje}"</p>}
            </div>
            <Boton
              variante="oro"
              cargando={procesando === a.id}
              onClick={() => atender(a)}
            >
              <Phone className="w-5 h-5" />
              Marcar atendida
            </Boton>
          </div>
        ))}
      </div>
    </div>
  );
}
