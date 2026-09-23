import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext.jsx";

const enlaces = [
  { to: "/", texto: "Inicio", fin: true },
  { to: "/nueva", texto: "Nueva cotización" },
  { to: "/historial", texto: "Historial" },
  { to: "/comparar", texto: "Comparar" },
];

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  return (
    <header className="border-b border-acero-claro/25 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Cotizador de Importaciones</h1>
          <p className="text-sm text-acero-claro">Cintac — productos metalúrgicos</p>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.fin}
              className={({ isActive }) =>
                `text-lg font-medium ${isActive ? "text-ambar" : "text-acero hover:text-ambar"}`
              }
            >
              {enlace.texto}
            </NavLink>
          ))}
          {usuario.rol === "administrador" && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) =>
                `text-lg font-medium ${isActive ? "text-ambar" : "text-acero hover:text-ambar"}`
              }
            >
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-base text-acero-claro">
            {usuario.nombre} · <span className="italic">{usuario.rol.replace("_", " ")}</span>
          </span>
          <button
            className="btn-secundario px-4 py-2 text-base"
            onClick={() => {
              cerrarSesion();
              navigate("/login");
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
