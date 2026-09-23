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
    <header className="border-b-[4px] border-[#ff4f01] bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="text-[26px] font-bold uppercase tracking-[1px] text-[#e55303]">CINTAC</div>
          <div className="hidden text-sm font-medium text-[#fa8b0f] sm:block">Cotizador de flete de importación</div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-base font-medium text-[#1a1a1a]">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.fin}
              className={({ isActive }) =>
                `${isActive ? "text-[#e55303]" : "text-[#1a1a1a] hover:text-[#e55303]"}`
              }
            >
              {enlace.texto}
            </NavLink>
          ))}
          {usuario.rol === "administrador" && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) =>
                `${isActive ? "text-[#e55303]" : "text-[#1a1a1a] hover:text-[#e55303]"}`
              }
            >
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm text-[#1a1a1a]">
          <span>
            {usuario.nombre} · <span className="italic">{usuario.rol.replace("_", " ")}</span>
          </span>
          <button
            className="btn-secundario px-4 py-2 text-sm"
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
