export interface Cliente {
  id: number;
  razonSocial: string;
  nombreComercial?: string;
  contactoPrincipal?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  empresaId?: number;
  sucursalId?: number;
  activo?: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  password?: string;
  nombreCompleto: string;
  correo?: string;
  cargo?: string;
  rol: string;
  sucursalId?: number;
  empresaId?: number;
  activo?: boolean;
  permisosPersonalizados?: string[];
  tienePermisosPersonalizados?: boolean;
}

export interface Equipo {
  id: number;
  descripcion: string;
  partNumber?: string;
  caracteristicas?: string;
  precioReferencial?: number;
  tiempoEntregaPredeterminado?: string;
  categoria?: string;
  empresaId?: number;
  sucursalId?: number;
  activo?: boolean;
}

export interface Sucursal {
  id: number;
  codigo: string;
  nombre: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  prefijoCotizacion: string;
  headerBannerBase64?: string;
  footerBannerBase64?: string;
  firmaBase64?: string;
  nombreFirmante?: string;
  cargoFirmante?: string;
  formaPagoPredeterminada?: string;
  notaPredeterminada?: string;
  empresaId?: number;
  activo: boolean;
  // Opciones de configuración comercial y fiscal
  porcentajeIva?: number;
  monedaCodigo?: string;
  monedaSimbolo?: string;
  monedaNombre?: string;
  diasValidezCotizacion?: number;
  tiempoEntregaPredeterminado?: string;
  garantiaPredeterminada?: string;
  mostrarIvaDesglosado?: boolean;
}
