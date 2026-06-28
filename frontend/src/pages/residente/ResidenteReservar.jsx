// ===================================================================
// ResidenteReservar.jsx — Módulo 2 (vista residente): solicitar una reserva.
//
// Pasos:
//   1. Elegir amenidad y fecha.
//   2. Ver la disponibilidad por franja (cupos libres) en una cuadrícula visual.
//   3. Elegir hora de inicio, hora de fin y número de personas, y solicitar.
//
// La reserva queda "pendiente" hasta que el administrador la apruebe.
// ===================================================================

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarPlus, CheckCircle2, RefreshCw, WifiOff } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, MensajeError, CargandoSeccion } from "../../components/UI";
import { hoyISO } from "../../utils";

export default function ResidenteReservar() {
  const navegar = useNavigate();

  const [amenidades, setAmenidades] = useState([]);
  const [amenidadId, setAmenidadId] = useState("");
  const [fecha, setFecha] = useState(hoyISO());

  const [franjas, setFranjas] = useState(null); // null=cargando, []+=cargado
  const [errorDisponibilidad, setErrorDisponibilidad] = useState(false);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [personas, setPersonas] = useState(1);

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  // 1. Cargar la lista de amenidades al abrir.
  useEffect(() => {
    api.get("/amenidades").then((lista) => {
      setAmenidades(lista);
      if (lista.length > 0) setAmenidadId(String(lista[0].id));
    });
  }, []);

  // 2. Cargar la disponibilidad. Separado en función para poder llamarlo desde "Reintentar".
  const cargarDisponibilidad = useCallback(() => {
    if (!amenidadId) return;
    setFranjas(null);
    setErrorDisponibilidad(false);
    api
      .get(`/amenidades/${amenidadId}/disponibilidad?fecha=${fecha}`)
      .then((datos) => {
        setFranjas(datos);
        if (datos.length > 0) {
          setHoraInicio(datos[0].hora_inicio);
          setHoraFin(datos[Math.min(1, datos.length - 1)].hora_fin);
        }
      })
      .catch(() => {
        // Con el timeout en client.js, este catch ahora sí se activa si el
        // backend no responde. Mostramos error con botón Reintentar en vez de
        // quedarse pegado en el spinner para siempre.
        setFranjas(null);
        setErrorDisponibilidad(true);
      });
  }, [amenidadId, fecha]);

  useEffect(() => {
    cargarDisponibilidad();
  }, [cargarDisponibilidad]);

  async function solicitar(e) {
    e.preventDefault();
    setError("");
    if (horaFin <= horaInicio) {
      setError("La hora de fin debe ser mayor que la de inicio.");
      return;
    }
    setEnviando(true);
    try {
      await api.post("/reservas", {
        amenidad_id: Number(amenidadId),
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        numero_personas: Number(personas),
      });
      setExito(true);
      // Tras 1.5s, llevamos al residente a "Mis reservas".
      setTimeout(() => navegar("/residente/mis-reservas"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  // Pantalla de éxito
  if (exito) {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
        >
          <CheckCircle2 className="w-16 h-16 text-exito mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-verde">¡Solicitud enviada!</h2>
        <p className="text-texto-suave mt-1">Quedó pendiente de aprobación. Le avisaremos.</p>
      </div>
    );
  }

  const amenidadActual = amenidades.find((a) => String(a.id) === amenidadId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-5">Reservar una amenidad</h1>

      <Tarjeta className="p-5 mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amenidad</label>
            <select
              value={amenidadId}
              onChange={(e) => setAmenidadId(e.target.value)}
              className="w-full min-h-12 px-3 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-oro"
            >
              {amenidades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} (máx. {a.capacidad_maxima})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              min={hoyISO()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
            />
          </div>
        </div>
      </Tarjeta>

      {/* ---------- Disponibilidad (cuadrícula visual) ---------- */}
      <h2 className="text-lg font-bold text-verde mb-3">Disponibilidad</h2>
      {errorDisponibilidad ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <WifiOff className="w-10 h-10 text-texto-suave" />
          <p className="text-texto-suave text-sm">No se pudo cargar la disponibilidad.<br />Verifica que el servidor esté encendido.</p>
          <button
            onClick={cargarDisponibilidad}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-verde/10 text-verde font-medium text-sm hover:bg-verde/20 transition"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      ) : franjas === null ? (
        <CargandoSeccion texto="Consultando cupos..." />
      ) : franjas.length === 0 ? (
        <p className="text-texto-suave mb-6">Esta amenidad no tiene horario disponible.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
          {franjas.map((f) => {
            const lleno = f.cupos_disponibles === 0;
            return (
              <div
                key={f.hora_inicio}
                className={`rounded-xl border p-2 text-center cifras-tabulares ${
                  lleno ? "bg-urgente/5 border-urgente/20" : "bg-exito/5 border-exito/20"
                }`}
              >
                <p className="text-sm font-semibold text-texto">{f.hora_inicio}</p>
                <p className={`text-xs ${lleno ? "text-urgente" : "text-exito"}`}>
                  {lleno ? "Lleno" : `${f.cupos_disponibles} libres`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- Formulario de reserva ---------- */}
      {franjas && franjas.length > 0 && (
        <Tarjeta className="p-5">
          <form onSubmit={solicitar} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Desde</label>
                <select
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-oro"
                >
                  {franjas.map((f) => (
                    <option key={f.hora_inicio} value={f.hora_inicio}>
                      {f.hora_inicio}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hasta</label>
                <select
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-oro"
                >
                  {franjas.map((f) => (
                    <option key={f.hora_fin} value={f.hora_fin}>
                      {f.hora_fin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Personas</label>
                <input
                  type="number"
                  min={1}
                  max={amenidadActual?.capacidad_maxima || 99}
                  value={personas}
                  onChange={(e) => setPersonas(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
            </div>

            <MensajeError mensaje={error} />
            <Boton type="submit" cargando={enviando}>
              <CalendarPlus className="w-5 h-5" />
              Solicitar reserva
            </Boton>
          </form>
        </Tarjeta>
      )}
    </div>
  );
}
