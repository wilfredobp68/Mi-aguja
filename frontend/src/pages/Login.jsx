// ===================================================================
// Login.jsx — Pantalla de inicio de sesión (versión premium con branding).
//
// Lado de "portada": foto del residencial (si hay en branding.portadaUrl) o un
// fondo verde elegante, con el logo y el nombre del residencial.
// Lado del formulario: correo + contraseña + botones de acceso rápido (demo).
// ===================================================================

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth, rutaSegunRol } from "../context/AuthContext";
import { Boton, MensajeError } from "../components/UI";
import { branding } from "../branding";

const CUENTAS_DEMO = [
  { rol: "Administrador", email: "admin@miaguja.com", password: "admin123" },
  { rol: "Residente (Ana)", email: "ana@miaguja.com", password: "ana123" },
  { rol: "Residente (Carlos)", email: "carlos@miaguja.com", password: "carlos123" },
  { rol: "Guardia", email: "guardia@miaguja.com", password: "guardia123" },
];

export default function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (usuario) return <Navigate to={rutaSegunRol(usuario.rol)} replace />;

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const u = await iniciarSesion(email, password);
      navegar(rutaSegunRol(u.rol), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function usarCuenta(cuenta) {
    setEmail(cuenta.email);
    setPassword(cuenta.password);
    setError("");
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-2">
      {/* ---------- Portada / marca ---------- */}
      <div className="relative min-h-[38dvh] md:min-h-dvh flex flex-col justify-center p-10 text-white overflow-hidden bg-gradient-to-br from-verde to-verde-profundo">
        {/* Foto de portada opcional (con capa oscura para que el texto se lea) */}
        {branding.portadaUrl && (
          <>
            <img src={branding.portadaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-verde-profundo/70" />
          </>
        )}

        <div className="relative">
          {/* Logo */}
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.nombre} className="w-16 h-16 rounded-2xl object-cover mb-5" />
          ) : (
            <span className="w-16 h-16 rounded-full bg-oro grid place-items-center text-verde text-2xl font-bold font-display mb-5">
              {branding.logoTexto}
            </span>
          )}
          <h1 className="font-display text-4xl font-bold mb-2">{branding.nombre}</h1>
          <p className="text-white/85 max-w-sm leading-relaxed">
            {branding.subtitulo} — avisos, reservas de amenidades y control de visitantes, con la
            seguridad y elegancia que su comunidad merece.
          </p>
        </div>
      </div>

      {/* ---------- Formulario ---------- */}
      <div className="flex flex-col justify-center p-6 sm:p-12 min-w-0">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-verde mb-1">Iniciar sesión</h2>
          <p className="text-texto-suave mb-6">Ingrese a su cuenta para continuar.</p>

          <form onSubmit={enviar} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-texto-suave absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usted@correo.com"
                  className="w-full min-h-12 pl-10 pr-3 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-texto-suave absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-12 pl-10 pr-3 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-oro"
                />
              </div>
            </div>

            <MensajeError mensaje={error} />

            <Boton type="submit" cargando={cargando} className="w-full">
              Entrar
            </Boton>
          </form>

          <div className="mt-8">
            <p className="text-xs text-texto-suave text-center mb-3">— Acceso rápido (cuentas de prueba) —</p>
            <div className="grid grid-cols-2 gap-2">
              {CUENTAS_DEMO.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => usarCuenta(c)}
                  className="text-sm border border-verde/20 rounded-xl px-3 py-2 hover:bg-verde/5 transition active:scale-95 min-h-11"
                >
                  {c.rol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
