export interface PermisoDefinicion {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
}

export interface RolPermisos {
  rol: string;
  nombreRol: string;
  descripcion: string;
  permisos: string[];
}

export interface RbacMatriz {
  catalogoPermisos: PermisoDefinicion[];
  roles: RolPermisos[];
}

export interface UsuarioPermisos {
  usuarioId: number;
  username: string;
  nombreCompleto: string;
  cargo?: string;
  rol: string;
  empresaId?: number;
  sucursalId?: number;
  permisosRolPorDefecto: string[];
  permisosEfectivos: string[];
  permisosEspecialesAsignados: string[];
  tienePermisosPersonalizados: boolean;
}
