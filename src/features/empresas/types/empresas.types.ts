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
  // Campos opcionales para aprovisionamiento directo del Gerente al crear la empresa
  gerenteUsername?: string;
  gerentePassword?: string;
  gerenteNombreCompleto?: string;
  gerenteCorreo?: string;
}
