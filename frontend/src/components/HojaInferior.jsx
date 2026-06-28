// ===================================================================
// HojaInferior.jsx — Un "panel deslizable" que sube desde abajo (bottom sheet).
//
// Patrón muy de app moderna: para crear algo (un aviso, un pase...) sube un
// panel en vez de cambiar de página. Se cierra tocando el fondo oscuro o la X.
//
// Uso:
//   <HojaInferior abierta={mostrar} onCerrar={() => setMostrar(false)} titulo="Nuevo aviso">
//     <form>...</form>
//   </HojaInferior>
// ===================================================================

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function HojaInferior({ abierta, onCerrar, titulo, children }) {
  // Mientras el panel está abierto, bloqueamos el scroll del fondo.
  useEffect(() => {
    if (!abierta) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierta]);

  return (
    <AnimatePresence>
      {abierta && (
        <>
          {/* Fondo oscuro (al tocarlo, se cierra) */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCerrar}
          />

          {/* Panel que sube desde abajo */}
          <motion.div
            className="fixed bottom-0 inset-x-0 z-50 bg-superficie rounded-t-3xl max-h-[88dvh] overflow-y-auto shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="max-w-2xl mx-auto p-5">
              {/* "Asita" decorativa arriba */}
              <div className="w-12 h-1.5 bg-black/15 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-verde">{titulo}</h2>
                <button
                  onClick={onCerrar}
                  aria-label="Cerrar"
                  className="p-1 text-texto-suave hover:text-texto transition active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
