// ===================================================================
// ResidenteAccesos.jsx — Módulo 4 (vista residente): pases de acceso.
//
// El residente crea dos tipos de pase:
//   - Visita:   un invitado puntual, válido hasta una fecha/hora.
//   - Personal: alguien recurrente (doméstica, jardinero) válido ciertos días.
// Cada pase trae un código de 6 dígitos y un QR para compartir por WhatsApp.
// El guardia luego ESCRIBE ese código en la aguja para validarlo.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { KeyRound, UserPlus, Trash2, Share2, Clock, CalendarDays } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, MensajeError, SkeletonLista, EstadoVacio } from "../../components/UI";
import HojaInferior from "../../components/HojaInferior";
import { fechaHora } from "../../utils";

// Días de la semana. El número coincide con weekday() de Python: lunes=0 ... domingo=6.
const DIAS = [
  { num: 0, etiqueta: "Lun" },
  { num: 1, etiqueta: "Mar" },
  { num: 2, etiqueta: "Mié" },
  { num: 3, etiqueta: "Jue" },
  { num: 4, etiqueta: "Vie" },
  { num: 5, etiqueta: "Sáb" },
  { num: 6, etiqueta: "Dom" },
];

// Valor por defecto para el campo de fecha/hora límite: mañana a esta hora.
function mananaISO() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  // Formato que entiende <input type="datetime-local">: "YYYY-MM-DDTHH:MM"
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 16);
}

