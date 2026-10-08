import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { rbacApi } from '../../api/rbacApi';
import { RbacMatriz, RolPermisos } from './types/rbac.types';

export const RolesManagerView: React.FC = () => {
  const { isAdmin, recargarSesion } = useAuth();
  const [matriz, setMatriz] = useState<RbacMatriz | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');
  const [hayCambios, setHayCambios] = useState<boolean>(false);

  const cargarMatriz = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await rbacApi.obtenerMatriz();
      setMatriz(data);
      setHayCambios(false);
    } catch (err: any) {
      console.error('Error al cargar matriz RBAC:', err);
      setError('No se pudo cargar la configuración de permisos desde el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMatriz();
  }, []);

  const handleTogglePermiso = (rolCodigo: string, permisoCodigo: string) => {
    if (!isAdmin || !matriz) return;
    if (rolCodigo === 'ROLE_ADMIN' && permisoCodigo === 'RBAC_GESTIONAR') {
      alert('El permiso RBAC_GESTIONAR no puede retirarse del SuperAdmin para evitar bloqueo del sistema.');
      return;
    }

    setMatriz(prev => {
      if (!prev) return prev;
      const nuevosRoles: RolPermisos[] = prev.roles.map(r => {
        if (r.rol !== rolCodigo) return r;
        const yaTiene = r.permisos.includes(permisoCodigo);
        const nuevosPermisos = yaTiene
          ? r.permisos.filter(p => p !== permisoCodigo)
          : [...r.permisos, permisoCodigo];
        return {
          ...r,
          permisos: nuevosPermisos,
        };
      });

      return {
        ...prev,
        roles: nuevosRoles,
      };
    });
    setHayCambios(true);
  };

  const handleGuardar = async () => {
    if (!isAdmin || !matriz) return;
    try {
      setGuardando(true);
      setError(null);
      const updated = await rbacApi.guardarMatriz(matriz);
      setMatriz(updated);
      setHayCambios(false);
      await recargarSesion();
      setMensajeExito('¡Matriz de roles y permisos actualizada exitosamente en el servidor!');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      console.error('Error al guardar matriz:', err);
      setError('Ocurrió un error al guardar los permisos en la base de datos.');
    } finally {
      setGuardando(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!isAdmin) return;
    const confirmar = window.confirm(
      '¿Estás seguro de que deseas restablecer los permisos de todos los roles a sus valores predeterminados de fábrica?'
    );
    if (!confirmar) return;

    try {
      setGuardando(true);
      setError(null);
      const updated = await rbacApi.restablecerDefaults();
      setMatriz(updated);
      setHayCambios(false);
      await recargarSesion();
      setMensajeExito('¡Permisos restablecidos a los valores predeterminados!');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      console.error('Error al restablecer defaults:', err);
      setError('Error al restablecer los valores por defecto.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-12 text-center border-l-4 border-[#1F3D3D]">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1F3D3D] border-t-transparent rounded-full mb-3"></div>
          <p className="text-gray-700 font-semibold text-sm">Cargando matriz interactiva de roles y permisos...</p>
        </div>
      </div>
    );
  }

  if (error || !matriz) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center space-y-3">
          <p className="font-bold text-base">⚠️ {error || 'Error de conexión'}</p>
          <button
            onClick={cargarMatriz}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-sm"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Extraer categorías únicas
  const categorias = ['TODAS', ...Array.from(new Set(matriz.catalogoPermisos.map(p => p.categoria)))];

  // Filtrar permisos
  const permisosFiltrados = matriz.catalogoPermisos.filter(p => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === 'TODAS' || p.categoria === categoriaSeleccionada;
    return coincideTexto && coincideCategoria;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Banner de Cabecera */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-[#1F3D3D]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <span>🛡️</span> Matriz de Roles y Permisos (RBAC)
              </h1>
              <span className="bg-teal-100 text-[#1F3D3D] border border-teal-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Arquitectura Multi-Tenant & Jerarquía en Cascada
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl">
              Configura visualmente las capacidades de cada nivel operativo en el ERP. Los roles superiores heredan en cascada las atribuciones de los roles inferiores dentro de su alcance organizacional.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={guardando}
                className="px-3.5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                title="Restablecer todos los roles a sus valores predeterminados sugeridos"
              >
                <span>🔄</span> Restablecer Defaults
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={guardando || !hayCambios}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  hayCambios
                    ? 'bg-[#1F3D3D] hover:bg-[#2a5252] text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {guardando ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>💾</span> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {mensajeExito && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-sm animate-fadeIn">
          <span className="flex items-center gap-2 font-medium">
            <span>✅</span> {mensajeExito}
          </span>
          <button onClick={() => setMensajeExito(null)} className="text-green-700 hover:text-green-900 font-bold">✕</button>
        </div>
      )}

      {/* Tarjeta de Resumen Visual de la Jerarquía en Cascada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1: SuperAdmin */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-purple-800/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Nivel 1 • Root Global
            </span>
            <span className="text-xl">👑</span>
          </div>
          <div className="font-bold text-sm text-purple-100">SuperAdmin SaaS</div>
          <div className="text-[11px] text-purple-200/90 leading-relaxed">
            Dueño de la plataforma SaaS. Administra empresas (tenants), gestiona la matriz RBAC y cuenta con bypass root sin restricciones.
          </div>
          <div className="pt-1 text-[10px] text-purple-300 font-mono">
            Identificador: ROLE_ADMIN
          </div>
        </div>

        {/* Tier 2: Gerente General */}
        <div className="bg-gradient-to-br from-[#1F3D3D] to-teal-950 text-white rounded-2xl p-4 shadow-md border border-teal-800/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
              Nivel 2 • Tenant Owner
            </span>
            <span className="text-xl">🏢</span>
          </div>
          <div className="font-bold text-sm text-teal-100">Gerente General</div>
          <div className="text-[11px] text-teal-200/90 leading-relaxed">
            Dueño de la empresa cliente. Crea sucursales, nombra gerentes de sede, gestiona catálogos y supervisa cotizaciones de toda su empresa.
          </div>
          <div className="pt-1 text-[10px] text-teal-300 font-mono">
            Identificador: ROLE_GERENTE_GENERAL
          </div>
        </div>

        {/* Tier 3: Gerente de Sucursal */}
        <div className="bg-gradient-to-br from-[#2D5A5A] to-cyan-950 text-white rounded-2xl p-4 shadow-md border border-cyan-800/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
              Nivel 3 • Branch Admin
            </span>
            <span className="text-xl">🏬</span>
          </div>
          <div className="font-bold text-sm text-cyan-100">Gerente de Sucursal</div>
          <div className="text-[11px] text-cyan-200/90 leading-relaxed">
            Encargado de sede específica. Configura datos y membretes de su sucursal, administra catálogos y crea vendedores para su sede.
          </div>
          <div className="pt-1 text-[10px] text-cyan-300 font-mono">
            Identificador: ROLE_GERENTE_SUCURSAL
          </div>
        </div>

        {/* Tier 4: Vendedor */}
        <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white rounded-2xl p-4 shadow-md border border-amber-800/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30">
              Nivel 4 • Operativo
            </span>
            <span className="text-xl">💼</span>
          </div>
          <div className="font-bold text-sm text-amber-100">Vendedor / Emisor</div>
          <div className="text-[11px] text-amber-200/90 leading-relaxed">
            Colaborador final asignado a sucursal. Consulta catálogos y emite cotizaciones fiscales autorizadas para su sede.
          </div>
          <div className="pt-1 text-[10px] text-amber-300 font-mono">
            Identificador: ROLE_VENTAS
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Selector de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categorias.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                categoriaSeleccionada === cat
                  ? 'bg-[#1F3D3D] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Campo de Búsqueda */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            value={filtroTexto}
            onChange={e => setFiltroTexto(e.target.value)}
            placeholder="🔍 Buscar permiso o código..."
            className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1F3D3D]"
          />
          {filtroTexto && (
            <button
              onClick={() => setFiltroTexto('')}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabla Matriz RBAC */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#1F3D3D] text-white">
                <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider min-w-[260px]">
                  Permiso / Capacidad Funcional
                </th>
                {matriz.roles.map(r => (
                  <th
                    key={r.rol}
                    className="py-3.5 px-3 font-bold text-xs text-center uppercase tracking-wider min-w-[130px] border-l border-white/10"
                  >
                    <div>{r.nombreRol}</div>
                    <div className="text-[10px] text-teal-300 font-mono font-normal">{r.rol}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permisosFiltrados.map((permiso, idx) => {
                return (
                  <tr
                    key={permiso.codigo}
                    className={`hover:bg-teal-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {/* Detalle del Permiso */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{permiso.nombre}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono border border-gray-200">
                          {permiso.codigo}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {permiso.descripcion}
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] bg-teal-50 text-[#1F3D3D] font-semibold px-2 py-0.5 rounded border border-teal-200/60">
                          📂 {permiso.categoria}
                        </span>
                      </div>
                    </td>

                    {/* Columnas para cada Rol */}
                    {matriz.roles.map(rolConfig => {
                      const tienePermiso = rolConfig.permisos.includes(permiso.codigo);
                      const isSuperAdmin = rolConfig.rol === 'ROLE_ADMIN';
                      const esPermisoCritico = isSuperAdmin && permiso.codigo === 'RBAC_GESTIONAR';

                      return (
                        <td
                          key={rolConfig.rol}
                          className="py-3 px-3 text-center border-l border-gray-100 align-middle"
                        >
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tienePermiso}
                              disabled={!isAdmin || esPermisoCritico}
                              onChange={() => handleTogglePermiso(rolConfig.rol, permiso.codigo)}
                              className="sr-only peer"
                            />
                            <div className={`relative w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                              tienePermiso
                                ? isSuperAdmin
                                  ? 'peer-checked:bg-purple-700'
                                  : 'peer-checked:bg-[#1F3D3D]'
                                : 'bg-gray-200'
                            } ${!isAdmin || esPermisoCritico ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`} />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Bar when dirty */}
      {hayCambios && isAdmin && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#132828] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-teal-600/50 flex items-center gap-4 animate-bounce">
          <div className="text-xs sm:text-sm font-semibold text-teal-200">
            ⚠️ Tienes cambios pendientes en la matriz de permisos.
          </div>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-[#C88D4B] hover:bg-amber-600 text-gray-900 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            {guardando ? 'Guardando...' : '💾 Guardar Ahora'}
          </button>
        </div>
      )}
    </div>
  );
};
