import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSucursal } from '../../context/SucursalContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const { sucursales, sucursalActiva, setSucursalActiva, cargandoSucursales, recargarSucursales } = useSucursal();
  const { user, isAuthenticated, isAdminOrGerente, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    location.pathname === path
      ? 'bg-white/20 font-semibold'
      : 'hover:bg-white/10';

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <nav className="bg-[#1F3D3D] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wide text-white">Retail</span>
            <span className="text-sm text-[#C88D4B] font-semibold">Cotizador</span>
          </div>
          <span className="text-xs text-teal-200 bg-teal-900/60 px-3 py-1.5 rounded-lg border border-teal-500/30">
            🔒 Acceso Protegido
          </span>
        </div>
      </nav>
    );
  }

  // Estilos de rol
  const getRoleBadge = (rol?: string) => {
    if (rol === 'ROLE_ADMIN' || rol === 'ADMIN') {
      return <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold">Admin</span>;
    }
    if (rol === 'ROLE_GERENTE' || rol === 'GERENTE') {
      return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold">Gerente</span>;
    }
    return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold">Ventas</span>;
  };

  return (
    <nav className="bg-[#1F3D3D] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre de Marca */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-wide text-white">Retail</span>
              <span className="text-xs sm:text-sm text-[#C88D4B] font-medium">Cotizador</span>
            </Link>

            {/* Selector de Sucursal: SOLO INTERACTIVO PARA ADMIN Y GERENTE */}
            {isAdminOrGerente ? (
              sucursales && sucursales.length > 0 ? (
                <div className="relative ml-1 sm:ml-4" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-[#2a5252] hover:bg-[#346262] text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg border border-teal-400/30 transition-colors shadow-sm cursor-pointer"
                    title="Cambiar sucursal activa (Permiso Admin/Gerente)"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold text-teal-100 max-w-[120px] sm:max-w-[200px] truncate">
                      {sucursalActiva?.nombre || 'Seleccionar Sucursal'}
                    </span>
                    <span className="text-[10px] text-teal-300">▼</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200 text-gray-800 animate-fadeIn">
                      <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Sucursales Disponibles
                      </div>
                      {sucursales.map(s => {
                        const isSelected = sucursalActiva?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSucursalActiva(s);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-teal-50 text-[#1F3D3D] font-bold border-l-4 border-[#1F3D3D]'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div>
                              <div className="font-semibold leading-tight">{s.nombre}</div>
                              <div className="text-[10px] text-gray-500">{s.razonSocial}</div>
                            </div>
                            {isSelected && (
                              <span className="text-teal-600 font-bold ml-2">✓</span>
                            )}
                          </button>
                        );
                      })}
                      <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                        <Link
                          to="/sucursales"
                          onClick={() => setDropdownOpen(false)}
                          className="block text-center text-[11px] text-[#C88D4B] hover:text-[#b0783b] font-medium py-1"
                        >
                          ⚙️ Administrar Sucursales y Membretes
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : cargandoSucursales ? (
                <div className="ml-1 sm:ml-3 flex items-center gap-1.5 bg-[#2a5252]/60 text-xs px-2 sm:px-2.5 py-1.5 rounded-lg border border-teal-400/20 text-teal-200">
                  <span className="animate-spin inline-block w-2.5 h-2.5 border-2 border-teal-200 border-t-transparent rounded-full"></span>
                  <span className="text-[11px] hidden sm:inline">Cargando sucursal...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => recargarSucursales()}
                  className="ml-1 sm:ml-3 flex items-center gap-1 bg-amber-900/50 hover:bg-amber-900/70 text-xs px-2 py-1.5 rounded-lg border border-amber-400/30 text-amber-200 cursor-pointer transition-colors"
                >
                  <span>⚠️</span>
                  <span className="text-[11px]">Reconectar BD</span>
                </button>
              )
            ) : (
              /* USUARIOS NO ADMIN: SUCURSAL FIJA BLOQUEADA */
              <div
                className="ml-1 sm:ml-4 flex items-center gap-1.5 bg-[#173030] text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-teal-500/20 text-teal-200 shadow-inner"
                title="Sucursal asignada a tu cuenta de usuario"
              >
                <span className="text-[11px]">🔒</span>
                <span className="font-semibold text-teal-100 max-w-[120px] sm:max-w-[200px] truncate">
                  {sucursalActiva?.nombre || 'Sucursal Asignada'}
                </span>
              </div>
            )}
          </div>

          {/* Menú de Navegación Principal y Perfil */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${isActive('/')}`}
            >
              Nueva Cotización
            </Link>
            <Link
              to="/cotizaciones"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${isActive('/cotizaciones')}`}
            >
              Historial
            </Link>

            {/* Rutas exclusivas para ADMIN */}
            {isAdmin && (
              <Link
                to="/empresas"
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${isActive('/empresas')}`}
                title="Gestión de Empresas (Multi-Tenant)"
              >
                🏛️ Empresas
              </Link>
            )}

            {/* Rutas exclusivas para ADMIN y GERENTE */}
            {isAdminOrGerente && (
              <>
                <Link
                  to="/catalogos"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${isActive('/catalogos')}`}
                  title="Gestión de Clientes, Equipos y Emisores"
                >
                  🗂️ Catálogos
                </Link>
                <Link
                  to="/sucursales"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${isActive('/sucursales')}`}
                  title="Configuración de Sucursales y Membretes"
                >
                  🏢 Sucursales
                </Link>
              </>
            )}

            {/* Perfil del Usuario y Botón de Salir */}
            <div className="ml-2 pl-2 sm:ml-3 sm:pl-3 border-l border-white/15 flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <div className="text-xs font-bold text-white leading-tight flex items-center justify-end gap-1.5">
                  <span>{user?.nombreCompleto || user?.username}</span>
                  {getRoleBadge(user?.rol)}
                </div>
                <div className="text-[10px] text-teal-300/80">
                  {user?.empresaNombre ? `${user.empresaNombre} • ` : ''}
                  {user?.cargo || user?.username}
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="bg-white/10 hover:bg-red-500/80 text-white hover:text-white p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 border border-white/10 shadow-sm"
                title="Cerrar sesión segura"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
