import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProfileModal } from './ProfileModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('retail_erp_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('retail_erp_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Si no está autenticado o está en la pantalla de login, renderizar sin la concha de ERP
  if (!isAuthenticated || location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Barra Lateral Vertical (ERP Sidebar) */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* 2. Área Principal de Contenido */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Barra Superior Minimalista (Top Header) */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        {/* Contenido Dinámico de la Vista */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>

      {/* 3. Modal de Edición de Perfil */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};
