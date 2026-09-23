import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

export async function ensureDefaultAdmin() {
  const username = "cintac_admin";
  const email = "admin@cintac.cl";
  const password = "cintac2026";

  const existente = await Usuario.findOne({
    $or: [{ username }, { email: email.toLowerCase() }],
  });

  if (existente) return existente;

  const passwordHash = await bcrypt.hash(password, 10);

  return Usuario.create({
    nombre: "CINTAC Admin",
    username,
    email: email.toLowerCase(),
    passwordHash,
    rol: "administrador",
    activo: true,
  });
}
