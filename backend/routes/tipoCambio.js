import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { obtenerIndicadores } from "../controllers/tipoCambioController.js";

const router = Router();

router.get("/", requireAuth, obtenerIndicadores);

export default router;
