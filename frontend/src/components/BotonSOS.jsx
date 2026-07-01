// ===================================================================
// BotonSOS.jsx — El botón de emergencia del residente (en su Inicio).
//
// Flujo pensado para no dispararse por accidente:
//   1. El residente toca el botón SOS -> se abre una confirmación.
//   2. Confirma -> se crea la alerta y el guardia + admin la ven al instante.
//   3. Mientras la alerta siga activa, el botón muestra "Ayuda en camino".
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Siren, ShieldCheck } from "lucide-react";
import { api } from "../api/client";
import { Boton } from "./UI";

export default function BotonSOS() {
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [activa, setActiva] = useState(false); // ¿tengo una alerta sin atender?

  async function enviar() {
    setEnviando(true);
    try {
      await api.post("/sos", {});
      setActiva(true);
      setConfirmando(false);
      toast.success("Alerta enviada. La portería ya fue notificada.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  }

  // Cuando hay una alerta activa, revisamos cada 5 s si ya la atendieron
  // (la alerta atendida desaparece de /sos/activas... pero ese endpoint es del
  // guardia; para el residente basta con volver el botón a la normalidad tras
  // un rato prudente. Simple y suficiente para la Fase 1).
  useEffect(() => {
    if (!activa) return;
    const temporizador = setTimeout(() => setActiva(false), 90_000);
    return () => clearTimeout(temporizador);
  }, [activa]);

  return (
    <>
      {/* El botón: discreto pero inconfundible */}
      <button
        onClick={() => !activa && setConfirmando(true)}
        className={`w-full rounded-2xl p-4 flex items-center justify-center gap-3 font-semibold transition active:scale-[0.98] ${
          activa
            ? "bg-exito/10 text-exito border border-exito/30"
            : "bg-urgente/10 text-urgente border border-urgente/25 hover:bg-urgente/15"
        }`}
      >
        {activa ? (
          <>
            <ShieldCheck className="w-6 h-6" />
            Alerta enviada — ayuda en camino
          </>
        ) : (
          <>
            <Siren className="w-6 h-6" />
            Botón de emergencia (SOS)
          </>
        )}
      </button>

      {/* Confirmación en el centro de la pantalla */}
      <AnimatePresence>
        {confirmando && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmando(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-1/3 z-50 max-w-sm mx-auto bg-superficie rounded-3xl p-6 text-center shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="w-16 h-16 rounded-full bg-urgente/10 text-urgente grid place-items-center mx-auto mb-3">
                <Siren className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-verde">¿Enviar alerta de emergencia?</h2>
              <p className="text-texto-suave text-sm mt-1 mb-5">
                La portería y la administración serán notificadas de inmediato con su nombre y casa.
              </p>
              <div className="flex gap-2">
                <Boton variante="secundario" className="flex-1" onClick={() => setConfirmando(false)}>
                  Cancelar
                </Boton>
                <Boton variante="peligro" className="flex-1" cargando={enviando} onClick={enviar}>
                  Sí, enviar
                </Boton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
