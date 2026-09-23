// Tabla de aranceles referenciales por tipo de producto metalúrgico.
// Valores ilustrativos para el prototipo; en producción deben actualizarse
// según el Arancel Aduanero vigente (Servicio Nacional de Aduanas) y el
// país de origen (acuerdos comerciales pueden bajar el arancel a 0%).
export const ARANCELES_POR_PRODUCTO = {
  plancha: 0.06,
  perfil: 0.06,
  tubo: 0.055,
  bobina: 0.06,
};

export function obtenerArancel(tipoProducto) {
  return ARANCELES_POR_PRODUCTO[tipoProducto] ?? 0.06;
}
