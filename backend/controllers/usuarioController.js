import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export async function registrar(req, res) {
  try {
    const { nombre, username, email, password, rol } = req.body;
    if (!nombre || !username || !email || !password) {
      return res.status(400).json({ error: "Nombre, usuario, email y contraseña son obligatorios." });
    }

    const usernameNormalizado = String(username).trim();
    const emailNormalizado = String(email).trim().toLowerCase();

    const existente = await Usuario.findOne({
      $or: [{ username: usernameNormalizado.toLowerCase() }, { email: emailNormalizado }],
    });

    if (existente) {
      return res.status(409).json({
        error: existente.username === usernameNormalizado.toLowerCase()
          ? "Ya existe un usuario con ese nombre de usuario."
          : "Ya existe un usuario con ese email.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      nombre,
      username: usernameNormalizado,
      email: emailNormalizado,
      passwordHash,
      rol: rol || "analista",
    });

    const token = firmarToken(usuario);
    res.status(201).json({
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, username: usuario.username, rol: usuario.rol },
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo crear el usuario." });
  }
}

export async function login(req, res) {
  try {
    const { identifier, email, username, password } = req.body;
    const valor = String((identifier ?? email ?? username ?? "") || "").trim();

    if (!valor || !password) {
      return res.status(400).json({ error: "Usuario o email y contraseña son obligatorios." });
    }

    const usuario = await Usuario.findOne({
      $or: [
        { email: valor.toLowerCase() },
        { username: valor.toLowerCase() },
      ],
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const coincide = await bcrypt.compare(password, usuario.passwordHash);
    if (!coincide) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const token = firmarToken(usuario);
    res.json({
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, username: usuario.username, rol: usuario.rol },
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo iniciar sesión." });
  }
}

// HDU-06: administrador gestiona perfiles
export async function listarUsuarios(req, res) {
  const usuarios = await Usuario.find().select("-passwordHash");
  res.json(usuarios);
}

export async function actualizarRol(req, res) {
  const { id } = req.params;
  const { rol, activo } = req.body;

  const usuario = await Usuario.findByIdAndUpdate(
    id,
    { ...(rol && { rol }), ...(typeof activo === "boolean" && { activo }) },
    { new: true }
  ).select("-passwordHash");

  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }
  res.json(usuario);
}
