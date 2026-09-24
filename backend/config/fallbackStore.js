import crypto from "node:crypto";

const state = {
  usuarios: [],
  cotizaciones: [],
};

export function isMemoryStoreActive() {
  return !process.env.MONGODB_URI;
}

export function resetMemoryStore() {
  state.usuarios = [];
  state.cotizaciones = [];
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeUsername(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function makeId() {
  return crypto.randomUUID();
}

export async function findUsuarioByLogin(identifier) {
  const valor = normalizeText(identifier).toLowerCase();
  if (!valor) return null;

  return state.usuarios.find((usuario) => {
    const username = normalizeUsername(usuario.username);
    const email = normalizeEmail(usuario.email);
    return username === valor || email === valor;
  }) || null;
}

export async function existeUsuario(username, email) {
  const usernameNorm = normalizeUsername(username);
  const emailNorm = normalizeEmail(email);

  return state.usuarios.some((usuario) => {
    const usuarioUsername = normalizeUsername(usuario.username);
    const usuarioEmail = normalizeEmail(usuario.email);
    return usuarioUsername === usernameNorm || usuarioEmail === emailNorm;
  });
}

export async function crearUsuario({ nombre, username, email, passwordHash, rol = "analista", activo = true }) {
  const usuario = {
    _id: makeId(),
    nombre: normalizeText(nombre),
    username: normalizeText(username),
    email: normalizeEmail(email),
    passwordHash,
    rol,
    activo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  state.usuarios.push(usuario);
  return usuario;
}

export async function listarUsuariosMemory() {
  return state.usuarios.map(({ passwordHash, ...usuario }) => usuario);
}

export async function actualizarRolUsuario(id, { rol, activo }) {
  const usuario = state.usuarios.find((item) => item._id === id || item._id.toString() === id);
  if (!usuario) return null;

  if (rol) usuario.rol = rol;
  if (typeof activo === "boolean") usuario.activo = activo;
  usuario.updatedAt = new Date().toISOString();

  const { passwordHash, ...sinPassword } = usuario;
  return sinPassword;
}

export async function findUsuarioById(id) {
  return state.usuarios.find((item) => item._id === id || item._id.toString() === id) || null;
}

export async function actualizarPasswordUsuario(id, nuevaPasswordHash) {
  const usuario = await findUsuarioById(id);
  if (!usuario) return null;

  usuario.passwordHash = nuevaPasswordHash;
  usuario.updatedAt = new Date().toISOString();
  return usuario;
}

export async function actualizarPerfilUsuario(id, { username, email, passwordHash }) {
  const usuario = await findUsuarioById(id);
  if (!usuario) return null;

  if (username) usuario.username = normalizeText(username);
  if (email) usuario.email = normalizeEmail(email);
  if (passwordHash) usuario.passwordHash = passwordHash;
  usuario.updatedAt = new Date().toISOString();

  return usuario;
}

export async function crearCotizacionMemory(data) {
  const cotizacion = {
    _id: makeId(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  state.cotizaciones.push(cotizacion);
  return cotizacion;
}

export async function buscarCotizacionPorId(id) {
  return state.cotizaciones.find((item) => item._id === id || item._id.toString() === id) || null;
}

export async function listarCotizacionesMemory(filtro = {}) {
  const proveedor = filtro.proveedor;
  const producto = filtro.producto;

  return state.cotizaciones.filter((item) => {
    const coincideProveedor = !proveedor || new RegExp(proveedor, "i").test(item.proveedor || "");
    const coincideProducto = !producto || new RegExp(producto, "i").test(item.producto || "");
    return coincideProveedor && coincideProducto;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function listarCotizacionesPorIdsMemory(ids = []) {
  const idSet = new Set(ids.map((id) => String(id)));
  return state.cotizaciones.filter((item) => idSet.has(String(item._id)));
}

export async function guardarCotizacionMemory(cotizacion) {
  const indice = state.cotizaciones.findIndex((item) => item._id === cotizacion._id || item._id.toString() === cotizacion._id.toString());
  if (indice === -1) {
    state.cotizaciones.push(cotizacion);
    return cotizacion;
  }

  state.cotizaciones[indice] = { ...state.cotizaciones[indice], ...cotizacion, updatedAt: new Date().toISOString() };
  return state.cotizaciones[indice];
}

export async function obtenerEstadoMemoria() {
  return {
    usuarios: state.usuarios.length,
    cotizaciones: state.cotizaciones.length,
  };
}
