export interface ItemCotizacionInput {
  itemNumero: number;
  descripcionEquipo: string;
  partNumber?: string;
  caracteristicas?: string;
  tiempoEntrega: string;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
  equipoId?: number;
  esNuevo?: boolean;
}

export interface CotizacionFormData {
  codigoCotizacion: string;
  sucursalId?: number;
  usuarioEmisor: string;
  fechaEmision: string;
  contactoCliente: string;
  razonSocialCliente: string;
  nombreComercial: string;
  formaPago: string;
  notaImportante: string;
  items: ItemCotizacionInput[];
  subtotalSinIva: number;
  montoIva: number;
  totalInversion: number;
  totalEnLetras: string;
}

export interface CotizacionResponse extends CotizacionFormData {
  id: number;
  nombreSucursal?: string;
  fechaCreacion: string;
}
