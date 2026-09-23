import { obtenerTipoCambioUSD } from "../utils/tipoCambio.js";
import { ARANCELES_POR_PRODUCTO } from "../utils/aranceles.js";

export async function obtenerIndicadores(req, res) {
  try {
    const dolar = await obtenerTipoCambioUSD();
    res.json({ dolarObservado: dolar, aranceles: ARANCELES_POR_PRODUCTO });
  } catch (err) {
    res.status(502).json({ error: "No se pudo obtener el tipo de cambio en este momento." });
  }
}
