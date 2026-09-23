import { jsPDF } from "jspdf";

export function exportarCotizacionAPDF(cotizacion) {
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

  doc.save(`cotizacion-${cotizacion.producto}-${cotizacion._id}.pdf`);
}
