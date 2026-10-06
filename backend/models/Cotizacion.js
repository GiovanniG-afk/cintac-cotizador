import mongoose from "mongoose";

const cotizacionSchema = new mongoose.Schema(
  {
    proveedor: { type: String, required: true, trim: true },
    producto: { type: String, required: true, trim: true },
    tipoProducto: {
      type: String,
      enum: ["plancha", "perfil", "tubo", "bobina"],
      required: true,
    },
    paisOrigen: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 0.01 },
    precioFOB: { type: Number, required: true, min: 0 },
    moneda: { type: String, enum: ["USD", "CLP"], default: "USD" },
    tipoContenedor: { type: String, enum: ["20", "40"], default: "20" },
    puerto: { type: String, trim: true },
    toneladas: { type: Number, min: 0 },
    flete: { type: Number, default: 0, min: 0 },
    seguro: { type: Number, default: 0, min: 0 },
    otrosGastos: { type: Number, default: 0, min: 0 },
    costoPuerto: { type: Number, default: 0, min: 0 },
    condicionPago: { type: String, trim: true },

    tipoCambioUsado: { type: Number },
    fechaTipoCambio: { type: Date },
    arancelPctUsado: { type: Number },
    costoTotalCLP: { type: Number },
    precioUnitarioFinalCLP: { type: Number },

    estado: {
      type: String,
      enum: ["en_proceso", "calculada", "finalizada"],
      default: "en_proceso",
    },

    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  },
  { timestamps: true }
);

cotizacionSchema.index({ proveedor: 1, producto: 1 });

export default mongoose.model("Cotizacion", cotizacionSchema);
