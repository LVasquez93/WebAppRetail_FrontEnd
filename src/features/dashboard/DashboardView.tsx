import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSucursal } from '../../context/SucursalContext';

export const DashboardView: React.FC = () => {
  const { user, isAdmin, isGerente, isAdminOrGerente } = useAuth();
  const { sucursalActiva, empresas, empresaSeleccionada, setEmpresaSeleccionada } = useSucursal();

  const getRoleName = () => {
    if (isAdmin) return 'Super Administrador SaaS';
    if (isGerente) return 'Gerente de Empresa';
    return 'Ejecutivo de Ventas';
  };

  const getRoleBadgeStyle = () => {
    if (isAdmin) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (isGerente) return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero / Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-[#1F3D3D] via-[#244b4b] to-[#2f5e5e] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute right-20 -top-10 w-48 h-48 bg-[#C88D4B]/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${getRoleBadgeStyle()}`}>
                🛡️ {getRoleName()}
              </span>
              {isAdmin ? (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-900/40 text-purple-200 border border-purple-400/30">
                  🌐 Plataforma Multi-Tenant Global
                </span>
              ) : user?.empresaNombre ? (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-teal-100 border border-white/15">
                  🏢 {user.empresaNombre}
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ¡Hola, {user?.nombreCompleto || user?.username}! 👋
            </h1>
            <p className="text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              {isAdmin
                ? `Como Super Administrador tienes visibilidad y control sobre todas las organizaciones clientes registradas en la plataforma. Actualmente inspeccionando: ${empresaSeleccionada?.nombre || 'Ninguna empresa seleccionada'}.`
                : 'Bienvenido al sistema corporativo de cotizaciones. Selecciona un módulo para gestionar propuestas comerciales, sucursales y catálogos.'}
            </p>
          </div>

          {/* Tarjeta de Contexto Activo (Empresa y Sucursal) */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[280px] space-y-3 self-start md:self-auto shadow-inner">
            {isAdmin && empresas.length > 0 && (
              <div className="space-y-1 pb-2 border-b border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-purple-200 font-bold flex items-center justify-between">
                  <span>🏛️ Empresa Seleccionada</span>
                  <Link to="/empresas" className="text-purple-300 hover:text-white underline text-[10px]">Gestionar</Link>
                </div>
                <select
                  value={empresaSeleccionada?.id || ''}
                  onChange={(e) => {
                    const emp = empresas.find(em => em.id === Number(e.target.value)) || null;
                    setEmpresaSeleccionada(emp);
                  }}
                  className="w-full bg-[#173030] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-teal-400/30 focus:outline-none focus:ring-1 focus:ring-teal-300 cursor-pointer"
                >
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-200 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Sucursal Activa
              </div>
              <div className="font-bold text-white text-base truncate">
                {sucursalActiva?.nombre || 'Sin sucursal asignada'}
              </div>
              <div className="text-xs text-teal-200/80 truncate">
                {sucursalActiva?.razonSocial || 'Configura los datos fiscales en Sucursales'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Módulos (Filtrados por RBAC) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🚀</span> Módulos del Sistema
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Permisos asignados a tu rol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta 1: Nueva Cotización (Todos) */}
          <Link
            to="/cotizaciones/nueva"
            className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100 hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-3 bg-emerald-50 text-emerald-700 rounded-2xl group-hover:scale-110 transition-transform">
                  📝
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  Emisión
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                Nueva Cotización
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Emite propuestas comerciales formales con cálculo legal de 13% IVA, conversión automática a letras y previsualización de PDF.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Crear propuesta ahora</span>
              <span>→</span>
            </div>
          </Link>

          {/* Tarjeta 2: Historial de Cotizaciones (Todos) */}
          <Link
            to="/cotizaciones"
            className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100 hover:border-sky-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-3 bg-sky-50 text-sky-700 rounded-2xl group-hover:scale-110 transition-transform">
                  📊
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
                  Historial
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-sky-700 transition-colors">
                Historial de Cotizaciones
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Consulta el registro completo de cotizaciones emitidas, busca por correlativo o cliente y descarga copias oficiales en PDF.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform">
              <span>Ver historial de cotizaciones</span>
              <span>→</span>
            </div>
          </Link>

          {/* Tarjeta 3: Sucursales y Membretes (Admin y Gerente) */}
          {isAdminOrGerente && (
            <Link
              to="/sucursales"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100 hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 bg-indigo-50 text-indigo-700 rounded-2xl group-hover:scale-110 transition-transform">
                    🏢
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                    Sedes
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                  Sucursales y Membretes
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Crea y configura sucursales, personaliza los membretes oficiales (banners superior/inferior) y firmas digitales para los PDFs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-700 group-hover:translate-x-1 transition-transform">
                <span>Gestionar sucursales</span>
                <span>→</span>
              </div>
            </Link>
          )}

          {/* Tarjeta 4: Catálogos y Carga Masiva (Admin y Gerente) */}
          {isAdminOrGerente && (
            <Link
              to="/catalogos"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100 hover:border-amber-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 bg-amber-50 text-amber-700 rounded-2xl group-hover:scale-110 transition-transform">
                    🗂️
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                    Catálogos
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                  Catálogos Comerciales
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Administra la cartera de clientes, el catálogo de productos/equipos y vendedores, con importación rápida desde Excel o CSV.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                <span>Administrar catálogos</span>
                <span>→</span>
              </div>
            </Link>
          )}

          {/* Tarjeta 5: Gestión Central de Empresas (Exclusivo SuperAdmin) */}
          {isAdmin && (
            <Link
              to="/empresas"
              className="group bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-md hover:shadow-xl border border-purple-200 hover:border-purple-400 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 bg-purple-100 text-purple-700 rounded-2xl group-hover:scale-110 transition-transform">
                    🏛️
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-200 text-purple-900 px-2.5 py-1 rounded-full">
                    SuperAdmin
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  Gestión de Empresas (SaaS)
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Supervisa las organizaciones clientes registradas en la plataforma, crea nuevas empresas y aprovisiona sus cuentas de Gerentes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
                <span>Panel de empresas</span>
                <span>→</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="text-xs font-bold text-gray-800">
              Personalización Multi-Empresa activa
            </div>
            <div className="text-[11px] text-gray-500">
              Cada cotización emitida utiliza el membrete visual, pie de página y firma digital de la sucursal activa.
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          Moneda: USD ($) • IVA: 13.00%
        </div>
      </div>
    </div>
  );
};
