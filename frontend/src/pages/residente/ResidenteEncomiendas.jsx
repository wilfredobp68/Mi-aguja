// ===================================================================
// ResidenteEncomiendas.jsx — Módulo 5 (vista residente).
//
// El residente AVISA que viene un delivery/encomienda para él (PedidosYa,
// Amazon, etc.). Así el guardia lo deja pasar directo a la casa cuando llega.
// Aquí puede anunciarlo, ver su estado y cancelarlo si todavía viene en camino.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Package, Truck, PackageCheck, Plus, X, CalendarDays } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, MensajeError, SkeletonLista, EstadoVacio } from "../../components/UI";
import HojaInferior from "../../components/HojaInferior";
import { fechaCorta, hoyISO } from "../../utils";

export default function ResidenteEncomiendas() {
  const [encomiendas, setEncomiendas] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [empresa, setEmpresa] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    api.get("/encomiendas/mias").then(setEncomiendas).catch(() => setEncomiendas([]));
  }
  useEffect(cargar, []);

  async function anunciar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api.post("/encomiendas", {
        empresa: empresa || null,
        descripcion: descripcion || null,
        fecha_esperada: fecha,
      });
      setEmpresa("");
      setDescripcion("");
      cargar();
      setMostrarForm(false);
      toast.success("Encomienda anunciada");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cancelar(enc) {
    if (!confirm("¿Cancelar este aviso de encomienda?")) return;
    try {
      await api.borrar(`/encomiendas/${enc.id}`);
      cargar();
      toast.success("Aviso cancelado");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-verde">Encomiendas</h1>
        <Boton onClick={() => setMostrarForm(true)}>
          <Plus className="w-5 h-5" />
          Anunciar
        </Boton>
      </div>
      <p className="text-texto-suave mb-5">
        Avisa que viene un delivery para ti y el guardia lo dejará pasar al llegar.
      </p>

      {/* ---------- Anunciar una encomienda (panel deslizable) ---------- */}
      <HojaInferior abierta={mostrarForm} onCerrar={() => setMostrarForm(false)} titulo="Anunciar encomienda">
        <form onSubmit={anunciar} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Empresa / tienda</label>
              <input
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ej: PedidosYa, Amazon, Hugo"
                className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha esperada</label>
              <input
                type="date"
                min={hoyISO()}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Caja mediana, comida, sobre"
              className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
            />
          </div>

          <MensajeError mensaje={error} />
          <Boton type="submit" cargando={guardando}>
            <Plus className="w-5 h-5" />
            Anunciar encomienda
          </Boton>
        </form>
      </HojaInferior>

      {/* ---------- Mis encomiendas ---------- */}
      <h2 className="text-lg font-bold text-verde mb-3">Mis encomiendas</h2>
      {encomiendas === null ? (
        <SkeletonLista />
      ) : encomiendas.length === 0 ? (
        <EstadoVacio icono={Package} titulo="No has anunciado encomiendas" />
      ) : (
        <div className="space-y-3">
          {encomiendas.map((e) => {
            const enCamino = e.estado === "en_camino";
            return (
              <Tarjeta key={e.id} className="p-4 flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full grid place-items-center ${
                    enCamino ? "bg-alerta/15 text-alerta" : "bg-exito/15 text-exito"
                  }`}
                >
                  {enCamino ? <Truck className="w-5 h-5" /> : <PackageCheck className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-verde">{e.empresa || "Encomienda"}</p>
                  <p className="text-sm text-texto-suave truncate">
                    {e.descripcion ? `${e.descripcion} · ` : ""}
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" /> {fechaCorta(e.fecha_esperada)}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      enCamino ? "bg-alerta/15 text-alerta" : "bg-exito/15 text-exito"
                    }`}
                  >
                    {enCamino ? "En camino" : "Ingresó"}
                  </span>
                  {enCamino && (
                    <button
                      onClick={() => cancelar(e)}
                      className="block mt-1 ml-auto text-xs text-texto-suave hover:text-urgente inline-flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  )}
                </div>
              </Tarjeta>
            );
          })}
        </div>
      )}
    </div>
  );
}
