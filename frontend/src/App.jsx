// ===================================================================
// App.jsx — El mapa de rutas de la aplicación.
//
// Cada rol entra a una pantalla de INICIO con burbujas (MenuInicio) y navega
// con la BarraInferior (siempre visible). Cada sección tiene su propia ruta.
//
// `SECCIONES_*` = las secciones del rol (se usan para las burbujas del Inicio).
// `NAV_*`       = Inicio + secciones (se usan para la barra inferior).
// `clave`       = conecta una sección con su contador (badge).
// ===================================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";
import {
  Home, Megaphone, Dumbbell, CalendarCheck, Users, CalendarPlus, KeyRound, Package, ScanLine, Wallet,
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
import FeedAvisosResidente from "./pages/residente/DashboardResidente"; // el feed de avisos
import ResidenteReservar from "./pages/residente/ResidenteReservar";
import ResidenteMisReservas from "./pages/residente/ResidenteMisReservas";
import ResidenteAccesos from "./pages/residente/ResidenteAccesos";
import ResidenteEncomiendas from "./pages/residente/ResidenteEncomiendas";
import ResidentePagos from "./pages/residente/ResidentePagos";
import GuardiaPanel from "./pages/guardia/GuardiaPanel";
import GuardiaValidar from "./pages/guardia/GuardiaValidar";
import GuardiaEncomiendas from "./pages/guardia/GuardiaEncomiendas";

const INICIO = { texto: "Inicio", icono: Home, end: true };

const SECCIONES_ADMIN = [
  { to: "/admin/avisos", texto: "Avisos", icono: Megaphone },
  { to: "/admin/amenidades", texto: "Amenidades", icono: Dumbbell },
  { to: "/admin/reservas", texto: "Reservas", icono: CalendarCheck, clave: "reservasPendientes" },
  { to: "/admin/visitantes", texto: "Visitantes", icono: Users },
  { to: "/admin/encomiendas", texto: "Encomiendas", icono: Package },
];

const SECCIONES_RESIDENTE = [
  { to: "/residente/avisos", texto: "Avisos", icono: Megaphone },
  { to: "/residente/reservar", texto: "Reservar", icono: CalendarPlus },
  { to: "/residente/mis-reservas", texto: "Mis reservas", icono: CalendarCheck },
  { to: "/residente/accesos", texto: "Accesos", icono: KeyRound },
  { to: "/residente/encomiendas", texto: "Encomiendas", icono: Package },
  { to: "/residente/pagos", texto: "Pagos", icono: Wallet },
];

const SECCIONES_GUARDIA = [
  { to: "/guardia/visitantes", texto: "Visitantes", icono: Users },
  { to: "/guardia/validar", texto: "Validar", icono: ScanLine },
  { to: "/guardia/encomiendas", texto: "Encomiendas", icono: Package, clave: "encomiendasEsperadas" },
];

// Barra inferior = Inicio + las secciones del rol.
const NAV_ADMIN = [{ ...INICIO, to: "/admin" }, ...SECCIONES_ADMIN];
const NAV_RESIDENTE = [{ ...INICIO, to: "/residente" }, ...SECCIONES_RESIDENTE];
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
