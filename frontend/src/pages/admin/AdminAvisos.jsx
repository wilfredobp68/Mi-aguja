// ===================================================================
// AdminAvisos.jsx — Módulo 1 (vista admin): publicar y borrar avisos.
//
// Arriba: un formulario para crear un aviso (título, contenido, categoría,
// imagen opcional). Abajo: el feed con todos los avisos y el botón de borrar.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Megaphone } from "lucide-react";
import { api, subirImagen } from "../../api/client";
import { Boton, MensajeError, SkeletonLista, EstadoVacio } from "../../components/UI";
import TarjetaAviso from "../../components/TarjetaAviso";
import HojaInferior from "../../components/HojaInferior";
import { Cascada, CascadaItem } from "../../components/Cascada";

const CATEGORIAS = [
  { valor: "general", texto: "General" },
  { valor: "urgente", texto: "Urgente" },
  { valor: "construccion", texto: "Construcción" },
  { valor: "evento", texto: "Evento" },
  { valor: "mantenimiento", texto: "Mantenimiento" },
];

export default function AdminAvisos() {
  const [avisos, setAvisos] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Campos del formulario
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState("general");
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    api.get("/avisos").then(setAvisos).catch(() => setAvisos([]));
  }
  useEffect(cargar, []);

  async function publicar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      let imagen_url = null;
      if (imagen) {
        const res = await subirImagen(imagen); // primero subimos la foto
        imagen_url = res.url;
      }
      await api.post("/avisos", { titulo, contenido, categoria, imagen_url });
      // Limpiamos el formulario y recargamos el feed.
      setTitulo("");
      setContenido("");
      setCategoria("general");
      setImagen(null);
      setMostrarForm(false);
      cargar();
      toast.success("Aviso publicado");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(aviso) {
    if (!confirm(`¿Borrar el aviso "${aviso.titulo}"?`)) return;
    try {
      await api.borrar(`/avisos/${aviso.id}`);
      cargar();
      toast.success("Aviso eliminado");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-verde">Avisos y comunicados</h1>
        <Boton onClick={() => setMostrarForm(true)}>
          <Plus className="w-5 h-5" />
          Nuevo aviso
        </Boton>
      </div>

      {/* ---------- Formulario para crear aviso (panel deslizable) ---------- */}
      <HojaInferior abierta={mostrarForm} onCerrar={() => setMostrarForm(false)} titulo="Nuevo aviso">
        <form onSubmit={publicar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contenido</label>
              <textarea
                required
                rows={4}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-oro"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.valor} value={c.valor}>
                      {c.texto}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagen(e.target.files[0] || null)}
                  className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-verde file:text-white"
                />
              </div>
            </div>

            <MensajeError mensaje={error} />
            <Boton type="submit" cargando={guardando}>
              Publicar aviso
            </Boton>
          </form>
      </HojaInferior>

      {/* ---------- Feed de avisos ---------- */}
      {avisos === null ? (
        <SkeletonLista />
      ) : avisos.length === 0 ? (
        <EstadoVacio icono={Megaphone} titulo="Aún no hay avisos" descripcion="Publique el primero con el botón de arriba." />
      ) : (
        <Cascada className="space-y-4">
          {avisos.map((a) => (
            <CascadaItem key={a.id}>
              <TarjetaAviso aviso={a} onBorrar={borrar} />
            </CascadaItem>
          ))}
        </Cascada>
      )}
    </div>
  );
}
