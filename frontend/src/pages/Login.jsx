import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

export default function Login() {
  const [modo, setModo] = useState("login");
  const [identifier, setIdentifier] = useState("Cintac_Admin");
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      if (modo === "registro") {
        const { token, usuario } = await api.registrar({ nombre, username, email, password, rol: "administrador" });
        iniciarSesion(token, usuario);
        navigate("/");
        return;
      }

      const { token, usuario } = await api.login(identifier, password);
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
        {modo === "registro" ? (
          <>
            <div>
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="usuario_cintac"
              />
            </div>

            <div>
              <label htmlFor="emailRegistro">Correo electrónico</label>
              <input
                id="emailRegistro"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="nombre@cintac.cl"
              />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="identifier">Correo o usuario</label>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1"
              placeholder="usuario o nombre@cintac.cl"
            />
          </div>
        )}

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
            placeholder={modo === "registro" ? "Crea una contraseña" : "Contraseña"}
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={cargando} className="btn-primario">
          {cargando ? "Procesando..." : modo === "registro" ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <button
        type="button"
        className="mt-4 text-[13px] text-[#555] underline underline-offset-2"
        onClick={() => {
          setError("");
          setModo((prev) => (prev === "login" ? "registro" : "login"));
        }}
      >
        {modo === "login" ? "Crear una cuenta" : "Volver al inicio de sesión"}
      </button>
    </div>
  );
}