export default function ResidenteAccesos() {
  const [pases, setPases] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false); // abre/cierra el panel deslizable
  const [tipo, setTipo] = useState("visita"); // pestaña del formulario

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [validoHasta, setValidoHasta] = useState(mananaISO());
  const [rol, setRol] = useState("");
  const [dias, setDias] = useState([0, 1, 2, 3, 4]); // por defecto lun-vie
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    api.get("/pases/mios").then(setPases).catch(() => setPases([]));
  }
  useEffect(cargar, []);

  function alternarDia(num) {
    setDias((d) => (d.includes(num) ? d.filter((x) => x !== num) : [...d, num]));
  }

  async function crear(e) {
    e.preventDefault();
    setError("");
    if (tipo === "personal" && dias.length === 0) {
      setError("Elige al menos un día para el personal.");
      return;
    }
    setGuardando(true);
    try {
      const cuerpo =
        tipo === "visita"
          ? { tipo: "visita", nombre, valido_hasta: validoHasta }
          : {
              tipo: "personal",
              nombre,
              rol_personal: rol || null,
              dias_permitidos: [...dias].sort((a, b) => a - b).join(","),
            };
      await api.post("/pases", cuerpo);
      setNombre("");
      setRol("");
      cargar();
      setMostrarForm(false);
      toast.success("Pase creado");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function revocar(pase) {
    if (!confirm(`¿Revocar el pase de "${pase.nombre}"? Su código dejará de funcionar.`)) return;
    try {
      await api.patch(`/pases/${pase.id}/revocar`);
      cargar();
      toast.success("Pase revocado");
    } catch (err) {
      toast.error(err.message);
    }
  }

  function compartirWhatsApp(pase) {
    const texto = `Hola ${pase.nombre}, este es tu código de acceso al residencial (Mi Aguja): ${pase.codigo}. Muéstralo en la entrada.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  }

  function textoDias(csv) {
    if (!csv) return "";
    return csv
      .split(",")
      .map((n) => DIAS.find((d) => d.num === Number(n))?.etiqueta)
      .join(", ");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-verde">Accesos</h1>
        <Boton onClick={() => setMostrarForm(true)}>
          <KeyRound className="w-5 h-5" />
          Nuevo pase
        </Boton>
      </div>
      <p className="text-texto-suave mb-5">
        Crea un código para tus visitas o tu personal. El guardia lo validará en la aguja.
      </p>

      {/* ---------- Formulario para crear un pase (panel deslizable) ---------- */}
      <HojaInferior abierta={mostrarForm} onCerrar={() => setMostrarForm(false)} titulo="Nuevo pase">
        {/* Selector de tipo */}
        <div className="flex gap-2 mb-4">
          {[
            { v: "visita", t: "Visita" },
            { v: "personal", t: "Personal" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setTipo(o.v)}
              className={`flex-1 min-h-11 rounded-xl text-sm font-medium transition ${
                tipo === o.v ? "bg-verde text-white" : "bg-white border border-black/10 text-texto-suave"
              }`}
            >
              {o.t}
            </button>
          ))}
        </div>

        <form onSubmit={crear} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {tipo === "visita" ? "Nombre del invitado" : "Nombre del trabajador"}
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={tipo === "visita" ? "Ej: Roberto Gómez" : "Ej: Marta Jiménez"}
              className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
            />
          </div>

          {tipo === "visita" ? (
            <div>
              <label className="block text-sm font-medium mb-1">Válido hasta</label>
              <input
                type="datetime-local"
                required
                value={validoHasta}
                onChange={(e) => setValidoHasta(e.target.value)}
                className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Rol (opcional)</label>
                <input
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  placeholder="Ej: Doméstica, Jardinero, Chofer"
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Días permitidos</label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((d) => (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => alternarDia(d.num)}
                      className={`min-h-11 w-14 rounded-xl text-sm font-medium transition ${
                        dias.includes(d.num)
                          ? "bg-verde text-white"
                          : "bg-white border border-black/10 text-texto-suave"
                      }`}
                    >
                      {d.etiqueta}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <MensajeError mensaje={error} />
          <Boton type="submit" cargando={guardando}>
            {tipo === "visita" ? <UserPlus className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            Crear pase
          </Boton>
        </form>
      </HojaInferior>

      {/* ---------- Lista de pases ---------- */}
      <h2 className="text-lg font-bold text-verde mb-3">Mis pases</h2>
      {pases === null ? (
        <SkeletonLista />
      ) : pases.length === 0 ? (
        <EstadoVacio
          icono={KeyRound}
          titulo="Aún no tienes pases"
          descripcion="Crea un código para tu próxima visita o tu personal."
          accion={{ texto: "Nuevo pase", onClick: () => setMostrarForm(true) }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pases.map((p) => (
            <Tarjeta key={p.id} className={`p-5 ${!p.vigente ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-oro">
                    {p.tipo === "visita" ? "Visita" : `Personal${p.rol_personal ? " · " + p.rol_personal : ""}`}
                  </span>
                  <h3 className="text-lg font-bold text-verde leading-tight">{p.nombre}</h3>
                </div>
                <button
                  onClick={() => revocar(p)}
                  className="text-texto-suave hover:text-urgente transition p-1"
                  aria-label={`Revocar pase de ${p.nombre}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Código + QR (solo si sigue vigente) */}
              {p.vigente ? (
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl border border-black/5">
                    <QRCodeSVG value={p.codigo} size={84} />
                  </div>
                  <div>
                    <p className="text-xs text-texto-suave">Código</p>
                    <p className="text-2xl font-bold text-verde cifras-tabulares tracking-widest">{p.codigo}</p>
                    <button
                      onClick={() => compartirWhatsApp(p)}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-verde font-medium hover:text-verde-profundo"
                    >
                      <Share2 className="w-4 h-4" /> Compartir por WhatsApp
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-urgente font-medium">
                  {p.estado === "revocado" ? "Revocado" : "Vencido"}
                </p>
              )}

              {/* Detalle de validez */}
              <p className="text-xs text-texto-suave mt-3 flex items-center gap-1">
                {p.tipo === "visita" ? (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Válido hasta {fechaHora(p.valido_hasta)}
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-3.5 h-3.5" /> {textoDias(p.dias_permitidos)}
                  </>
                )}
              </p>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
