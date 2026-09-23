import { Router } from "express";
import { requireAuth, requireRol } from "../middleware/auth.js";
import {
  registrar,
  login,
  listarUsuarios,
  actualizarRol,
} from "../controllers/usuarioController.js";

const router = Router();

router.post("/registro", registrar);
router.post("/login", login);

// HDU-06: solo el administrador gestiona perfiles
router.get("/", requireAuth, requireRol("administrador"), listarUsuarios);
router.patch("/:id", requireAuth, requireRol("administrador"), actualizarRol);

export default router;
