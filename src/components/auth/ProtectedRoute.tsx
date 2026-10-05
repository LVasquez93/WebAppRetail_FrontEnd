import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdminOrGerente?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdminOrGerente = false,
}) => {
  const { isAuthenticated, cargandoAuth, isAdminOrGerente } = useAuth();
  const location = useLocation();

  if (cargandoAuth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1F3D3D] border-t-transparent"></div>
        <p className="text-sm text-gray-500 font-medium">Verificando credenciales de acceso...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdminOrGerente && !isAdminOrGerente) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ⛔
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Esta sección requiere permisos de <strong className="text-red-700">Administrador</strong> o{' '}
          <strong className="text-red-700">Gerente</strong>. Tu usuario asignado cuenta con rol operativo y solo
          tiene autorización para emitir cotizaciones y consultar el historial.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 bg-[#1F3D3D] text-white rounded-xl text-sm font-semibold hover:bg-[#2a5252] transition-colors cursor-pointer shadow-md"
        >
          ← Regresar al Cotizador
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
