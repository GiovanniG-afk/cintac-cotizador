import { obtenerArancel } from "./aranceles.js";
import { obtenerTipoCambioUSD } from "./tipoCambio.js";
import {
  obtenerCostoPuerto,
  validarToneladasPorContenedor,
} from "./cotizadorConfig.js";

export async function calcularCostoImportacion(cotizacion) {
  const {
    precioFOB,
    cantidad,
    flete,
    seguro,
    otrosGastos,
    moneda,
    tipoProducto,
    puerto,
    tipoContenedor,
    toneladas,
  } = cotizacion;

  const arancelPct = obtenerArancel(tipoProducto);
  const costoPuerto = puerto && tipoContenedor ? obtenerCostoPuerto(puerto, tipoContenedor) : 0;
  const contenedorValido =
    tipoContenedor && toneladas !== undefined && toneladas !== null
      ? validarToneladasPorContenedor(tipoContenedor, toneladas)
      : true;

  let tipoCambioUsado = 1;
  let fechaTipoCambio = new Date();

  if (moneda === "USD") {
    const { valor, fecha } = await obtenerTipoCambioUSD();
    tipoCambioUsado = valor;
    fechaTipoCambio = fecha ? new Date(fecha) : new Date();
  }

  const valorMercaderia = precioFOB * cantidad;
  const baseAntesDeArancel = valorMercaderia + (flete || 0) + (seguro || 0) + costoPuerto;
  const montoArancel = valorMercaderia * arancelPct;
  const costoTotalMonedaOriginal = baseAntesDeArancel + montoArancel + (otrosGastos || 0);

  const costoTotalCLP = costoTotalMonedaOriginal * tipoCambioUsado;
  const precioUnitarioFinalCLP = costoTotalCLP / cantidad;

  const horasDesdeActualizacion =
    (Date.now() - new Date(fechaTipoCambio).getTime()) / (1000 * 60 * 60);
  const tipoCambioDesactualizado = moneda === "USD" && horasDesdeActualizacion > 24;

  return {
    tipoCambioUsado,
    fechaTipoCambio,
    arancelPctUsado: arancelPct,
    costoPuerto,
    contenedorValido,
    costoTotalCLP: Math.round(costoTotalCLP),
    precioUnitarioFinalCLP: Math.round(precioUnitarioFinalCLP),
    tipoCambioDesactualizado,
  };
}
