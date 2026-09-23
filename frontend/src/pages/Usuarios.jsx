import React, { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ROLES = ["analista", "jefe_abastecimiento", "administrador"];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  async function cargar() {
    try {
      const resp = await fetch(`${BASE_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const datos = await resp.json();
      if (!resp.ok) throw new Error(datos.error);
      setUsuarios(datos);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarRol(id, rol) {
    await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rol }),
    });
    cargar();
  }

  async function alternarActivo(id, activo) {
    await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ activo: !activo }),
    });
    cargar();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Gestión de usuarios</h2>
      <p className="mt-1 text-lg text-acero-claro">
        Como administrador puedes cambiar el perfil o desactivar el acceso de un usuario.
      </p>

      {error && <p className="mt-4 text-peligro">{error}</p>}

      <div className="mt-6 space-y-4">
        {usuarios.map((u) => (
          <div key={u._id} className="tarjeta flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium">{u.nombre}</p>
              <p className="text-acero-claro">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={u.rol} onChange={(e) => cambiarRol(u._id, e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
              <button
                className="btn-secundario px-4 py-2 text-base"
                onClick={() => alternarActivo(u._id, u.activo)}
              >
                {u.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
