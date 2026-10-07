export interface Empresa {
  id: number;
  nombre: string;
  razonSocial: string;
  nit?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  logoBase64?: string;
  activo: boolean;
  fechaCreacion?: string;
  // Información del Gerente asignado
  gerenteId?: number;
  gerenteUsername?: string;
  gerenteNombreCompleto?: string;
  gerenteCorreo?: string;
}

export interface EmpresaFormData {
  nombre: string;
  razonSocial: string;
  nit?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  logoBase64?: string;
  activo?: boolean;
  // Campos para aprovisionar o editar el Gerente de la empresa
  gerenteId?: number;
  gerenteUsername?: string;
  gerentePassword?: string;
  gerenteNombreCompleto?: string;
  gerenteCorreo?: string;
}
