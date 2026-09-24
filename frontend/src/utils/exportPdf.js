import { jsPDF } from "jspdf";

function descargarBlob(contenido, nombreArchivo, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function obtenerFilasCotizacion(cotizacion) {
  return [
    ["Proveedor", cotizacion.proveedor || "-"],
    ["Producto", cotizacion.producto || "-"],
    ["Tipo de producto", cotizacion.tipoProducto || "-"],
    ["País de origen", cotizacion.paisOrigen || "-"],
    ["Cantidad", cotizacion.cantidad ?? "-"],
    ["Precio FOB unitario", `${cotizacion.precioFOB ?? "-"} ${cotizacion.moneda || "USD"}`],
    ["Flete", cotizacion.flete ?? "-"],
    ["Seguro", cotizacion.seguro ?? "-"],
    ["Otros gastos", cotizacion.otrosGastos ?? "-"],
    ["Condición de pago", cotizacion.condicionPago || "-"],
    ["Tipo de cambio usado", cotizacion.tipoCambioUsado ?? "-"],
    ["Arancel aplicado", cotizacion.arancelPctUsado ? `${(cotizacion.arancelPctUsado * 100).toFixed(1)}%` : "-"],
    ["Costo total", `$${Number(cotizacion.costoTotalCLP || 0).toLocaleString("es-CL")} CLP`],
    ["Precio unitario final", `$${Number(cotizacion.precioUnitarioFinalCLP || 0).toLocaleString("es-CL")} CLP`],
  ];
}

export function exportarCotizacion(cotizacion, tipo = "pdf") {
  const nombreBase = `cotizacion-${(cotizacion.producto || "detalle").replace(/\s+/g, "-")}-${cotizacion._id || "sin-id"}`;

  if (tipo === "excel") {
    const filas = obtenerFilasCotizacion(cotizacion);
    const csv = filas
      .map(([key, value]) => `"${String(key).replace(/"/g, '""')}","${String(value).replace(/"/g, '""')}"`)
      .join("\n");
    descargarBlob(csv, `${nombreBase}.csv`, "text/csv;charset=utf-8;");
    return;
  }

  const doc = new jsPDF();
  const clp = (n) => `$${Number(n || 0).toLocaleString("es-CL")} CLP`;

  doc.setFontSize(16);
  doc.text("Cotización de Importación — Cintac", 14, 18);

  doc.setFontSize(11);
  let y = 32;
  const linea = (etiqueta, valor) => {
    doc.text(`${etiqueta}: ${valor ?? "-"}`, 14, y);
    y += 8;
  };

  linea("Proveedor", cotizacion.proveedor);
  linea("Producto", cotizacion.producto);
  linea("Tipo de producto", cotizacion.tipoProducto);
  linea("País de origen", cotizacion.paisOrigen);
  linea("Cantidad", cotizacion.cantidad);
  linea("Precio FOB unitario", `${cotizacion.precioFOB} ${cotizacion.moneda}`);
  linea("Flete", cotizacion.flete);
  linea("Seguro", cotizacion.seguro);
  linea("Otros gastos", cotizacion.otrosGastos);
  linea("Condición de pago", cotizacion.condicionPago);
  y += 4;
  linea("Tipo de cambio usado", cotizacion.tipoCambioUsado ? clp(cotizacion.tipoCambioUsado) : "-");
  linea(
    "Arancel aplicado",
    cotizacion.arancelPctUsado ? `${(cotizacion.arancelPctUsado * 100).toFixed(1)}%` : "-"
  );
  y += 4;
  doc.setFontSize(13);
  doc.text(`Costo total: ${clp(cotizacion.costoTotalCLP)}`, 14, y);
  y += 8;
  doc.text(`Precio unitario final: ${clp(cotizacion.precioUnitarioFinalCLP)}`, 14, y);

  doc.save(`${nombreBase}.pdf`);
}
