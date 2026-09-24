import Cotizacion from "../models/Cotizacion.js";
import { calcularCostoImportacion } from "../utils/calculoCosto.js";
import { getDbMode } from "../config/db.js";
import {
  crearCotizacionMemory,
  buscarCotizacionPorId,
  listarCotizacionesMemory,
  listarCotizacionesPorIdsMemory,
  guardarCotizacionMemory,
} from "../config/fallbackStore.js";

// HDU-01 / RF-01
export async function crearCotizacion(req, res) {
  try {
    const {
      proveedor,
      producto,
      tipoProducto,
      paisOrigen,
      cantidad,
      precioFOB,
      moneda,
      flete,
      seguro,
      otrosGastos,
      condicionPago,
    } = req.body;

    const camposObligatorios = { proveedor, producto, tipoProducto, paisOrigen, cantidad, precioFOB };
    const faltante = Object.entries(camposObligatorios).find(([, v]) => v === undefined || v === "");
    if (faltante) {
      return res.status(400).json({ error: `Falta completar el campo: ${faltante[0]}` });
    }

    if (getDbMode() === "fallback") {
      const cotizacion = await crearCotizacionMemory({
        proveedor,
        producto,
        tipoProducto,
        paisOrigen,
        cantidad,
        precioFOB,
        moneda,
        flete,
        seguro,
        otrosGastos,
        condicionPago,
        creadoPor: req.usuario?.id,
        estado: "en_proceso",
      });
      return res.status(201).json(cotizacion);
    }

    const cotizacion = await Cotizacion.create({
      proveedor,
      producto,
      tipoProducto,
      paisOrigen,
      cantidad,
      precioFOB,
      moneda,
      flete,
      seguro,
      otrosGastos,
      condicionPago,
      creadoPor: req.usuario?.id,
    });

    res.status(201).json(cotizacion);
  } catch (err) {
    res.status(500).json({ error: "No se pudo registrar la cotización." });
  }
}

// HDU-02 / RF-02 / RF-07
export async function calcularCotizacion(req, res) {
  try {
    if (getDbMode() === "fallback") {
      const cotizacion = await buscarCotizacionPorId(req.params.id);
      if (!cotizacion) {
        return res.status(404).json({ error: "Cotización no encontrada." });
      }

      const resultado = await calcularCostoImportacion(cotizacion);
      const cotizacionActualizada = {
        ...cotizacion,
        tipoCambioUsado: resultado.tipoCambioUsado,
        fechaTipoCambio: resultado.fechaTipoCambio,
        arancelPctUsado: resultado.arancelPctUsado,
        costoTotalCLP: resultado.costoTotalCLP,
        precioUnitarioFinalCLP: resultado.precioUnitarioFinalCLP,
        estado: "calculada",
      };
      const guardada = await guardarCotizacionMemory(cotizacionActualizada);

      return res.json({
        cotizacion: guardada,
        advertencia: resultado.tipoCambioDesactualizado
          ? "El tipo de cambio usado tiene más de 24 horas de antigüedad."
          : null,
      });
    }

    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: "Cotización no encontrada." });
    }

    const resultado = await calcularCostoImportacion(cotizacion);

    cotizacion.tipoCambioUsado = resultado.tipoCambioUsado;
    cotizacion.fechaTipoCambio = resultado.fechaTipoCambio;
    cotizacion.arancelPctUsado = resultado.arancelPctUsado;
    cotizacion.costoTotalCLP = resultado.costoTotalCLP;
    cotizacion.precioUnitarioFinalCLP = resultado.precioUnitarioFinalCLP;
    cotizacion.estado = "calculada";
    await cotizacion.save();

    res.json({
      cotizacion,
      advertencia: resultado.tipoCambioDesactualizado
        ? "El tipo de cambio usado tiene más de 24 horas de antigüedad."
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo calcular la cotización. Intenta nuevamente." });
  }
}

// HDU-04 / RF-04: historial filtrable por proveedor y producto
export async function listarCotizaciones(req, res) {
  const { proveedor, producto } = req.query;
  const filtro = {};
  if (proveedor) filtro.proveedor = String(proveedor);
  if (producto) filtro.producto = String(producto);

  if (getDbMode() === "fallback") {
    return res.json(await listarCotizacionesMemory(filtro));
  }

  if (proveedor) filtro.proveedor = new RegExp(proveedor, "i");
  if (producto) filtro.producto = new RegExp(producto, "i");

  const cotizaciones = await Cotizacion.find(filtro).sort({ createdAt: -1 });
  res.json(cotizaciones);
}

export async function obtenerCotizacion(req, res) {
  if (getDbMode() === "fallback") {
    const cotizacion = await buscarCotizacionPorId(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: "Cotización no encontrada." });
    }
    return res.json(cotizacion);
  }

  const cotizacion = await Cotizacion.findById(req.params.id);
  if (!cotizacion) {
    return res.status(404).json({ error: "Cotización no encontrada." });
  }
  res.json(cotizacion);
}

// HDU-03 / RF-03: comparar dos o más cotizaciones del mismo producto
export async function compararCotizaciones(req, res) {
  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ error: "Debes indicar al menos dos IDs para comparar." });
  }
  const listaIds = ids.split(",").filter(Boolean);
  if (listaIds.length < 2) {
    return res.status(400).json({ error: "Selecciona al menos dos cotizaciones para comparar." });
  }

  if (getDbMode() === "fallback") {
    return res.json(await listarCotizacionesPorIdsMemory(listaIds));
  }

  const cotizaciones = await Cotizacion.find({ _id: { $in: listaIds } });
  res.json(cotizaciones);
}

// HDU-05 / RF-05: marcar como finalizada (requisito previo para exportar)
export async function finalizarCotizacion(req, res) {
  if (getDbMode() === "fallback") {
    const cotizacion = await buscarCotizacionPorId(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: "Cotización no encontrada." });
    }
    if (cotizacion.estado !== "calculada") {
      return res
        .status(400)
        .json({ error: "Debes calcular la cotización antes de finalizarla." });
    }
    const finalizada = await guardarCotizacionMemory({ ...cotizacion, estado: "finalizada" });
    return res.json(finalizada);
  }

  const cotizacion = await Cotizacion.findById(req.params.id);
  if (!cotizacion) {
    return res.status(404).json({ error: "Cotización no encontrada." });
  }
  if (cotizacion.estado !== "calculada") {
    return res
      .status(400)
      .json({ error: "Debes calcular la cotización antes de finalizarla." });
  }
  cotizacion.estado = "finalizada";
  await cotizacion.save();
  res.json(cotizacion);
}
