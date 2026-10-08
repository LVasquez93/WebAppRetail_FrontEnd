import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginRequest, AuthResponse } from '../features/auth/types/auth.types';
import { authApi } from '../api/authApi';
import { rbacApi } from '../api/rbacApi';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  cargandoAuth: boolean;
  isAdmin: boolean;
  isGerente: boolean;
  isGerenteGeneral: boolean;
  isGerenteSucursal: boolean;
  isVentas: boolean;
  isAdminOrGerente: boolean;
  permisos: string[];
  hasPermission: (permiso: string) => boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
  recargarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('cotizador_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cotizador_token');
  });

  const [permisos, setPermisos] = useState<string[]>([]);
  const [cargandoAuth, setCargandoAuth] = useState<boolean>(true);

  const cargarPermisosSeguros = async () => {
    try {
      const lista = await rbacApi.obtenerMisPermisos();
      setPermisos(lista || []);
    } catch (e) {
      console.warn('No se pudieron cargar permisos RBAC dinámicos:', e);
      setPermisos([]);
    }
  };

  // Verificar token al cargar la app
  useEffect(() => {
    const verificarSesion = async () => {
      const storedToken = localStorage.getItem('cotizador_token');
      if (storedToken) {
        try {
          const usuarioActual = await authApi.getMe();
          setUser(usuarioActual);
          localStorage.setItem('cotizador_user', JSON.stringify(usuarioActual));
          await cargarPermisosSeguros();
        } catch {
          // Si el token es inválido o expiró
          localStorage.removeItem('cotizador_token');
          localStorage.removeItem('cotizador_user');
          setUser(null);
          setToken(null);
          setPermisos([]);
        }
      } else {
        setUser(null);
        setToken(null);
        setPermisos([]);
      }
      setCargandoAuth(false);
    };

    verificarSesion();
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const authData = await authApi.login(credentials);
    const { token: jwtToken, ...userInfo } = authData;

    setToken(jwtToken);
    setUser(userInfo);

    localStorage.setItem('cotizador_token', jwtToken);
    localStorage.setItem('cotizador_user', JSON.stringify(userInfo));

    // Si el usuario tiene una sucursal asignada, preconfigurarla
    if (userInfo.sucursalId) {
      localStorage.setItem('cotizador_sucursal_id', String(userInfo.sucursalId));
    }

    await cargarPermisosSeguros();

    return authData;
  };

  const logout = () => {
    localStorage.removeItem('cotizador_token');
    localStorage.removeItem('cotizador_user');
    setUser(null);
    setToken(null);
    setPermisos([]);
    window.location.href = '/login';
  };

  const recargarSesion = async () => {
    try {
      const usuarioActual = await authApi.getMe();
      setUser(usuarioActual);
      localStorage.setItem('cotizador_user', JSON.stringify(usuarioActual));
      await cargarPermisosSeguros();
    } catch (e) {
      console.error('Error al recargar sesión:', e);
    }
  };

  const rol = user?.rol || '';
  const isAdmin = rol === 'ROLE_ADMIN' || rol === 'ADMIN';
  const isGerenteGeneral = rol === 'ROLE_GERENTE_GENERAL' || rol === 'GERENTE_GENERAL';
  const isGerenteSucursal = rol === 'ROLE_GERENTE_SUCURSAL' || rol === 'GERENTE_SUCURSAL';
  const isGerente = isGerenteGeneral || isGerenteSucursal || rol === 'ROLE_GERENTE' || rol === 'GERENTE';
  const isVentas = rol === 'ROLE_VENTAS' || rol === 'VENTAS';
  const isAdminOrGerente = isAdmin || isGerente;

  const hasPermission = (codigoPermiso: string): boolean => {
    if (isAdmin) return true;
    return permisos.includes(codigoPermiso);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        cargandoAuth,
        isAdmin,
        isGerente,
        isGerenteGeneral,
        isGerenteSucursal,
        isVentas,
        isAdminOrGerente,
        permisos,
        hasPermission,
        login,
        logout,
        recargarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
