import { Router } from "express";
import { requireAuth, requireRol } from "../middleware/auth.js";
import {
  registrar,
  login,
  listarUsuarios,
  actualizarRol,
  actualizarPassword,
  resetPassword,
  solicitarConfirmacion,
  confirmarPerfil,
  solicitarCodigoReset,
} from "../controllers/usuarioController.js";

const router = Router();

router.post("/registro", registrar);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/solicitar-codigo-reset", solicitarCodigoReset);
router.post("/solicitar-confirmacion", requireAuth, solicitarConfirmacion);
router.post("/confirmar-configuracion", requireAuth, confirmarPerfil);
router.patch("/me/password", requireAuth, actualizarPassword);
router.patch("/:id/password", requireAuth, actualizarPassword);

// HDU-06: solo el administrador gestiona perfiles
router.get("/", requireAuth, requireRol("administrador"), listarUsuarios);
router.patch("/:id", requireAuth, requireRol("administrador"), actualizarRol);

export default router;
