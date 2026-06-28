// ===================================================================
// GuardiaValidar.jsx — Módulo 4 (vista guardia): validar un código.
//
// El visitante o trabajador llega con su código de 6 dígitos (o su QR).
// El guardia lo ESCRIBE aquí y el sistema dice si es válido. Si lo es, el
// acceso queda registrado automáticamente en el log de visitantes.
// Pantalla grande y simple, pensada para la portería.
// ===================================================================

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, KeyRound } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, MensajeError } from "../../components/UI";

export default function GuardiaValidar() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null); // respuesta del backend
  const [error, setError] = useState("");
  const [validando, setValidando] = useState(false);

  async function validar(e) {
    e.preventDefault();
    setError("");
    setResultado(null);
    setValidando(true);
    try {
      const res = await api.post("/pases/validar", { codigo });
      setResultado(res);
      setCodigo(""); // limpiamos para el siguiente
    } catch (err) {
      setError(err.message);
    } finally {
      setValidando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-verde mb-1">Validar código</h1>
      <p className="text-texto-suave mb-5">Escribe el código de 6 dígitos del visitante.</p>

      <Tarjeta className="p-6">
        <form onSubmit={validar} className="space-y-4">
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="w-full text-center text-4xl font-bold tracking-[0.4em] cifras-tabulares
              min-h-20 rounded-2xl border-2 border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
          />
          <MensajeError mensaje={error} />
          <Boton type="submit" cargando={validando} disabled={codigo.length !== 6} className="w-full text-lg min-h-14">
            <KeyRound className="w-6 h-6" />
            Validar
          </Boton>
        </form>
      </Tarjeta>

      {/* ---------- Resultado (aparece con una animación sutil) ---------- */}
      {resultado && (
        <motion.div
          // key cambia con cada resultado, así la animación se reinicia en cada validación
          key={resultado.valido + (resultado.nombre || resultado.motivo || "")}
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`mt-5 rounded-2xl p-6 text-center ${
            resultado.valido ? "bg-exito/10 border-2 border-exito" : "bg-urgente/10 border-2 border-urgente"
          }`}
        >
          {resultado.valido ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.05 }}
              >
                <CheckCircle2 className="w-14 h-14 text-exito mx-auto mb-2" />
              </motion.div>
              <p className="text-2xl font-bold text-exito">Acceso autorizado</p>
              <p className="text-lg text-texto mt-1">{resultado.nombre}</p>
              <p className="text-texto-suave">
                {resultado.tipo === "visita" ? "Visita" : "Personal"} de {resultado.residente?.nombre}
                {resultado.residente?.casa_lote ? ` · ${resultado.residente.casa_lote}` : ""}
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-14 h-14 text-urgente mx-auto mb-2" />
              <p className="text-2xl font-bold text-urgente">No autorizado</p>
              <p className="text-texto-suave mt-1">{resultado.motivo}</p>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
