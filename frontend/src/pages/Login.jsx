import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("admin_cintac");
  const [password, setPassword] = useState("cintac2026");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const { token, usuario } = await api.login(email, password);
      iniciarSesion(token, usuario);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[340px] flex-col items-center justify-center px-4 text-center">
      <div className="w-full">
        <div className="text-[28px] font-bold tracking-[1px] text-[#e55303]">CINTAC</div>
        <p className="mt-2 text-[13px] text-[#555]">
          Cotizador de flete de importación — acceso Cintac
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="tarjeta mt-5 w-full">
        <div>
          <label htmlFor="email">Usuario</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={cargando} className="btn-primario">
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
