import fetch from "node-fetch";
import { TASA_FOB } from "./cotizadorConfig.js";

// El FOB vale lo mismo que el cambio de dólar (1 dólar = TASA_FOB CLP)
// Por defecto usamos TASA_FOB, pero también consultamos mindicador.cl
const MINDICADOR_URL = "https://mindicador.cl/api/dolar";

let cache = { valor: null, fecha: null, obtenidoEn: 0 };
const CACHE_MS = 1000 * 60 * 30; // 30 minutos

export async function obtenerTipoCambioUSD() {
  const ahora = Date.now();
  if (cache.valor && ahora - cache.obtenidoEn < CACHE_MS) {
    return cache;
  }

  try {
    const respuesta = await fetch(MINDICADOR_URL);
    if (!respuesta.ok) {
      throw new Error("No se pudo obtener el tipo de cambio desde mindicador.cl");
    }
    const datos = await respuesta.json();
    const ultimo = datos.serie?.[0];
    if (!ultimo) {
      throw new Error("Respuesta de tipo de cambio sin datos");
    }

    cache = {
      valor: ultimo.valor,
      fecha: ultimo.fecha,
      obtenidoEn: ahora,
    };
    return cache;
  } catch (error) {
    console.warn(
      `No se pudo obtener tipo de cambio de mindicador.cl, usando TASA_FOB: ${TASA_FOB}`
    );
    cache = {
      valor: TASA_FOB,
      fecha: new Date().toISOString(),
      obtenidoEn: ahora,
    };
    return cache;
  }
}

export function obtenerTasaFOB() {
  return TASA_FOB;
}
