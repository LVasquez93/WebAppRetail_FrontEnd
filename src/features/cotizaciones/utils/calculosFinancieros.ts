export const TASA_IVA = 0.13;

export function calcularTotales(items: { cantidad: number; precioUnitario: number }[]) {
  const subtotal = items.reduce((acc, it) => {
    const totalLinea = Math.round((Number(it.cantidad || 0) * Number(it.precioUnitario || 0)) * 100) / 100;
    return acc + totalLinea;
  }, 0);

  const subtotalRedondeado = Math.round(subtotal * 100) / 100;
  const iva = Math.round(subtotalRedondeado * TASA_IVA * 100) / 100;
  const total = Math.round((subtotalRedondeado + iva) * 100) / 100;

  return {
    subtotalSinIva: subtotalRedondeado,
    montoIva: iva,
    totalInversion: total
  };
}
