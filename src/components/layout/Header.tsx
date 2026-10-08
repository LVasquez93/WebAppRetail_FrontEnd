import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSucursal } from '../../context/SucursalContext';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenProfile,
}) => {
  const location = useLocation();
  const { user, isAdmin, canSelectSucursal } = useAuth();
  const {
    empresas,
    empresaSeleccionada,
    setEmpresaSeleccionada,
    sucursales,
    sucursalActiva,
    setSucursalActiva,
    cargandoSucursales,
    recargarSucursales,
  } = useSucursal();

  const [empresaDropdownOpen, setEmpresaDropdownOpen] = useState(false);
  const [sucursalDropdownOpen, setSucursalDropdownOpen] = useState(false);
  const [busquedaSucursal, setBusquedaSucursal] = useState('');

  const empresaRef = useRef<HTMLDivElement>(null);
  const sucursalRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns si se hace clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (empresaRef.current && !empresaRef.current.contains(event.target as Node)) {
        setEmpresaDropdownOpen(false);
      }
      if (sucursalRef.current && !sucursalRef.current.contains(event.target as Node)) {
        setSucursalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Título dinámico de la página según la ruta
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return { titulo: 'Dashboard Principal', icon: '📊' };
      case '/cotizaciones/nueva':
        return { titulo: 'Nueva Cotización', icon: '➕' };
      case '/cotizaciones':
        return { titulo: 'Historial de Cotizaciones', icon: '📋' };
      case '/empresas':
        return { titulo: 'Gestión de Empresas (Tenants)', icon: '🏛️' };
      case '/catalogos':
        return { titulo: 'Catálogos Maestros', icon: '🗂️' };
      case '/sucursales':
        return { titulo: 'Configuración de Sucursales', icon: '🏢' };
      default:
        return { titulo: 'Sistema de Cotizaciones', icon: '💼' };
    }
  };

  const sucursalesFiltradas = sucursales.filter(s =>
    busquedaSucursal.trim() === '' ||
    s.nombre.toLowerCase().includes(busquedaSucursal.toLowerCase()) ||
    s.codigo.toLowerCase().includes(busquedaSucursal.toLowerCase())
  );

  const { titulo, icon } = getPageTitle();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs px-3 sm:px-6 flex items-center justify-between gap-3">
      {/* Lado Izquierdo: Botón Hamburguesa + Título de Vista */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          title="Abrir menú de navegación"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0 hidden sm:inline">{icon}</span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-800 truncate leading-tight">
              {titulo}
            </h2>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-400 font-medium leading-none mt-0.5">
              <span>Retail ERP</span>
              <span>›</span>
              <span className="text-[#1F3D3D] font-semibold truncate">{titulo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Conmutadores de Contexto (Empresa + Sucursal) + Perfil */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* 1. SELECTOR DE EMPRESA (Solo SuperAdmin) */}
        {isAdmin && empresas.length > 0 && (
          <div className="relative" ref={empresaRef}>
            <button
              type="button"
              onClick={() => {
                setEmpresaDropdownOpen(!empresaDropdownOpen);
                setSucursalDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition-colors shadow-xs cursor-pointer"
              title="Cambiar organización cliente activa"
            >
              <span>🏛️</span>
              <span className="max-w-[90px] sm:max-w-[140px] truncate font-bold">
                {empresaSeleccionada?.nombre || 'Empresa'}
              </span>
              <span className="text-[10px] text-purple-400">▼</span>
            </button>

            {empresaDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-gray-100 text-gray-800 animate-fadeIn">
                <div className="px-3.5 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    Empresas del SaaS
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {empresas.length}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {empresas.map(emp => {
                    const isSelected = empresaSeleccionada?.id === emp.id;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setEmpresaSeleccionada(emp);
                          setEmpresaDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-purple-50 text-purple-900 font-bold border-l-4 border-purple-600'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate">{emp.nombre}</div>
                          <div className="text-[10px] text-gray-400 truncate">{emp.razonSocial || 'Empresa'}</div>
                        </div>
                        {isSelected && <span className="text-purple-600 font-bold shrink-0">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1.5 px-3">
                  <Link
                    to="/empresas"
                    onClick={() => setEmpresaDropdownOpen(false)}
                    className="block text-center text-xs text-purple-700 hover:text-purple-900 font-bold py-1 rounded-lg hover:bg-purple-50"
                  >
                    ⚙️ Gestionar Organizaciones
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SELECTOR DE SUCURSAL (Interactivo para Admin y Gerente General) */}
        {canSelectSucursal ? (
          sucursales.length > 0 ? (
            <div className="relative" ref={sucursalRef}>
              <button
                type="button"
                onClick={() => {
                  setSucursalDropdownOpen(!sucursalDropdownOpen);
                  setEmpresaDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-[#1F3D3D] border border-teal-200 hover:bg-teal-100 transition-colors shadow-xs cursor-pointer"
                title="Cambiar sucursal activa para cotizar y ver inventario"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="max-w-[90px] sm:max-w-[140px] truncate font-bold">
                  {sucursalActiva?.nombre || 'Sucursal'}
                </span>
                <span className="text-[10px] text-teal-400">▼</span>
              </button>

              {sucursalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl p-2 z-50 border border-gray-100 text-gray-800 animate-fadeIn">
                  <div className="px-2 py-1.5 border-b border-gray-100">
                    <input
                      type="text"
                      value={busquedaSucursal}
                      onChange={(e) => setBusquedaSucursal(e.target.value)}
                      placeholder="Buscar sucursal..."
                      className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {sucursalesFiltradas.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400 italic">
                        No se encontraron sucursales
                      </div>
                    ) : (
                      sucursalesFiltradas.map(s => {
                        const isSelected = sucursalActiva?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSucursalActiva(s);
                              setSucursalDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-teal-50 text-[#1F3D3D] font-bold border-l-4 border-[#1F3D3D]'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold truncate">{s.nombre}</div>
                              <div className="text-[10px] text-gray-400 font-mono truncate">{s.codigo}</div>
                            </div>
                            {isSelected && <span className="text-teal-700 font-bold shrink-0">✓</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="border-t border-gray-100 mt-1 pt-1.5 px-2">
                    <Link
                      to="/sucursales"
                      onClick={() => setSucursalDropdownOpen(false)}
                      className="block text-center text-xs text-[#1F3D3D] hover:text-black font-semibold py-1 rounded-lg hover:bg-gray-100"
                    >
                      ⚙️ Administrar Sucursales
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : cargandoSucursales ? (
            <div className="px-2.5 py-1.5 bg-gray-100 rounded-xl text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
              <span className="hidden sm:inline">Cargando...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => recargarSucursales()}
              className="px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              ⚠️ Reconectar
            </button>
          )
        ) : (
          /* SUCURSAL FIJA (Ventas) */
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-xs"
            title="Sucursal asignada a tu usuario"
          >
            <span>🔒</span>
            <span className="max-w-[100px] sm:max-w-[150px] truncate">
              {sucursalActiva?.nombre || 'Sucursal Asignada'}
            </span>
          </div>
        )}

        {/* 3. BOTÓN RÁPIDO DE PERFIL */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
          title="Editar mi perfil / Cambiar credenciales"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1F3D3D] to-[#2a5252] text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {(user?.nombreCompleto || user?.username || 'U')[0].toUpperCase()}
          </div>
          <span className="hidden xl:inline text-xs font-semibold text-gray-700 max-w-[100px] truncate">
            {user?.username}
          </span>
        </button>
      </div>
    </header>
  );
};
