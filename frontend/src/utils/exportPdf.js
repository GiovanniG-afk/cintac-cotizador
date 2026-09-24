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

function crearHtmlDocumentoCotizacion(cotizacion) {
  const filas = obtenerFilasCotizacion(cotizacion).map(([label, value]) => `<tr><td>${label}</td><td>${String(value)}</td></tr>`).join("");
  return `
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial, sans-serif; color: #0f172a; margin: 24px;">
        <div style="background: #f97316; color: white; padding: 18px 24px; border-radius: 12px; font-weight: 900; font-size: 28px; letter-spacing: 1px; text-align: center;">CINTAC</div>
        <h2 style="margin: 20px 0 10px; color: #f97316;">Cotización de Importación</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          <tbody>${filas}</tbody>
        </table>
      </body>
    </html>
  `;
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

  if (tipo === "word") {
    const html = crearHtmlDocumentoCotizacion(cotizacion);
    descargarBlob(html, `${nombreBase}.doc`, "application/msword;charset=utf-8;");
    return;
  }

  const doc = new jsPDF();
  const clp = (n) => `$${Number(n || 0).toLocaleString("es-CL")} CLP`;

  doc.setFillColor(249, 115, 22);
  doc.rect(0, 0, 220, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("CINTAC", 14, 18);
  doc.setTextColor(15, 23, 42);

  doc.setFontSize(16);
  doc.text("Cotización de Importación", 14, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 56;
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
