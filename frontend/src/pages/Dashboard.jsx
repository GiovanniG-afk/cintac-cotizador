import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [indicadores, setIndicadores] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .obtenerIndicadores()
      .then(setIndicadores)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Hola, {usuario.nombre}</h2>
      <p className="mt-1 text-lg text-acero-claro">
        Este es tu panel para cotizar importaciones de productos metalúrgicos.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="tarjeta">
          <h3 className="text-lg">Dólar observado hoy</h3>
          {error && <p className="mt-2 text-peligro">{error}</p>}
          {!error && !indicadores && <p className="mt-2 text-acero-claro">Cargando...</p>}
          {indicadores && (
            <p className="mt-2 text-3xl font-display font-semibold text-acero">
              ${indicadores.dolarObservado.valor.toLocaleString("es-CL")}
              <span className="ml-2 text-base font-body font-normal text-acero-claro">CLP</span>
            </p>
          )}
          <p className="mt-2 text-sm text-acero-claro">Fuente: Banco Central (mindicador.cl)</p>
        </div>

        <div className="tarjeta flex flex-col justify-center gap-3">
          <Link to="/nueva" className="btn-primario">
            Registrar nueva cotización
          </Link>
          <Link to="/historial" className="btn-secundario">
            Ver historial de cotizaciones
          </Link>
        </div>
      </div>
    </div>
  );
}
