import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/api.js";

export default function Comparar() {
  const [params] = useSearchParams();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const ids = params.get("ids")?.split(",").filter(Boolean) || [];
    if (ids.length < 2) {
      setError("Selecciona al menos dos cotizaciones desde el Historial para compararlas.");
      return;
    }
    api
      .compararCotizaciones(ids)
      .then(setCotizaciones)
      .catch((err) => setError(err.message));
  }, [params]);

  const filas = [
    { etiqueta: "Proveedor", clave: "proveedor" },
    { etiqueta: "País de origen", clave: "paisOrigen" },
    { etiqueta: "Cantidad", clave: "cantidad" },
    { etiqueta: "Estado", clave: "estado" },
    {
      etiqueta: "Costo total",
      clave: "costoTotalCLP",
      formato: (v) => (v ? `$${v.toLocaleString("es-CL")} CLP` : "Sin calcular"),
    },
    {
      etiqueta: "Precio unitario final",
      clave: "precioUnitarioFinalCLP",
      formato: (v) => (v ? `$${v.toLocaleString("es-CL")} CLP` : "Sin calcular"),
    },
  ];

  const vencida = (c) =>
    c.fechaTipoCambio && (Date.now() - new Date(c.fechaTipoCambio).getTime()) / 36e5 > 24;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Comparar cotizaciones</h2>

      {error && <p className="mt-4 text-peligro">{error}</p>}

      {cotizaciones.length > 0 && (
        <div className="tarjeta mt-6 overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-left text-lg">
            <thead>
              <tr>
                <th className="border-b-2 border-acero-claro/30 py-2 pr-4 text-acero">Producto</th>
                {cotizaciones.map((c) => (
                  <th key={c._id} className="border-b-2 border-acero-claro/30 py-2 pr-4 text-acero">
                    {c.producto}
                    {vencida(c) && (
                      <span className="ml-2 block text-sm font-normal text-peligro">
                        Cotización vencida
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.clave}>
                  <td className="border-b border-acero-claro/15 py-2 pr-4 font-medium">
                    {fila.etiqueta}
                  </td>
                  {cotizaciones.map((c) => (
                    <td key={c._id} className="border-b border-acero-claro/15 py-2 pr-4">
                      {fila.formato ? fila.formato(c[fila.clave]) : c[fila.clave] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
