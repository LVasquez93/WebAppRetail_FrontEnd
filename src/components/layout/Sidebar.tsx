import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;             // Para drawer en móviles (<1024px)
  onClose: () => void;         // Cerrar drawer móvil
  isCollapsed: boolean;        // Modo compacto en escritorio (solo iconos)
  onToggleCollapse: () => void;// Alternar modo compacto
  onOpenProfile: () => void;   // Abrir modal de perfil
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onOpenProfile,
}) => {
  const location = useLocation();
  const { user, isAdmin, isAdminOrGerente, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => {
    const active = isActive(path);
    return `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
      active
        ? 'bg-[#2a5252] text-white shadow-md border-l-4 border-[#C88D4B]'
        : 'text-teal-100/80 hover:text-white hover:bg-white/10'
    }`;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity animate-fadeIn"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#132828] text-white border-r border-teal-900/60 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-72`}
      >
        {/* Cabecera / Marca ERP */}
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-2.5 overflow-hidden transition-all ${
              isCollapsed ? 'lg:justify-center lg:w-full' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1F3D3D] to-[#C88D4B] flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
              R
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-wide text-white">Retail</span>
                  <span className="text-[10px] bg-[#C88D4B] text-gray-900 font-extrabold px-1.5 py-0.5 rounded uppercase">
                    ERP
                  </span>
                </div>
                <span className="text-[11px] text-teal-300 font-medium">Cotizador SaaS</span>
              </div>
            )}
          </Link>

          {/* Botón para colapsar en escritorio */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          >
            {isCollapsed ? '❯' : '❮'}
          </button>

          {/* Botón para cerrar en móvil */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-white/10 text-lg transition-colors cursor-pointer"
            title="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Lista de Navegación ERP */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* GRUPO 1: PRINCIPAL */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-extrabold text-teal-400/80 uppercase tracking-wider">
                Principal
              </div>
            )}
            <nav className="space-y-1">
              <Link to="/" onClick={onClose} className={navLinkClass('/')} title="Dashboard">
                <span className="text-lg shrink-0">📊</span>
                {!isCollapsed && <span>Dashboard</span>}
              </Link>
              <Link to="/cotizaciones/nueva" onClick={onClose} className={navLinkClass('/cotizaciones/nueva')} title="Nueva Cotización">
                <span className="text-lg shrink-0">➕</span>
                {!isCollapsed && <span>Nueva Cotización</span>}
              </Link>
              <Link to="/cotizaciones" onClick={onClose} className={navLinkClass('/cotizaciones')} title="Historial">
                <span className="text-lg shrink-0">📋</span>
                {!isCollapsed && <span>Historial Cotizaciones</span>}
              </Link>
            </nav>
          </div>

          {/* GRUPO 2: OPERACIONES (Admin y Gerente) */}
          {isAdminOrGerente && (
            <div>
              {!isCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-extrabold text-teal-400/80 uppercase tracking-wider">
                  Operaciones
                </div>
              )}
              <nav className="space-y-1">
                <Link to="/catalogos" onClick={onClose} className={navLinkClass('/catalogos')} title="Catálogos">
                  <span className="text-lg shrink-0">🗂️</span>
                  {!isCollapsed && <span>Catálogos Maestros</span>}
                </Link>
                <Link to="/sucursales" onClick={onClose} className={navLinkClass('/sucursales')} title="Sucursales">
                  <span className="text-lg shrink-0">🏢</span>
                  {!isCollapsed && <span>Sucursales & Sedes</span>}
                </Link>
              </nav>
            </div>
          )}

          {/* GRUPO 3: ADMINISTRACIÓN SAAS (Exclusivo SuperAdmin) */}
          {isAdmin && (
            <div>
              {!isCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-extrabold text-purple-300/80 uppercase tracking-wider">
                  Plataforma SaaS
                </div>
              )}
              <nav className="space-y-1">
                <Link to="/empresas" onClick={onClose} className={navLinkClass('/empresas')} title="Empresas (Tenants)">
                  <span className="text-lg shrink-0">🏛️</span>
                  {!isCollapsed && <span>Empresas (Tenants)</span>}
                </Link>
                <Link to="/roles" onClick={onClose} className={navLinkClass('/roles')} title="Roles & Permisos (RBAC)">
                  <span className="text-lg shrink-0">🛡️</span>
                  {!isCollapsed && <span>Roles & Permisos</span>}
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Tarjeta de Usuario en el Footer del Sidebar */}
        <div className="p-3 border-t border-white/10 bg-[#0e1d1d] shrink-0">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-100 font-bold flex items-center justify-center shrink-0 shadow-inner text-sm border border-teal-600/40">
                  {getInitials(user?.nombreCompleto || user?.username)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-white truncate leading-tight">
                    {user?.nombreCompleto || user?.username}
                  </div>
                  <div className="text-[11px] text-teal-300/90 truncate font-mono">
                    {user?.cargo || user?.username}
                  </div>
                  <div className="mt-1">
                    {isAdmin ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                        SuperAdmin SaaS
                      </span>
                    ) : user?.rol === 'ROLE_GERENTE_GENERAL' ? (
                      <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold truncate block">
                        👑 Gerente General • {user.empresaNombre || 'Empresa'}
                      </span>
                    ) : user?.rol === 'ROLE_GERENTE_SUCURSAL' ? (
                      <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold truncate block">
                        🏬 Gerente Sede • {user.sucursalNombre || 'Sucursal'}
                      </span>
                    ) : user?.empresaNombre ? (
                      <span className="bg-teal-900/60 text-teal-200 border border-teal-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-medium truncate block max-w-full">
                        🏢 {user.empresaNombre}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Botones de Acción de Cuenta */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                  className="w-full py-1.5 px-2 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-semibold text-teal-100 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  title="Configurar mi cuenta y contraseña"
                >
                  <span>⚙️</span>
                  <span>Mi Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-1.5 px-2 bg-red-950/40 hover:bg-red-900/80 text-red-200 hover:text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 border border-red-500/20"
                  title="Cerrar sesión segura"
                >
                  <span>🚪</span>
                  <span>Salir</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onOpenProfile}
                className="w-10 h-10 rounded-xl bg-teal-800 text-teal-100 font-bold flex items-center justify-center hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer text-sm shadow-md"
                title={`${user?.nombreCompleto || user?.username} - Editar Perfil`}
              >
                {getInitials(user?.nombreCompleto || user?.username)}
              </button>
              <button
                type="button"
                onClick={logout}
                className="p-2 text-red-300 hover:text-white hover:bg-red-500/30 rounded-lg text-sm transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                🚪
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
