// ===================================================================
// Cascada.jsx — Hace que una lista aparezca "en cascada" (uno tras otro).
//
// Uso:
//   <Cascada className="space-y-4">
//     {items.map((x) => <CascadaItem key={x.id}>...</CascadaItem>)}
//   </Cascada>
//
// Respeta "menos movimiento" automáticamente (gracias a <MotionConfig> en App.jsx).
// ===================================================================

import { motion } from "framer-motion";

const contenedor = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function Cascada({ children, className = "" }) {
  return (
    <motion.div className={className} variants={contenedor} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

export function CascadaItem({ children, className = "" }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
