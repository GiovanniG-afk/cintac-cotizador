export const TASA_FOB = 970.22;

export const CONTENEDORES = {
  "20": {
    nombre: "20 pies",
    capacidadMinToneladas: 20,
    capacidadMaxToneladas: 28,
  },
  "40": {
    nombre: "40 pies",
    capacidadMinToneladas: 26,
    capacidadMaxToneladas: 29,
  },
};

export const COSTOS_PUERTO = {
  "Shanghái": { pais: "China", costo20pies: 2500, costo40pies: 4000 },
  "Hong Kong": { pais: "China", costo20pies: 2400, costo40pies: 3900 },
  "Rotterdam": { pais: "Holanda", costo20pies: 3500, costo40pies: 5500 },
  "Singapur": { pais: "Singapur", costo20pies: 2300, costo40pies: 3700 },
  "Los Angeles": { pais: "EE.UU.", costo20pies: 1800, costo40pies: 3000 },
  "Nueva York": { pais: "EE.UU.", costo20pies: 2000, costo40pies: 3200 },
  "Busan": { pais: "Corea", costo20pies: 2600, costo40pies: 4100 },
  "Tokio": { pais: "Japón", costo20pies: 2700, costo40pies: 4200 },
  "Bangkok": { pais: "Tailandia", costo20pies: 2200, costo40pies: 3500 },
  "Dubai": { pais: "EAU", costo20pies: 2800, costo40pies: 4300 },
};

export function obtenerCostoPuerto(nombrePuerto, tipoContenedor) {
  const puerto = COSTOS_PUERTO[nombrePuerto];
  if (!puerto) {
    throw new Error(`Puerto no encontrado: ${nombrePuerto}`);
  }

  const clave = tipoContenedor === "20" ? "costo20pies" : "costo40pies";
  return puerto[clave] ?? 0;
}

export function obtenerCapacidadContenedor(tipoContenedor) {
  return CONTENEDORES[tipoContenedor] || CONTENEDORES["20"];
}

export function validarToneladasPorContenedor(tipoContenedor, toneladas) {
  const contenedor = obtenerCapacidadContenedor(tipoContenedor);
  return toneladas >= contenedor.capacidadMinToneladas && toneladas <= contenedor.capacidadMaxToneladas;
}

export function obtenerPuertosDisponibles() {
  return Object.keys(COSTOS_PUERTO);
}
