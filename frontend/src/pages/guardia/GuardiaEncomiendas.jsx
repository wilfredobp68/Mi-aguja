// ===================================================================
// GuardiaEncomiendas.jsx — Módulo 5 (vista guardia).
//
// Lista en vivo de los deliveries que los residentes anunciaron y que aún no
// han llegado. Cuando el repartidor llega a la aguja, el guardia pulsa
// "Dejar entrar" y la encomienda se marca como ingresada (la lista se refresca
// sola cada 4 segundos para mostrar avisos nuevos).
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Truck, PackageCheck, RefreshCw } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, EstadoVacio } from "../../components/UI";
import { fechaCorta, haceCuanto } from "../../utils";

const SEGUNDOS_REFRESCO = 4000;

export default function GuardiaEncomiendas() {
  const [esperadas, setEsperadas] = useState([]);
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    let activo = true;
    async function consultar() {
      try {
        const datos = await api.get("/encomiendas/esperadas");
        if (activo) setEsperadas(datos);
      } catch {
        /* reintenta en el próximo ciclo */
      }
    }
    consultar();
    const intervalo = setInterval(consultar, SEGUNDOS_REFRESCO);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  async function dejarEntrar(enc) {
    setProcesando(enc.id);
    try {
      await api.patch(`/encomiendas/${enc.id}/ingreso`);
      setEsperadas((lista) => lista.filter((e) => e.id !== enc.id));
      toast.success("Encomienda ingresada");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-verde">Encomiendas esperadas</h1>
        <span className="inline-flex items-center gap-1.5 text-xs text-texto-suave">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          en vivo
        </span>
      </div>
      <p className="text-texto-suave mb-5">Deliveries que los residentes anunciaron. Marca el ingreso al llegar.</p>

      {esperadas.length === 0 ? (
        <EstadoVacio icono={Truck} titulo="No hay encomiendas esperadas" descripcion="Aparecerán aquí cuando un residente anuncie una." />
      ) : (
        <div className="space-y-3">
          {esperadas.map((e) => (
            <Tarjeta key={e.id} className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-alerta/15 text-alerta grid place-items-center">
                <Truck className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-verde">{e.empresa || "Encomienda"}</p>
                <p className="text-sm text-texto-suave truncate">
                  Para {e.residente?.nombre}
                  {e.residente?.casa_lote ? ` (${e.residente.casa_lote})` : ""}
                  {e.descripcion ? ` · ${e.descripcion}` : ""}
                </p>
                <p className="text-xs text-texto-suave">Esperada {fechaCorta(e.fecha_esperada)} · anunciada {haceCuanto(e.created_at)}</p>
              </div>
              <Boton variante="primario" cargando={procesando === e.id} onClick={() => dejarEntrar(e)}>
                <PackageCheck className="w-5 h-5" />
                Dejar entrar
              </Boton>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
