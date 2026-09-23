import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">Cotizador de Importaciones</h1>
        <p className="mt-1 text-lg text-acero-claro">Cintac — Comercio Exterior</p>
      </div>

      <form onSubmit={manejarEnvio} className="tarjeta space-y-5">
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@cintac.cl"
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
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-peligro/10 px-4 py-3 text-peligro">
            {error}
          </p>
        )}

        <button type="submit" disabled={cargando} className="btn-primario w-full">
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center text-base text-acero-claro">
        ¿Primera vez usando el sistema? Pide a un administrador que cree tu cuenta.
      </p>
    </div>
  );
}
