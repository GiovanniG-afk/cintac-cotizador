import fetch from "node-fetch";

// mindicador.cl entrega indicadores económicos oficiales de Chile
// (Banco Central), no requiere API key. Lo usamos para el dólar observado.
const MINDICADOR_URL = "https://mindicador.cl/api/dolar";

let cache = { valor: null, fecha: null, obtenidoEn: 0 };
const CACHE_MS = 1000 * 60 * 30; // 30 minutos

export async function obtenerTipoCambioUSD() {
  const ahora = Date.now();
  if (cache.valor && ahora - cache.obtenidoEn < CACHE_MS) {
    return cache;
  }

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
}
