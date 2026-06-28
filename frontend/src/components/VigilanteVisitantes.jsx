// ===================================================================
// VigilanteVisitantes.jsx — El "aviso instantáneo" para el residente.
//
// Mientras el residente usa la app, este componente pregunta al backend
// cada 4 segundos: "¿hay alguien en la aguja preguntando por mí?".
// Si aparece un visitante pendiente, muestra una tarjeta grande y llamativa
// con dos botones: AUTORIZAR (verde) o RECHAZAR (rojo).
//
// (En la Fase 2 esto se reemplazará por notificaciones push reales.)
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserRound, Bell } from "lucide-react";
import { api } from "../api/client";
import { urlImagen } from "../api/client";
import { Boton } from "./UI";
import { haceCuanto } from "../utils";

const SEGUNDOS_REFRESCO = 4000;

export default function VigilanteVisitantes() {
  const [pendientes, setPendientes] = useState([]);
  const [procesando, setProcesando] = useState(null); // id del visitante que se está decidiendo

  // Consulta los visitantes pendientes y repite cada 4 segundos.
  useEffect(() => {
    let activo = true;
    async function consultar() {
      try {
        const datos = await api.get("/visitantes/pendientes");
        if (activo) setPendientes(datos);
      } catch {
        /* si falla una consulta, simplemente reintenta en el próximo ciclo */
      }
    }
    consultar();
    const intervalo = setInterval(consultar, SEGUNDOS_REFRESCO);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  async function decidir(visitante, estado) {
    setProcesando(visitante.id);
    try {
      await api.patch(`/visitantes/${visitante.id}`, { estado });
      // Lo quitamos de la lista al instante (sin esperar al próximo refresco).
      setPendientes((lista) => lista.filter((v) => v.id !== visitante.id));
      toast.success(estado === "autorizado" ? "Visitante autorizado" : "Visitante rechazado");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesando(null);
    }
  }

  if (pendientes.length === 0) return null;

  return (
    // Tarjeta fija arriba del todo, imposible de ignorar.
    <div className="sticky top-0 z-40 bg-verde text-white shadow-lg">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 text-oro font-semibold">
          <Bell className="w-5 h-5 animate-pulse" />
          Visitante en la aguja
        </div>

        {pendientes.map((v) => (
          <div key={v.id} className="bg-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              {v.foto_url ? (
                <img src={urlImagen(v.foto_url)} alt={v.nombre} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 grid place-items-center">
                  <UserRound className="w-7 h-7" />
                </div>
              )}
              <div>
                <p className="text-lg font-semibold leading-tight">{v.nombre}</p>
                <p className="text-white/80 text-sm">pregunta por usted · {haceCuanto(v.hora_registro)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Boton variante="oro" cargando={procesando === v.id} onClick={() => decidir(v, "autorizado")}>
                Autorizar
              </Boton>
              <Boton variante="peligro" cargando={procesando === v.id} onClick={() => decidir(v, "rechazado")}>
                Rechazar
              </Boton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
