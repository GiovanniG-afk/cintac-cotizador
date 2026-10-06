import React, { useState } from "react";
import { api } from "../api/api.js";
import { exportarCotizacion } from "../utils/exportPdf.js";

const TIPOS_PRODUCTO = [
  { valor: "plancha", texto: "Plancha de acero" },
  { valor: "perfil", texto: "Perfil de acero" },
  { valor: "tubo", texto: "Tubo de acero" },
  { valor: "bobina", texto: "Bobina de acero" },
];

const PUERTOS = [
  "Shanghái",
  "Hong Kong",
  "Rotterdam",
  "Singapur",
  "Los Angeles",
  "Nueva York",
  "Busan",
  "Tokio",
  "Bangkok",
  "Dubai",
];

const CAMPOS_INICIALES = {
  proveedor: "",
  producto: "",
  tipoProducto: "plancha",
  paisOrigen: "",
  cantidad: "",
  precioFOB: "",
  moneda: "USD",
  tipoContenedor: "20",
  puerto: "Shanghái",
  toneladas: "20",
  flete: "",
  seguro: "",
  otrosGastos: "",
  condicionPago: "",
};

export default function NuevaCotizacion() {
  const [form, setForm] = useState(CAMPOS_INICIALES);
  const [cotizacion, setCotizacion] = useState(null);
  const [advertencia, setAdvertencia] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [tipoExportacion, setTipoExportacion] = useState("pdf");

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function validarToneladas() {
    const toneladas = Number(form.toneladas);
    if (!Number.isFinite(toneladas)) return "Debes ingresar una cantidad válida de toneladas.";

    if (form.tipoContenedor === "20" && (toneladas < 20 || toneladas > 28)) {
      return "El contenedor 20’ solo admite entre 20 y 28 toneladas.";
    }

    if (form.tipoContenedor === "40" && (toneladas < 26 || toneladas > 29)) {
      return "El contenedor 40’ solo admite entre 26 y 29 toneladas.";
    }

    return "";
  }

  async function manejarRegistro(e) {
    e.preventDefault();
    if (cargando) return;
    setError("");

    const errorTonelaje = validarToneladas();
    if (errorTonelaje) {
      setError(errorTonelaje);
      return;
    }

    setCargando(true);
    try {
      const nueva = await api.crearCotizacion({
        ...form,
        cantidad: Number(form.cantidad),
        precioFOB: Number(form.precioFOB),
        toneladas: Number(form.toneladas),
        flete: Number(form.flete || 0),
        seguro: Number(form.seguro || 0),
        otrosGastos: Number(form.otrosGastos || 0),
        condicionPago: form.condicionPago?.trim() || "",
      });
      setCotizacion(nueva);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function manejarCalculo() {
    if (cargando || !cotizacion) return;
    setError("");
    setCargando(true);
    try {
      const { cotizacion: actualizada, advertencia: aviso } = await api.calcularCotizacion(
        cotizacion._id
      );
      setCotizacion(actualizada);
      setAdvertencia(aviso || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function manejarFinalizarYExportar() {
    if (cargando || !cotizacion) return;
    setError("");
    setCargando(true);
    try {
      const finalizada = await api.finalizarCotizacion(cotizacion._id);
      setCotizacion(finalizada);
      exportarCotizacion(finalizada, tipoExportacion);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Nueva cotización</h2>
      <p className="mt-1 text-lg text-acero-claro">
        Completa los datos para calcular y exportar la cotización.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-peligro/10 px-4 py-3 text-peligro">
          {error}
        </p>
      )}

      <section className="tarjeta mt-6">
        <h3 className="text-lg">1. Datos generales</h3>
        <form onSubmit={manejarRegistro} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="proveedor">Proveedor</label>
              <input
                id="proveedor"
                required
                disabled={!!cotizacion}
                value={form.proveedor}
                onChange={(e) => actualizarCampo("proveedor", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="paisOrigen">País de origen</label>
              <input
                id="paisOrigen"
                required
                disabled={!!cotizacion}
                value={form.paisOrigen}
                onChange={(e) => actualizarCampo("paisOrigen", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="producto">Producto</label>
              <input
                id="producto"
                required
                disabled={!!cotizacion}
                value={form.producto}
                onChange={(e) => actualizarCampo("producto", e.target.value)}
                placeholder="Ej: Plancha galvanizada 2mm"
              />
            </div>
            <div>
              <label htmlFor="tipoProducto">Tipo de producto</label>
              <select
                id="tipoProducto"
                disabled={!!cotizacion}
                value={form.tipoProducto}
                onChange={(e) => actualizarCampo("tipoProducto", e.target.value)}
              >
                {TIPOS_PRODUCTO.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.texto}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="cantidad">Cantidad</label>
              <input
                id="cantidad"
                type="number"
                min="0.01"
                step="0.01"
                required
                disabled={!!cotizacion}
                value={form.cantidad}
                onChange={(e) => actualizarCampo("cantidad", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="condicionPago">Condición de pago</label>
              <input
                id="condicionPago"
                disabled={!!cotizacion}
                value={form.condicionPago}
                onChange={(e) => actualizarCampo("condicionPago", e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div>
              <label htmlFor="precioFOB">Precio FOB (por unidad)</label>
              <input
                id="precioFOB"
                type="number"
                min="0"
                step="0.01"
                required
                disabled={!!cotizacion}
                value={form.precioFOB}
                onChange={(e) => actualizarCampo("precioFOB", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="moneda">Moneda</label>
              <select
                id="moneda"
                disabled={!!cotizacion}
                value={form.moneda}
                onChange={(e) => actualizarCampo("moneda", e.target.value)}
              >
                <option value="USD">Dólares (USD)</option>
                <option value="CLP">Pesos chilenos (CLP)</option>
              </select>
            </div>
            <div>
              <label htmlFor="tipoContenedor">Tipo de contenedor</label>
              <select
                id="tipoContenedor"
                disabled={!!cotizacion}
                value={form.tipoContenedor}
                onChange={(e) => actualizarCampo("tipoContenedor", e.target.value)}
              >
                <option value="20">20 pies</option>
                <option value="40">40 pies</option>
              </select>
            </div>
            <div>
              <label htmlFor="puerto">Puerto</label>
              <select
                id="puerto"
                disabled={!!cotizacion}
                value={form.puerto}
                onChange={(e) => actualizarCampo("puerto", e.target.value)}
              >
                {PUERTOS.map((puerto) => (
                  <option key={puerto} value={puerto}>{puerto}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="toneladas">Toneladas</label>
              <input
                id="toneladas"
                type="number"
                min="0"
                step="0.1"
                required
                disabled={!!cotizacion}
                value={form.toneladas}
                onChange={(e) => actualizarCampo("toneladas", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="flete">Flete internacional</label>
              <input
                id="flete"
                type="number"
                min="0"
                step="0.01"
                disabled={!!cotizacion}
                value={form.flete}
                onChange={(e) => actualizarCampo("flete", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="seguro">Seguro</label>
              <input
                id="seguro"
                type="number"
                min="0"
                step="0.01"
                disabled={!!cotizacion}
                value={form.seguro}
                onChange={(e) => actualizarCampo("seguro", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="otrosGastos">Otros gastos</label>
              <input
                id="otrosGastos"
                type="number"
                min="0"
                step="0.01"
                disabled={!!cotizacion}
                value={form.otrosGastos}
                onChange={(e) => actualizarCampo("otrosGastos", e.target.value)}
              />
            </div>
          </div>

          {!cotizacion && (
            <button type="submit" disabled={cargando} className="btn-primario w-full">
              {cargando ? "Guardando..." : "Guardar cotización"}
            </button>
          )}
        </form>
      </section>

      {cotizacion && (
        <section className="tarjeta mt-6">
          <h3 className="text-lg">2. Cálculo del costo total</h3>
          {cotizacion.estado === "en_proceso" ? (
            <button onClick={manejarCalculo} disabled={cargando} className="btn-primario mt-4">
              {cargando ? "Calculando..." : "Calcular costo de importación"}
            </button>
          ) : (
            <div className="mt-4 space-y-2 text-lg">
              <p>
                Tipo de cambio usado: <strong>${cotizacion.tipoCambioUsado?.toLocaleString("es-CL")} CLP</strong>
              </p>
              <p>
                Puerto: <strong>{cotizacion.puerto || "-"}</strong>
              </p>
              <p>
                Contenedor: <strong>{cotizacion.tipoContenedor || "-"} pies</strong>
              </p>
              <p>
                Toneladas: <strong>{cotizacion.toneladas ?? "-"}</strong>
              </p>
              <p>
                Costo puerto: <strong>${Number(cotizacion.costoPuerto || 0).toLocaleString("es-CL")} USD</strong>
              </p>
              <p>
                Arancel aplicado: <strong>{(cotizacion.arancelPctUsado * 100).toFixed(1)}%</strong>
              </p>
              <p className="text-2xl font-display font-semibold text-acero">
                Costo total: ${cotizacion.costoTotalCLP?.toLocaleString("es-CL")} CLP
              </p>
              <p>
                Precio unitario final: ${cotizacion.precioUnitarioFinalCLP?.toLocaleString("es-CL")} CLP
              </p>
            </div>
          )}
          {advertencia && (
            <p className="mt-3 rounded-md bg-ambar/15 px-4 py-3 text-acero">⚠ {advertencia}</p>
          )}
        </section>
      )}

      {cotizacion && cotizacion.estado !== "en_proceso" && (
        <section className="tarjeta mt-6">
          <h3 className="text-lg">3. Finalizar y exportar</h3>
          <p className="mt-2 text-acero-claro">
            Elige el formato antes de exportar la cotización final.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="tipoExportacion">Formato</label>
              <select
                id="tipoExportacion"
                value={tipoExportacion}
                onChange={(e) => setTipoExportacion(e.target.value)}
                className="mt-1"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="word">Word</option>
              </select>
            </div>
            <button onClick={manejarFinalizarYExportar} disabled={cargando} className="btn-primario">
              {cotizacion.estado === "finalizada"
                ? `Descargar ${tipoExportacion.toUpperCase()}`
                : `Finalizar y descargar ${tipoExportacion.toUpperCase()}`}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
