import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import { getDbMode } from "../config/db.js";
import {
  findUsuarioByLogin,
  crearUsuario,
} from "../config/fallbackStore.js";

const ADMIN_USERNAME = "Cintac_Admin";
const ADMIN_EMAIL = "admin@cintac.cl";
const ADMIN_PASSWORD = "cintac2026";

export async function ensureDefaultAdmin() {
  if (getDbMode() === "fallback") {
    const existente = (await findUsuarioByLogin(ADMIN_USERNAME)) || (await findUsuarioByLogin(ADMIN_EMAIL));
    if (existente) return existente;

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    return crearUsuario({
      nombre: "CINTAC Admin",
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      rol: "administrador",
      activo: true,
    });
  }

  const existente = await Usuario.findOne({
    $or: [{ username: ADMIN_USERNAME.toLowerCase() }, { email: ADMIN_EMAIL.toLowerCase() }],
  });

  if (existente) return existente;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  return Usuario.create({
    nombre: "CINTAC Admin",
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    rol: "administrador",
    activo: true,
  });
}

if (process.argv[1] && process.argv[1].includes("seedAdmin.js")) {
  const { conectarDB } = await import("../config/db.js");
  try {
    await conectarDB();
    const admin = await ensureDefaultAdmin();
    console.log(`Usuario administrador listo: ${admin.username} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error("No se pudo crear el usuario administrador:", error.message);
    process.exit(1);
  }
}
