import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  crearCotizacion,
  calcularCotizacion,
  listarCotizaciones,
  obtenerCotizacion,
  compararCotizaciones,
  finalizarCotizacion,
} from "../controllers/cotizacionController.js";

const router = Router();

router.use(requireAuth);

router.get("/comparar", compararCotizaciones);
router.get("/", listarCotizaciones);
router.get("/:id", obtenerCotizacion);
router.post("/", crearCotizacion);
router.post("/:id/calcular", calcularCotizacion);
router.post("/:id/finalizar", finalizarCotizacion);

export default router;
