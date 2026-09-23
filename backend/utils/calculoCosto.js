import { obtenerArancel } from "./aranceles.js";
import { obtenerTipoCambioUSD } from "./tipoCambio.js";

// Calcula el costo total de importación:
// costoTotal = (FOB * cantidad + flete + seguro) * (1 + arancel%) + otrosGastos
// Si la moneda es USD, todo se convierte a CLP con el tipo de cambio vigente.
export async function calcularCostoImportacion(cotizacion) {
  const { precioFOB, cantidad, flete, seguro, otrosGastos, moneda, tipoProducto } =
    cotizacion;

  const arancelPct = obtenerArancel(tipoProducto);

  let tipoCambioUsado = 1;
  let fechaTipoCambio = new Date();

  if (moneda === "USD") {
    const { valor, fecha } = await obtenerTipoCambioUSD();
    tipoCambioUsado = valor;
    fechaTipoCambio = fecha ? new Date(fecha) : new Date();
  }

  const valorMercaderia = precioFOB * cantidad;
  const baseAntesDeArancel = valorMercaderia + (flete || 0) + (seguro || 0);
  const montoArancel = valorMercaderia * arancelPct;
  const costoTotalMonedaOriginal = baseAntesDeArancel + montoArancel + (otrosGastos || 0);

  const costoTotalCLP = costoTotalMonedaOriginal * tipoCambioUsado;
  const precioUnitarioFinalCLP = costoTotalCLP / cantidad;

  // Advertencia si el tipo de cambio tiene más de 24 horas (HDU-02, criterio 2)
  const horasDesdeActualizacion =
    (Date.now() - new Date(fechaTipoCambio).getTime()) / (1000 * 60 * 60);
  const tipoCambioDesactualizado = moneda === "USD" && horasDesdeActualizacion > 24;

  return {
    tipoCambioUsado,
    fechaTipoCambio,
    arancelPctUsado: arancelPct,
    costoTotalCLP: Math.round(costoTotalCLP),
    precioUnitarioFinalCLP: Math.round(precioUnitarioFinalCLP),
    tipoCambioDesactualizado,
  };
}
