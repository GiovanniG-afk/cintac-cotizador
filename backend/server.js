import "dotenv/config";
import express from "express";
import cors from "cors";
import { conectarDB } from "./config/db.js";
import cotizacionesRouter from "./routes/cotizaciones.js";
import usuariosRouter from "./routes/usuarios.js";
import tipoCambioRouter from "./routes/tipoCambio.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Conecta a la base de datos antes de responder cualquier request
// (patrón necesario para funciones serverless en Vercel)
app.use(async (req, res, next) => {
  try {
    await conectarDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "No se pudo conectar a la base de datos." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/usuarios", usuariosRouter);
app.use("/api/cotizaciones", cotizacionesRouter);
app.use("/api/tipo-cambio", tipoCambioRouter);

// Manejo de errores no capturados
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Ocurrió un error inesperado en el servidor." });
});

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
}

export default app;
