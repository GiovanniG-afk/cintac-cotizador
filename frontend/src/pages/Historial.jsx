import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";

export default function Historial() {
  const [proveedor, setProveedor] = useState("");
  const [producto, setProducto] = useState("");
  const [cotizaciones, setCotizaciones] = useState([]);
  const [error, setError] = useState("");
  const [seleccionadas, setSeleccionadas] = useState([]);

  async function buscar(e) {
    e?.preventDefault();
    setError("");
    try {
      const resultado = await api.listarCotizaciones({ proveedor, producto });
      setCotizaciones(resultado);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  function alternarSeleccion(id) {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Historial de cotizaciones</h2>
      <p className="mt-1 text-lg text-acero-claro">
        Busca por proveedor o producto para revisar cotizaciones anteriores.
      </p>

      <form onSubmit={buscar} className="tarjeta mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="fProveedor">Proveedor</label>
          <input id="fProveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
        </div>
        <div>
          <label htmlFor="fProducto">Producto</label>
          <input id="fProducto" value={producto} onChange={(e) => setProducto(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primario w-full">
            Buscar
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-peligro">{error}</p>}

      {seleccionadas.length >= 2 && (
        <Link
          to={`/comparar?ids=${seleccionadas.join(",")}`}
          className="btn-secundario mt-4 inline-flex"
        >
          Comparar {seleccionadas.length} seleccionadas
        </Link>
      )}

      <div className="mt-6 space-y-4">
        {cotizaciones.length === 0 && (
          <p className="text-acero-claro">No hay cotizaciones registradas con ese filtro.</p>
        )}
        {cotizaciones.map((c) => {
          const vencida =
            c.fechaTipoCambio &&
            (Date.now() - new Date(c.fechaTipoCambio).getTime()) / 36e5 > 24 &&
            c.estado !== "finalizada";
          return (
            <div key={c._id} className="tarjeta flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 !w-auto"
                  checked={seleccionadas.includes(c._id)}
                  onChange={() => alternarSeleccion(c._id)}
                />
                <span>
                  <strong>{c.producto}</strong> — {c.proveedor}
                  <br />
                  <span className="text-sm text-acero-claro">
                    {new Date(c.createdAt).toLocaleDateString("es-CL")} · Estado: {c.estado}
                    {vencida && <span className="ml-2 text-peligro">· Tipo de cambio vencido</span>}
                  </span>
                </span>
              </label>
              {c.costoTotalCLP && (
                <span className="text-lg font-semibold text-acero">
                  ${c.costoTotalCLP.toLocaleString("es-CL")} CLP
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
