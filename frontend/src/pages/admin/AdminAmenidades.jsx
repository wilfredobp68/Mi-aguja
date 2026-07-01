// ===================================================================
// AdminAmenidades.jsx — Módulo 2 (vista admin): crear y listar amenidades.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Dumbbell, Users, Clock } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, MensajeError, SkeletonLista, EstadoVacio } from "../../components/UI";
import HojaInferior from "../../components/HojaInferior";
import { fotoAmenidad } from "../../utils";

export default function AdminAmenidades() {
  const [amenidades, setAmenidades] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [capacidad, setCapacidad] = useState(10);
  const [apertura, setApertura] = useState("08:00");
  const [cierre, setCierre] = useState("20:00");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    api.get("/amenidades").then(setAmenidades).catch(() => setAmenidades([]));
  }
  useEffect(cargar, []);

  async function crear(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api.post("/amenidades", {
        nombre,
        descripcion,
        capacidad_maxima: Number(capacidad),
        hora_apertura: apertura,
        hora_cierre: cierre,
      });
      setNombre("");
      setDescripcion("");
      setCapacidad(10);
      setMostrarForm(false);
      cargar();
      toast.success("Amenidad creada");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-verde">Amenidades</h1>
        <Boton onClick={() => setMostrarForm(true)}>
          <Plus className="w-5 h-5" />
          Nueva amenidad
        </Boton>
      </div>

      <HojaInferior abierta={mostrarForm} onCerrar={() => setMostrarForm(false)} titulo="Nueva amenidad">
        <form onSubmit={crear} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacidad máxima</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={capacidad}
                  onChange={(e) => setCapacidad(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hora de apertura</label>
                <input
                  type="time"
                  value={apertura}
                  onChange={(e) => setApertura(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora de cierre</label>
                <input
                  type="time"
                  value={cierre}
                  onChange={(e) => setCierre(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
            </div>

            <MensajeError mensaje={error} />
            <Boton type="submit" cargando={guardando}>
              Crear amenidad
            </Boton>
          </form>
      </HojaInferior>

      {amenidades === null ? (
        <SkeletonLista />
      ) : amenidades.length === 0 ? (
        <EstadoVacio icono={Dumbbell} titulo="No hay amenidades" descripcion="Cree la primera con el botón de arriba." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {amenidades.map((a) => {
            const foto = fotoAmenidad(a.nombre);
            return (
              <Tarjeta key={a.id} className="overflow-hidden">
                {/* Foto estilo hotel boutique (o degradado elegante si no hay) */}
                {foto ? (
                  <img src={foto} alt={a.nombre} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-verde to-verde-profundo grid place-items-center">
                    <Dumbbell className="w-10 h-10 text-oro/80" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-verde mb-1">{a.nombre}</h3>
                  {a.descripcion && <p className="text-texto-suave text-sm mb-3">{a.descripcion}</p>}
                  <div className="flex gap-4 text-sm text-texto-suave">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-4 h-4" /> {a.capacidad_maxima} personas
                    </span>
                    <span className="inline-flex items-center gap-1 cifras-tabulares">
                      <Clock className="w-4 h-4" /> {a.hora_apertura} – {a.hora_cierre}
                    </span>
                  </div>
                </div>
              </Tarjeta>
            );
          })}
        </div>
      )}
    </div>
  );
}
