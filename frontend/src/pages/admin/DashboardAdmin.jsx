// ===================================================================
// DashboardAdmin.jsx — Inicio del administrador.
//
// Muestra tarjetas-resumen con números rápidos (avisos, reservas pendientes,
// visitantes de hoy) y accesos directos a cada sección.
// ===================================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, CalendarClock, Users, Dumbbell } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Tarjeta, SkeletonLista } from "../../components/UI";

export default function DashboardAdmin() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    // Pedimos varios datos a la vez y armamos el resumen.
    Promise.all([
      api.get("/avisos"),
      api.get("/reservas"),
      api.get("/visitantes/log"),
      api.get("/amenidades"),
    ])
      .then(([avisos, reservas, visitantes, amenidades]) => {
        setDatos({
          avisos: avisos.length,
          reservasPendientes: reservas.filter((r) => r.estado === "pendiente").length,
          visitantesHoy: visitantes.filter(
            (v) => new Date(v.hora_registro).toDateString() === new Date().toDateString()
          ).length,
          amenidades: amenidades.length,
        });
      })
      .catch(() => setDatos({ avisos: 0, reservasPendientes: 0, visitantesHoy: 0, amenidades: 0 }));
  }, []);

  if (!datos) return <SkeletonLista />;

  const tarjetas = [
    { etiqueta: "Avisos publicados", valor: datos.avisos, icono: Megaphone, to: "/admin/avisos" },
    { etiqueta: "Reservas pendientes", valor: datos.reservasPendientes, icono: CalendarClock, to: "/admin/reservas" },
    { etiqueta: "Visitantes hoy", valor: datos.visitantesHoy, icono: Users, to: "/admin/visitantes" },
    { etiqueta: "Amenidades", valor: datos.amenidades, icono: Dumbbell, to: "/admin/amenidades" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-1">Hola, {usuario?.nombre}</h1>
      <p className="text-texto-suave mb-6">Este es el resumen de su residencial.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((t) => (
          <Link key={t.to} to={t.to}>
            <Tarjeta className="p-5 h-full hover:shadow-md transition">
              <t.icono className="w-7 h-7 text-oro mb-3" />
              <p className="text-3xl font-bold text-verde cifras-tabulares">{t.valor}</p>
              <p className="text-sm text-texto-suave mt-1">{t.etiqueta}</p>
            </Tarjeta>
          </Link>
        ))}
      </div>
    </div>
  );
}
