// ===================================================================
// GuardiaPanel.jsx — Módulo 3 (vista guardia): la pantalla de la portería.
//
// Pensada para ser MUY simple y con botones/letras grandes:
//   - Arriba: formulario para registrar un visitante (nombre, a quién busca,
//     foto opcional).
//   - Abajo: la lista de los visitantes registrados hoy, que se actualiza
//     sola cada 4 segundos para ver, en vivo, si el residente ya respondió.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, UserRound, RefreshCw } from "lucide-react";
import { api, subirImagen, urlImagen } from "../../api/client";
import { Boton, Tarjeta, MensajeError, EstadoVacio } from "../../components/UI";
import { EtiquetaEstado } from "../../components/Etiquetas";
import { haceCuanto } from "../../utils";

const SEGUNDOS_REFRESCO = 4000;

export default function GuardiaPanel() {
  const [residentes, setResidentes] = useState([]);
  const [activos, setActivos] = useState([]);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [residenteId, setResidenteId] = useState("");
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState("");
  const [registrando, setRegistrando] = useState(false);

  // Cargar la lista de residentes (una sola vez).
  useEffect(() => {
    api.get("/usuarios/residentes").then((lista) => {
      setResidentes(lista);
      if (lista.length > 0) setResidenteId(String(lista[0].id));
    });
  }, []);

  // Consultar los visitantes de hoy y repetir cada 4 segundos (para ver respuestas).
  useEffect(() => {
    let activo = true;
    async function consultar() {
      try {
        const datos = await api.get("/visitantes/activos");
        if (activo) setActivos(datos);
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

  async function registrar(e) {
    e.preventDefault();
    setError("");
    setRegistrando(true);
    try {
      let foto_url = null;
      if (foto) {
        const res = await subirImagen(foto);
        foto_url = res.url;
      }
      await api.post("/visitantes", {
        nombre,
        visita_a_id: Number(residenteId),
        foto_url,
      });
      // Limpiamos el formulario y refrescamos la lista al instante.
      setNombre("");
      setFoto(null);
      const datos = await api.get("/visitantes/activos");
      setActivos(datos);
      toast.success("Visitante registrado — avisamos al residente");
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistrando(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* ---------- Registrar visitante ---------- */}
      {/* min-w-0 evita que el contenido (inputs grandes) desborde el ancho en móvil */}
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-verde mb-4">Registrar visitante</h1>
        <Tarjeta className="p-6">
          <form onSubmit={registrar} className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-1">Nombre del visitante</label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full min-h-14 px-4 text-lg rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-1">¿A quién visita?</label>
              <select
                value={residenteId}
                onChange={(e) => setResidenteId(e.target.value)}
                className="w-full min-h-14 px-4 text-lg rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-oro"
              >
                {residentes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                    {r.casa_lote ? ` — ${r.casa_lote}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-medium mb-1">Foto (opcional)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setFoto(e.target.files[0] || null)}
                className="w-full text-sm file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-verde file:text-white"
              />
            </div>

            <MensajeError mensaje={error} />
            <Boton type="submit" cargando={registrando} className="w-full text-lg min-h-14">
              <UserPlus className="w-6 h-6" />
              Avisar al residente
            </Boton>
          </form>
        </Tarjeta>
      </div>

      {/* ---------- Visitantes de hoy (en vivo) ---------- */}
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-verde">Visitantes de hoy</h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-texto-suave">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
            en vivo
          </span>
        </div>

        {activos.length === 0 ? (
          <EstadoVacio icono={UserRound} titulo="Sin visitantes hoy" descripcion="Los que registre aparecerán aquí." />
        ) : (
          <div className="space-y-3">
            {activos.map((v) => (
              <Tarjeta key={v.id} className="p-4 flex items-center gap-3">
                {v.foto_url ? (
                  <img src={urlImagen(v.foto_url)} alt={v.nombre} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-verde/10 grid place-items-center text-verde">
                    <UserRound className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-verde truncate">{v.nombre}</p>
                  <p className="text-sm text-texto-suave truncate">
                    busca a {v.visita_a?.nombre} · {haceCuanto(v.hora_registro)}
                  </p>
                </div>
                <EtiquetaEstado estado={v.estado} />
              </Tarjeta>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
