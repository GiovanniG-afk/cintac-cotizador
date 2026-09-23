import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Debes iniciar sesión para continuar." });
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Tu sesión no es válida o expiró." });
  }
}

// Restringe una ruta a ciertos roles (HDU-06)
export function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para realizar esta acción." });
    }
    next();
  };
}
