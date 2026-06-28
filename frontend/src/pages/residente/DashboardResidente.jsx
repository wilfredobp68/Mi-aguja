// ===================================================================
// DashboardResidente.jsx — Inicio del residente: el feed de avisos.
//
// Los avisos llegan ordenados (más nuevos arriba) y los urgentes se ven
// resaltados en rojo. El aviso de visitantes aparece automáticamente en la
// barra superior (lo maneja VigilanteVisitantes dentro del Layout).
// ===================================================================

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { SkeletonLista, EstadoVacio } from "../../components/UI";
import TarjetaAviso from "../../components/TarjetaAviso";
import { Cascada, CascadaItem } from "../../components/Cascada";

export default function DashboardResidente() {
  const { usuario } = useAuth();
  const [avisos, setAvisos] = useState(null);

  useEffect(() => {
    api.get("/avisos").then(setAvisos).catch(() => setAvisos([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-1">Hola, {usuario?.nombre}</h1>
      <p className="text-texto-suave mb-6">
        {usuario?.casa_lote ? `${usuario.casa_lote} · ` : ""}Avisos de su residencial
      </p>

      {avisos === null ? (
        <SkeletonLista />
      ) : avisos.length === 0 ? (
        <EstadoVacio icono={Megaphone} titulo="No hay avisos por ahora" />
      ) : (
        <Cascada className="space-y-4">
          {avisos.map((a) => (
            <CascadaItem key={a.id}>
              <TarjetaAviso aviso={a} />
            </CascadaItem>
          ))}
        </Cascada>
      )}
    </div>
  );
}
