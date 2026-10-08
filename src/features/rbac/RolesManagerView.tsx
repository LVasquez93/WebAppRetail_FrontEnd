import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSucursal } from '../../context/SucursalContext';
import { rbacApi } from '../../api/rbacApi';
import { usuariosApi } from '../../api/catalogosApi';
import { RbacMatriz, RolPermisos } from './types/rbac.types';
import { Usuario } from '../catalogos/types/catalogos.types';
import { UserPermissionsModal } from './components/UserPermissionsModal';

export const RolesManagerView: React.FC = () => {
  const { user, isAdmin, recargarSesion } = useAuth();
  const { sucursales, empresaSeleccionada } = useSucursal();

  // Pestaña principal: 'USUARIOS' | 'ROLES'
  const [tabPrincipal, setTabPrincipal] = useState<'USUARIOS' | 'ROLES'>('USUARIOS');

  // Estados para Matriz de Roles
  const [matriz, setMatriz] = useState<RbacMatriz | null>(null);
  const [cargandoMatriz, setCargandoMatriz] = useState<boolean>(true);
  const [guardandoMatriz, setGuardandoMatriz] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtroTextoMatriz, setFiltroTextoMatriz] = useState<string>('');
  const [categoriaSeleccionadaMatriz, setCategoriaSeleccionadaMatriz] = useState<string>('TODAS');
  const [hayCambiosMatriz, setHayCambiosMatriz] = useState<boolean>(false);

  // Estados para Permisos por Usuario
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState<boolean>(true);
  const [busquedaUsuario, setBusquedaUsuario] = useState<string>('');
  const [soloConPermisosEspeciales, setSoloConPermisosEspeciales] = useState<boolean>(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [modalPermisosAbierto, setModalPermisosAbierto] = useState<boolean>(false);

  // Cargar Matriz de Roles Base
  const cargarMatriz = async () => {
    try {
      setCargandoMatriz(true);
      setError(null);
      const data = await rbacApi.obtenerMatriz();
      setMatriz(data);
      setHayCambiosMatriz(false);
    } catch (err: any) {
      console.error('Error al cargar matriz RBAC:', err);
      setError('No se pudo cargar la configuración de permisos desde el servidor.');
    } finally {
      setCargandoMatriz(false);
    }
  };

  // Cargar Lista de Usuarios para gestión individual
  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);
      const empId = isAdmin ? empresaSeleccionada?.id : user?.empresaId;
      const data = await usuariosApi.listarOBuscar(undefined, empId);
      setUsuarios(data);
    } catch (err: any) {
      console.error('Error al cargar lista de usuarios para RBAC:', err);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  useEffect(() => {
    cargarMatriz();
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [empresaSeleccionada?.id, user?.empresaId]);

  const handleTogglePermisoMatriz = (rolCodigo: string, permisoCodigo: string) => {
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
    setHayCambiosMatriz(true);
  };

  const handleGuardarMatriz = async () => {
    if (!isAdmin || !matriz) return;
    try {
      setGuardandoMatriz(true);
      setError(null);
      const updated = await rbacApi.guardarMatriz(matriz);
      setMatriz(updated);
      setHayCambiosMatriz(false);
      await recargarSesion();
      setMensajeExito('¡Matriz de roles y permisos actualizada exitosamente en el servidor!');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      console.error('Error al guardar matriz:', err);
      setError('Ocurrió un error al guardar los permisos en la base de datos.');
    } finally {
      setGuardandoMatriz(false);
    }
  };

  const handleResetDefaultsMatriz = async () => {
    if (!isAdmin) return;
    const confirmar = window.confirm(
      '¿Estás seguro de que deseas restablecer los permisos de todos los roles a sus valores predeterminados de fábrica?'
    );
    if (!confirmar) return;

    try {
      setGuardandoMatriz(true);
      setError(null);
      const updated = await rbacApi.restablecerDefaults();
      setMatriz(updated);
      setHayCambiosMatriz(false);
      await recargarSesion();
      setMensajeExito('¡Permisos de roles restablecidos a los valores predeterminados!');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      console.error('Error al restablecer defaults:', err);
      setError('Error al restablecer los valores por defecto.');
    } finally {
      setGuardandoMatriz(false);
    }
  };

  const obtenerNombreSucursal = (id?: number) => {
    if (!id) return 'Toda la Empresa';
    const s = sucursales.find(suc => suc.id === id);
    return s ? s.nombre : `Sucursal #${id}`;
  };

  const getNombreRol = (rolCodigo?: string) => {
    switch (rolCodigo) {
      case 'ROLE_ADMIN':
        return 'Administrador SaaS';
      case 'ROLE_GERENTE_GENERAL':
        return 'Gerente General';
      case 'ROLE_GERENTE_SUCURSAL':
      case 'ROLE_GERENTE':
        return 'Gerente de Sucursal';
      default:
        return 'Vendedor / Emisor';
    }
  };

  // Filtrado de usuarios
  const usuariosFiltrados = usuarios.filter(u => {
    const query = busquedaUsuario.toLowerCase().trim();
    const coincideTexto =
      !query ||
      u.nombreCompleto?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.cargo?.toLowerCase().includes(query) ||
      u.correo?.toLowerCase().includes(query);

    const coincideFiltroEspecial = !soloConPermisosEspeciales || Boolean(u.tienePermisosPersonalizados);

    return coincideTexto && coincideFiltroEspecial;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Banner Principal de Cabecera */}
      <div className="bg-gradient-to-r from-[#1F3D3D] to-[#285252] text-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black flex items-center gap-2">
                <span>🛡️</span> Gestión de Control de Acceso (RBAC)
              </h1>
              {isAdmin ? (
                <span className="bg-purple-900/60 border border-purple-400/40 text-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  🏛️ {empresaSeleccionada?.nombre || 'SaaS Global'}
                </span>
              ) : user?.empresaNombre ? (
                <span className="bg-teal-900/60 border border-teal-400/40 text-teal-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  🏢 {user.empresaNombre}
                </span>
              ) : null}
            </div>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-3xl">
              Configura permisos granulares por usuario colaborador o consulta las plantillas de roles base predeterminadas para el sistema.
            </p>
          </div>

          {/* Selector de Pestañas Principales */}
          <div className="bg-[#142929] p-1.5 rounded-xl flex gap-1 border border-teal-500/20 shrink-0">
            <button
              type="button"
              onClick={() => setTabPrincipal('USUARIOS')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                tabPrincipal === 'USUARIOS'
                  ? 'bg-white text-[#1F3D3D] shadow-md'
                  : 'text-teal-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>👤</span> Permisos por Usuario
            </button>
            <button
              type="button"
              onClick={() => setTabPrincipal('ROLES')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                tabPrincipal === 'ROLES'
                  ? 'bg-white text-[#1F3D3D] shadow-md'
                  : 'text-teal-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🛡️</span> Plantillas de Roles Base
            </button>
          </div>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-center">
          <p className="font-bold text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 1: GESTIÓN DE PERMISOS POR USUARIO (RECOMENDADO)    */}
      {/* ========================================================= */}
      {tabPrincipal === 'USUARIOS' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Explicación Operativa */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">💡</span>
            <div className="text-xs sm:text-sm text-amber-900 space-y-1">
              <p className="font-bold text-amber-950">
                Permisos Individuales por Colaborador (Sobrescritura Granular)
              </p>
              <p className="leading-relaxed text-amber-800">
                Cada usuario hereda inicialmente las atribuciones de su rol base. Desde este módulo puedes <strong>otorgar facultades adicionales especiales</strong> (por ejemplo, permitir que un vendedor o supervisor cree clientes, importe productos o registre usuarios) o <strong>revocar permisos específicos</strong>, sin tener que alterar la estructura global de los roles.
              </p>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda de Usuarios */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative flex-1 w-full md:w-auto">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={busquedaUsuario}
                onChange={e => setBusquedaUsuario(e.target.value)}
                placeholder="Buscar por colaborador, usuario (@username), cargo o email..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3D3D]"
              />
              {busquedaUsuario && (
                <button
                  onClick={() => setBusquedaUsuario('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setSoloConPermisosEspeciales(!soloConPermisosEspeciales)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  soloConPermisosEspeciales
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                ✨ Solo con Permisos Especiales ({usuarios.filter(u => u.tienePermisosPersonalizados).length})
              </button>

              <button
                type="button"
                onClick={cargarUsuarios}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-gray-300 flex items-center gap-1.5"
                title="Actualizar listado de usuarios"
              >
                <span>🔄</span> Refrescar
              </button>
            </div>
          </div>

          {/* Tabla / Listado de Usuarios */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {cargandoUsuarios ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1F3D3D] border-t-transparent rounded-full mb-3"></div>
                <p className="text-sm font-medium">Cargando colaboradores de la empresa...</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">
                No se encontraron usuarios coincidentes con el criterio de búsqueda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px] text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">Colaborador</th>
                      <th className="p-3">Rol Base Asignado</th>
                      <th className="p-3">Sucursal</th>
                      <th className="p-3">Estado de Permisos</th>
                      <th className="p-3 w-44 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usuariosFiltrados.map((u, idx) => {
                      const tieneEspeciales = Boolean(u.tienePermisosPersonalizados);

                      return (
                        <tr key={u.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-3 text-center text-gray-400 font-mono">{idx + 1}</td>

                          {/* Colaborador */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-teal-100 text-[#1F3D3D] font-black text-xs flex items-center justify-center shrink-0 border border-teal-200">
                                {u.nombreCompleto?.charAt(0) || u.username.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{u.nombreCompleto}</div>
                                <div className="text-xs text-blue-700 font-mono">@{u.username}</div>
                                {u.cargo && <div className="text-[11px] text-gray-500">{u.cargo}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Rol Base */}
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                              u.rol === 'ROLE_ADMIN'
                                ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                                : u.rol === 'ROLE_GERENTE_GENERAL'
                                ? 'bg-teal-100 text-[#1F3D3D] border-teal-300 font-bold'
                                : u.rol === 'ROLE_GERENTE_SUCURSAL' || u.rol === 'ROLE_GERENTE'
                                ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              {getNombreRol(u.rol)}
                            </span>
                          </td>

                          {/* Sucursal */}
                          <td className="p-3 text-gray-600">
                            {u.rol === 'ROLE_ADMIN' ? (
                              <span className="text-xs text-purple-800 font-semibold">🛡️ Root SaaS</span>
                            ) : u.rol === 'ROLE_GERENTE_GENERAL' || !u.sucursalId ? (
                              <span className="text-xs text-teal-800 font-semibold">🏢 Toda la Empresa</span>
                            ) : (
                              <span>{obtenerNombreSucursal(u.sucursalId)}</span>
                            )}
                          </td>

                          {/* Estado de Permisos */}
                          <td className="p-3">
                            {tieneEspeciales ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <span>✨</span> Permisos Especiales Activos
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                <span>🛡️</span> Hereda de {getNombreRol(u.rol)}
                              </span>
                            )}
                          </td>

                          {/* Acción Configurar */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setUsuarioSeleccionado(u);
                                setModalPermisosAbierto(true);
                              }}
                              className="px-3.5 py-1.5 bg-[#1F3D3D] hover:bg-[#285252] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 mx-auto"
                            >
                              <span>🛡️</span> Configurar Permisos
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 2: MATRIZ DE ROLES BASE (PLANTILLAS GLOBALES)        */}
      {/* ========================================================= */}
      {tabPrincipal === 'ROLES' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Barra de Acciones de la Matriz (Guardar / Reset) */}
          <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-teal-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>🛡️</span> Plantillas de Permisos Predeterminadas por Rol
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Los nuevos usuarios creados obtienen automáticamente la plantilla correspondiente a su rol, a menos que se configure una excepción individual.
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDefaultsMatriz}
                  disabled={guardandoMatriz}
                  className="px-3.5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  title="Restablecer todos los roles a sus valores predeterminados de fábrica"
                >
                  <span>🔄</span> Restablecer Defaults
                </button>
                <button
                  type="button"
                  onClick={handleGuardarMatriz}
                  disabled={guardandoMatriz || !hayCambiosMatriz}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                    hayCambiosMatriz
                      ? 'bg-[#1F3D3D] hover:bg-[#2a5252] text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {guardandoMatriz ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span>💾</span> Guardar Plantillas de Roles
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Tarjetas de Niveles en Cascada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nivel 1: SuperAdmin */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-purple-800/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Nivel 1 • Root Global
                </span>
                <span className="text-xl">👑</span>
              </div>
              <div className="font-bold text-sm text-purple-100">SuperAdmin SaaS</div>
              <div className="text-[11px] text-purple-200/90 leading-relaxed">
                Dueño del software. Crea y gestiona empresas clientes (tenants), administra la matriz global y posee bypass root completo.
              </div>
              <div className="pt-1 text-[10px] text-purple-300 font-mono">
                Identificador: ROLE_ADMIN
              </div>
            </div>

            {/* Nivel 2: Gerente General */}
            <div className="bg-gradient-to-br from-[#1F3D3D] to-teal-950 text-white rounded-2xl p-4 shadow-md border border-teal-800/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  Nivel 2 • Tenant Owner
                </span>
                <span className="text-xl">🏢</span>
              </div>
              <div className="font-bold text-sm text-teal-100">Gerente General</div>
              <div className="text-[11px] text-teal-200/90 leading-relaxed">
                Dueño de la empresa cliente. Crea sucursales, designa gerentes de sede, gestiona catálogos e inspecciona todas las cotizaciones.
              </div>
              <div className="pt-1 text-[10px] text-teal-300 font-mono">
                Identificador: ROLE_GERENTE_GENERAL
              </div>
            </div>

            {/* Nivel 3: Gerente de Sucursal */}
            <div className="bg-gradient-to-br from-[#2D5A5A] to-cyan-950 text-white rounded-2xl p-4 shadow-md border border-cyan-800/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                  Nivel 3 • Branch Admin
                </span>
                <span className="text-xl">🏬</span>
              </div>
              <div className="font-bold text-sm text-cyan-100">Gerente de Sucursal</div>
              <div className="text-[11px] text-cyan-200/90 leading-relaxed">
                Administra su sede específica, configura membretes, gestiona inventario/clientes y crea usuarios de ventas para su sucursal.
              </div>
              <div className="pt-1 text-[10px] text-cyan-300 font-mono">
                Identificador: ROLE_GERENTE_SUCURSAL
              </div>
            </div>

            {/* Nivel 4: Vendedor */}
            <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white rounded-2xl p-4 shadow-md border border-amber-800/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30">
                  Nivel 4 • Operativo
                </span>
                <span className="text-xl">💼</span>
              </div>
              <div className="font-bold text-sm text-amber-100">Vendedor / Emisor</div>
              <div className="text-[11px] text-amber-200/90 leading-relaxed">
                Usuario operativo asignado a sucursal. Consulta catálogos y emite cotizaciones autorizadas para su sede.
              </div>
              <div className="pt-1 text-[10px] text-amber-300 font-mono">
                Identificador: ROLE_VENTAS
              </div>
            </div>
          </div>

          {/* Filtros de la Matriz */}
          {matriz && (
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                {['TODAS', ...Array.from(new Set(matriz.catalogoPermisos.map(p => p.categoria)))].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoriaSeleccionadaMatriz(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      categoriaSeleccionadaMatriz === cat
                        ? 'bg-[#1F3D3D] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-72 relative">
                <input
                  type="text"
                  value={filtroTextoMatriz}
                  onChange={e => setFiltroTextoMatriz(e.target.value)}
                  placeholder="🔍 Buscar permiso o código..."
                  className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1F3D3D]"
                />
                {filtroTextoMatriz && (
                  <button
                    onClick={() => setFiltroTextoMatriz('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tabla Matriz RBAC */}
          {cargandoMatriz ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border-l-4 border-[#1F3D3D]">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1F3D3D] border-t-transparent rounded-full mb-3"></div>
              <p className="text-gray-700 font-semibold text-sm">Cargando matriz interactiva de roles y permisos...</p>
            </div>
          ) : matriz ? (
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
                    {matriz.catalogoPermisos
                      .filter(p => {
                        const coincideTexto =
                          p.nombre.toLowerCase().includes(filtroTextoMatriz.toLowerCase()) ||
                          p.codigo.toLowerCase().includes(filtroTextoMatriz.toLowerCase()) ||
                          p.descripcion.toLowerCase().includes(filtroTextoMatriz.toLowerCase());
                        const coincideCategoria =
                          categoriaSeleccionadaMatriz === 'TODAS' || p.categoria === categoriaSeleccionadaMatriz;
                        return coincideTexto && coincideCategoria;
                      })
                      .map((permiso, idx) => {
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
                                      onChange={() => handleTogglePermisoMatriz(rolConfig.rol, permiso.codigo)}
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
          ) : null}

          {/* Floating Save Bar when dirty */}
          {hayCambiosMatriz && isAdmin && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#132828] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-teal-600/50 flex items-center gap-4 animate-bounce">
              <div className="text-xs sm:text-sm font-semibold text-teal-200">
                ⚠️ Tienes cambios pendientes en la matriz de roles base.
              </div>
              <button
                type="button"
                onClick={handleGuardarMatriz}
                disabled={guardandoMatriz}
                className="bg-[#C88D4B] hover:bg-amber-600 text-gray-900 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {guardandoMatriz ? 'Guardando...' : '💾 Guardar Ahora'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE PERMISOS ESPECIALES POR USUARIO                  */}
      {/* ========================================================= */}
      <UserPermissionsModal
        isOpen={modalPermisosAbierto}
        usuario={usuarioSeleccionado}
        onClose={() => {
          setModalPermisosAbierto(false);
          setUsuarioSeleccionado(null);
        }}
        onPermisosActualizados={() => {
          cargarUsuarios();
        }}
      />
    </div>
  );
};
