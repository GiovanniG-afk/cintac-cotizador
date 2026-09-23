import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    rol: {
      type: String,
      enum: ["analista", "jefe_abastecimiento", "administrador"],
      default: "analista",
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Usuario", usuarioSchema);
