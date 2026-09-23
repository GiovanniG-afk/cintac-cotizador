const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function solicitar(ruta, opciones = {}) {
  const token = localStorage.getItem("token");
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opciones.headers,
    },
  });

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || "Ocurrió un error al conectar con el servidor.");
  }
  return datos;
}

export const api = {
  login: (identifier, password) =>
    solicitar("/usuarios/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  registrar: (datos) =>
    solicitar("/usuarios/registro", { method: "POST", body: JSON.stringify(datos) }),

  crearCotizacion: (datos) =>
    solicitar("/cotizaciones", { method: "POST", body: JSON.stringify(datos) }),
  calcularCotizacion: (id) => solicitar(`/cotizaciones/${id}/calcular`, { method: "POST" }),
  finalizarCotizacion: (id) => solicitar(`/cotizaciones/${id}/finalizar`, { method: "POST" }),
  obtenerCotizacion: (id) => solicitar(`/cotizaciones/${id}`),
  listarCotizaciones: (filtros = {}) => {
    const query = new URLSearchParams(filtros).toString();
    return solicitar(`/cotizaciones${query ? `?${query}` : ""}`);
  },
  compararCotizaciones: (ids) => solicitar(`/cotizaciones/comparar?ids=${ids.join(",")}`),

  obtenerIndicadores: () => solicitar("/tipo-cambio"),
};
