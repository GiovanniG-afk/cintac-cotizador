import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { getDbMode } from "../config/db.js";
import {
  crearUsuario,
  existeUsuario,
  findUsuarioById,
  findUsuarioByLogin,
  listarUsuariosMemory,
  actualizarRolUsuario,
  actualizarPasswordUsuario,
  actualizarPerfilUsuario,
} from "../config/fallbackStore.js";

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET || "cintac-dev-secret",
    { expiresIn: "8h" }
  );
}

export async function registrar(req, res) {
  try {
    const { nombre, username, email, password } = req.body;
    if (!nombre || !username || !email || !password) {
      return res.status(400).json({ error: "Nombre, usuario, email y contraseña son obligatorios." });
    }

    const usernameNormalizado = String(username).trim();
    const emailNormalizado = String(email).trim().toLowerCase();

    if (getDbMode() === "fallback") {
      const existente = await existeUsuario(usernameNormalizado, emailNormalizado);
      if (existente) {
        return res.status(409).json({
          error: "Ya existe un usuario con ese nombre de usuario o email.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const usuario = await crearUsuario({
        nombre,
        username: usernameNormalizado,
        email: emailNormalizado,
        passwordHash,
        rol: "analista",
        activo: true,
      });

      const token = firmarToken(usuario);
      return res.status(201).json({
        token,
        usuario: { id: usuario._id, nombre: usuario.nombre, username: usuario.username, email: usuario.email, rol: usuario.rol },
      });
    }

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
      rol: "analista",
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

    if (getDbMode() === "fallback") {
      const usuario = await findUsuarioByLogin(valor);
      if (!usuario || !usuario.activo) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
      }

      const coincide = await bcrypt.compare(password, usuario.passwordHash);
      if (!coincide) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
      }

      const token = firmarToken(usuario);
      return res.json({
        token,
        usuario: { id: usuario._id, nombre: usuario.nombre, username: usuario.username, email: usuario.email, rol: usuario.rol },
      });
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

export async function actualizarPassword(req, res) {
  try {
    const { id } = req.params;
    const { password, nuevaPassword } = req.body;
    const esAdmin = req.usuario?.rol === "administrador";
    const usuarioObjetivo = req.path === "/me/password" ? req.usuario?.id : id;

    if (!usuarioObjetivo) {
      return res.status(400).json({ error: "No se pudo identificar el usuario." });
    }

    const esPropioUsuario = usuarioObjetivo === req.usuario?.id;
    if (!esAdmin && !esPropioUsuario) {
      return res.status(403).json({ error: "No tienes permisos para cambiar esta contraseña." });
    }

    const nuevaClave = String(nuevaPassword || "").trim();
    if (!nuevaClave || nuevaClave.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
    }

    let usuario;
    if (getDbMode() === "fallback") {
      usuario = await findUsuarioById(usuarioObjetivo);
    } else {
      usuario = await Usuario.findById(usuarioObjetivo);
    }

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (!esAdmin && (!password || String(password).trim() === "")) {
      return res.status(400).json({ error: "Debes ingresar tu contraseña actual." });
    }

    if (!esAdmin) {
      const coincide = await bcrypt.compare(String(password), usuario.passwordHash);
      if (!coincide) {
        return res.status(401).json({ error: "La contraseña actual no es correcta." });
      }
    }

    const passwordHash = await bcrypt.hash(nuevaClave, 10);

    if (getDbMode() === "fallback") {
      const actualizado = await actualizarPasswordUsuario(usuarioObjetivo, passwordHash);
      if (!actualizado) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
      return res.json({ ok: true, message: "Contraseña actualizada correctamente." });
    }

    await Usuario.findByIdAndUpdate(usuarioObjetivo, { passwordHash });
    return res.json({ ok: true, message: "Contraseña actualizada correctamente." });
  } catch (err) {
    res.status(500).json({ error: "No se pudo actualizar la contraseña." });
  }
}

export async function resetPassword(req, res) {
  try {
    const { identifier, password, nuevaPassword, codigo, email } = req.body;
    const valor = String(identifier || email || "").trim();
    const nuevaClave = String(nuevaPassword || "").trim();
    const requiereCodigo = Boolean(codigo || email);

    if (!valor || !nuevaClave) {
      return res.status(400).json({ error: "Debes indicar usuario/email y la nueva contraseña." });
    }

    if (nuevaClave.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
    }

    let usuario;
    if (getDbMode() === "fallback") {
      usuario = await findUsuarioByLogin(valor);
    } else {
      usuario = await Usuario.findOne({
        $or: [{ email: valor.toLowerCase() }, { username: valor.toLowerCase() }],
      });
    }

    if (!usuario) {
      return res.status(404).json({ error: "No tienes cuenta con nosotros." });
    }

    const emailDestino = String(email || usuario.email || "").trim().toLowerCase();
    if (requiereCodigo) {
      const clave = confirmacionesPendientes.get(`reset:${usuario._id}:${emailDestino}`);
      if (!clave || String(clave.codigo) !== String(codigo) || Date.now() > clave.expiresAt) {
        return res.status(401).json({ error: "El código de confirmación es inválido o expiró." });
      }
    } else {
      if (!password || !String(password).trim()) {
        return res.status(400).json({ error: "Debes ingresar tu contraseña actual." });
      }

      const coincide = await bcrypt.compare(String(password), usuario.passwordHash);
      if (!coincide) {
        return res.status(401).json({ error: "La contraseña actual no es correcta." });
      }
    }

    const passwordHash = await bcrypt.hash(nuevaClave, 10);

    if (getDbMode() === "fallback") {
      const actualizado = await actualizarPasswordUsuario(usuario._id, passwordHash);
      if (!actualizado) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
    } else {
      await Usuario.findByIdAndUpdate(usuario._id, { passwordHash });
    }

    if (requiereCodigo) {
      confirmacionesPendientes.delete(`reset:${usuario._id}:${emailDestino}`);
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET || "cintac-dev-secret",
      { expiresIn: "8h" }
    );

    return res.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, username: usuario.username, email: usuario.email, rol: usuario.rol },
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo restablecer la contraseña." });
  }
}

export async function solicitarCodigoReset(req, res) {
  try {
    const { identifier, email } = req.body;
    const valor = String(identifier || email || "").trim();
    if (!valor) {
      return res.status(400).json({ error: "Debes indicar tu correo electrónico." });
    }

    let usuario;
    if (getDbMode() === "fallback") {
      usuario = await findUsuarioByLogin(valor);
    } else {
      usuario = await Usuario.findOne({
        $or: [{ email: valor.toLowerCase() }, { username: valor.toLowerCase() }],
      });
    }

    if (!usuario) {
      return res.status(404).json({ error: "No tienes cuenta con nosotros." });
    }

    const destino = String(email || usuario.email || "").trim().toLowerCase();
    if (!destino) {
      return res.status(400).json({ error: "No hay un correo asociado para enviar el código." });
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    confirmacionesPendientes.set(`reset:${usuario._id}:${destino}`, {
      codigo,
      userId: usuario._id,
      email: destino,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return res.json({
      ok: true,
      email: destino,
      message: "Código de verificación enviado a tu correo.",
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo generar el código de verificación." });
  }
}

// HDU-06: administrador gestiona perfiles
const confirmacionesPendientes = new Map();

export async function solicitarConfirmacion(req, res) {
  try {
    const { userId, email } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Falta el identificador del usuario." });
    }

    let usuario;
    if (getDbMode() === "fallback") {
      usuario = await findUsuarioById(userId);
    } else {
      usuario = await Usuario.findById(userId);
    }

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const destino = String(email || usuario.email || "").trim().toLowerCase();
    if (!destino) {
      return res.status(400).json({ error: "No hay un correo asociado para enviar la confirmación." });
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    confirmacionesPendientes.set(`${userId}:${destino}`, {
      codigo,
      userId,
      email: destino,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return res.json({ ok: true, codigo, email: destino, message: "Código de confirmación generado." });
  } catch (err) {
    res.status(500).json({ error: "No se pudo generar la confirmación para el cambio." });
  }
}

export async function confirmarPerfil(req, res) {
  try {
    const { userId, codigo, username, email, nuevaPassword, password } = req.body;
    if (!userId || !codigo) {
      return res.status(400).json({ error: "Falta información para confirmar el cambio." });
    }

    let usuario;
    if (getDbMode() === "fallback") {
      usuario = await findUsuarioById(userId);
    } else {
      usuario = await Usuario.findById(userId);
    }

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const emailDestino = String(email || usuario.email || "").trim().toLowerCase();
    const clave = confirmacionesPendientes.get(`${userId}:${emailDestino}`);
    if (!clave || String(clave.codigo) !== String(codigo) || Date.now() > clave.expiresAt) {
      return res.status(401).json({ error: "El código de confirmación es inválido o expiró." });
    }

    if (username && String(username).trim()) {
      const usernameNormalizado = String(username).trim();
      const existente = getDbMode() === "fallback"
        ? await findUsuarioByLogin(usernameNormalizado)
        : await Usuario.findOne({ username: usernameNormalizado.toLowerCase() });

      if (existente && String(existente._id) !== String(userId)) {
        return res.status(409).json({ error: "Ya existe ese nombre de usuario." });
      }
      usuario.username = usernameNormalizado;
    }

    if (emailDestino && emailDestino !== usuario.email) {
      const emailNormalizado = emailDestino.toLowerCase();
      const existente = getDbMode() === "fallback"
        ? await findUsuarioByLogin(emailNormalizado)
        : await Usuario.findOne({ email: emailNormalizado });

      if (existente && String(existente._id) !== String(userId)) {
        return res.status(409).json({ error: "Ya existe ese correo electrónico." });
      }
      usuario.email = emailNormalizado;
    }

    if (nuevaPassword && String(nuevaPassword).trim()) {
      if (!password || !String(password).trim()) {
        return res.status(400).json({ error: "Debes indicar la contraseña actual para cambiar la contraseña." });
      }
      const coincide = await bcrypt.compare(String(password), usuario.passwordHash);
      if (!coincide) {
        return res.status(401).json({ error: "La contraseña actual no es correcta." });
      }
      usuario.passwordHash = await bcrypt.hash(String(nuevaPassword).trim(), 10);
    }

    if (getDbMode() === "fallback") {
      const actualizado = await actualizarPerfilUsuario(userId, {
        username: usuario.username,
        email: usuario.email,
        passwordHash: usuario.passwordHash,
      });

      if (!actualizado) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
    } else {
      await Usuario.findByIdAndUpdate(userId, {
        username: usuario.username,
        email: usuario.email,
        passwordHash: usuario.passwordHash,
      });
    }

    confirmacionesPendientes.delete(`${userId}:${emailDestino}`);

    return res.json({ ok: true, message: "Configuración confirmada correctamente." });
  } catch (err) {
    res.status(500).json({ error: "No se pudo confirmar el cambio de configuración." });
  }
}

export async function listarUsuarios(req, res) {
  if (getDbMode() === "fallback") {
    const usuarios = await listarUsuariosMemory();
    return res.json(usuarios);
  }

  const usuarios = await Usuario.find().select("-passwordHash");
  res.json(usuarios);
}

export async function actualizarRol(req, res) {
  const { id } = req.params;
  const { rol, activo } = req.body;

  if (getDbMode() === "fallback") {
    const usuario = await actualizarRolUsuario(id, { rol, activo });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    return res.json(usuario);
  }

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
