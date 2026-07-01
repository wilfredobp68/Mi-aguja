// ===================================================================
// App.jsx — El mapa de rutas de la aplicación.
//
// Cada rol entra a una pantalla de INICIO con burbujas (MenuInicio) y navega
// con la BarraInferior (siempre visible). Cada sección tiene su propia ruta.
//
// `SECCIONES_*` = TODAS las secciones del rol (burbujas del Inicio).
// `NAV_*`       = Inicio + las secciones MÁS usadas (barra inferior, máx. 5,
//                 como las apps profesionales; el resto vive en el Inicio).
// `clave`       = conecta una sección con su contador (badge).
// ===================================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";
import {
  Home, Megaphone, Dumbbell, CalendarCheck, Users, CalendarPlus, KeyRound, Package, ScanLine,
  Wallet, Wrench, Vote,
} from "lucide-react";

import { AuthProvider } from "./context/AuthContext";
import ProtegidoPorRol from "./components/ProtegidoPorRol";
import Layout from "./components/Layout";
import MenuInicio from "./components/MenuInicio";

// Páginas
import Login from "./pages/Login";
import AdminAvisos from "./pages/admin/AdminAvisos";
import AdminAmenidades from "./pages/admin/AdminAmenidades";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminVisitantes from "./pages/admin/AdminVisitantes";
import AdminEncomiendas from "./pages/admin/AdminEncomiendas";
import AdminReportes from "./pages/admin/AdminReportes";
import AdminEncuestas from "./pages/admin/AdminEncuestas";
import FeedAvisosResidente from "./pages/residente/DashboardResidente"; // el feed de avisos
import ResidenteReservar from "./pages/residente/ResidenteReservar";
import ResidenteMisReservas from "./pages/residente/ResidenteMisReservas";
import ResidenteAccesos from "./pages/residente/ResidenteAccesos";
import ResidenteEncomiendas from "./pages/residente/ResidenteEncomiendas";
import ResidentePagos from "./pages/residente/ResidentePagos";
import ResidenteReportes from "./pages/residente/ResidenteReportes";
import ResidenteEncuestas from "./pages/residente/ResidenteEncuestas";
import GuardiaPanel from "./pages/guardia/GuardiaPanel";
import GuardiaValidar from "./pages/guardia/GuardiaValidar";
import GuardiaEncomiendas from "./pages/guardia/GuardiaEncomiendas";

const INICIO = { texto: "Inicio", icono: Home, end: true };

// ── ADMIN ──
const SECCIONES_ADMIN = [
  { to: "/admin/avisos", texto: "Avisos", icono: Megaphone },
  { to: "/admin/reservas", texto: "Reservas", icono: CalendarCheck, clave: "reservasPendientes" },
  { to: "/admin/reportes", texto: "Reportes", icono: Wrench, clave: "reportesAbiertos" },
  { to: "/admin/encuestas", texto: "Encuestas", icono: Vote },
  { to: "/admin/amenidades", texto: "Amenidades", icono: Dumbbell },
  { to: "/admin/visitantes", texto: "Visitantes", icono: Users },
  { to: "/admin/encomiendas", texto: "Encomiendas", icono: Package },
];
// En la barra: lo que el admin usa a diario. Lo demás, desde el Inicio.
const NAV_ADMIN = [{ ...INICIO, to: "/admin" }, ...SECCIONES_ADMIN.slice(0, 4)];

// ── RESIDENTE ──
const SECCIONES_RESIDENTE = [
  { to: "/residente/avisos", texto: "Avisos", icono: Megaphone },
  { to: "/residente/reservar", texto: "Reservar", icono: CalendarPlus },
  { to: "/residente/accesos", texto: "Accesos", icono: KeyRound },
  { to: "/residente/pagos", texto: "Pagos", icono: Wallet },
  { to: "/residente/mis-reservas", texto: "Mis reservas", icono: CalendarCheck },
  { to: "/residente/encomiendas", texto: "Encomiendas", icono: Package },
  { to: "/residente/reportes", texto: "Reportes", icono: Wrench },
  { to: "/residente/encuestas", texto: "Encuestas", icono: Vote },
];
// En la barra: Avisos, Reservar, Accesos y Pagos. Lo demás, desde el Inicio.
const NAV_RESIDENTE = [{ ...INICIO, to: "/residente" }, ...SECCIONES_RESIDENTE.slice(0, 4)];

// ── GUARDIA ── (son pocas: todas caben en la barra)
const SECCIONES_GUARDIA = [
  { to: "/guardia/visitantes", texto: "Visitantes", icono: Users },
  { to: "/guardia/validar", texto: "Validar", icono: ScanLine },
  { to: "/guardia/encomiendas", texto: "Encomiendas", icono: Package, clave: "encomiendasEsperadas" },
];
const NAV_GUARDIA = [{ ...INICIO, to: "/guardia" }, ...SECCIONES_GUARDIA];

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: "14px", background: "#1B4332", color: "#fff" },
              success: { iconTheme: { primary: "#C9A84C", secondary: "#1B4332" } },
              error: { style: { background: "#C0392B", color: "#fff" } },
            }}
          />

          <Routes>
            <Route path="/login" element={<Login />} />

            {/* ---------- Panel ADMIN ---------- */}
            <Route
              path="/admin"
              element={
                <ProtegidoPorRol rol="admin">
                  <Layout nav={NAV_ADMIN} rol="admin" />
                </ProtegidoPorRol>
              }
            >
              <Route index element={<MenuInicio secciones={SECCIONES_ADMIN} />} />
              <Route path="avisos" element={<AdminAvisos />} />
              <Route path="amenidades" element={<AdminAmenidades />} />
              <Route path="reservas" element={<AdminReservas />} />
              <Route path="visitantes" element={<AdminVisitantes />} />
              <Route path="encomiendas" element={<AdminEncomiendas />} />
              <Route path="reportes" element={<AdminReportes />} />
              <Route path="encuestas" element={<AdminEncuestas />} />
            </Route>

            {/* ---------- Panel RESIDENTE ---------- */}
            <Route
              path="/residente"
              element={
                <ProtegidoPorRol rol="residente">
                  <Layout nav={NAV_RESIDENTE} rol="residente" />
                </ProtegidoPorRol>
              }
            >
              <Route index element={<MenuInicio secciones={SECCIONES_RESIDENTE} />} />
              <Route path="avisos" element={<FeedAvisosResidente />} />
              <Route path="reservar" element={<ResidenteReservar />} />
              <Route path="mis-reservas" element={<ResidenteMisReservas />} />
              <Route path="accesos" element={<ResidenteAccesos />} />
              <Route path="encomiendas" element={<ResidenteEncomiendas />} />
              <Route path="pagos" element={<ResidentePagos />} />
              <Route path="reportes" element={<ResidenteReportes />} />
              <Route path="encuestas" element={<ResidenteEncuestas />} />
            </Route>

            {/* ---------- Panel GUARDIA ---------- */}
            <Route
              path="/guardia"
              element={
                <ProtegidoPorRol rol="guardia">
                  <Layout nav={NAV_GUARDIA} rol="guardia" />
                </ProtegidoPorRol>
              }
            >
              <Route index element={<MenuInicio secciones={SECCIONES_GUARDIA} />} />
              <Route path="visitantes" element={<GuardiaPanel />} />
              <Route path="validar" element={<GuardiaValidar />} />
              <Route path="encomiendas" element={<GuardiaEncomiendas />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  );
}
