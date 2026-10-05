import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginRequest, AuthResponse } from '../features/auth/types/auth.types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  cargandoAuth: boolean;
  isAdmin: boolean;
  isGerente: boolean;
  isAdminOrGerente: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
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

  const [cargandoAuth, setCargandoAuth] = useState<boolean>(true);

  // Verificar token al cargar la app
  useEffect(() => {
    const verificarSesion = async () => {
      const storedToken = localStorage.getItem('cotizador_token');
      if (storedToken) {
        try {
          const usuarioActual = await authApi.getMe();
          setUser(usuarioActual);
          localStorage.setItem('cotizador_user', JSON.stringify(usuarioActual));
        } catch {
          // Si el token es inválido o expiró
          localStorage.removeItem('cotizador_token');
          localStorage.removeItem('cotizador_user');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
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

    return authData;
  };

  const logout = () => {
    localStorage.removeItem('cotizador_token');
    localStorage.removeItem('cotizador_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const rol = user?.rol || '';
  const isAdmin = rol === 'ROLE_ADMIN' || rol === 'ADMIN';
  const isGerente = rol === 'ROLE_GERENTE' || rol === 'GERENTE';
  const isAdminOrGerente = isAdmin || isGerente;
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
        isAdminOrGerente,
        login,
        logout,
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
