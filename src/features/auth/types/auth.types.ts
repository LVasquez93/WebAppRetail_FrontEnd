export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  nombreCompleto: string;
  correo?: string;
  cargo?: string;
  rol: string;
  sucursalId?: number;
  sucursalCodigo?: string;
  sucursalNombre?: string;
  empresaId?: number;
  empresaNombre?: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
  tokenType: string;
  expiresIn: number;
}
