import React, { useState, useEffect } from 'react';
import { rbacApi } from '../../../api/rbacApi';
import { PermisoDefinicion, UsuarioPermisos } from '../types/rbac.types';
import { Usuario } from '../../catalogos/types/catalogos.types';
import { useAuth } from '../../../context/AuthContext';

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onPermisosActualizados?: () => void;
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  isOpen,
  onClose,
  usuario,
  onPermisosActualizados,
}) => {
  const { recargarSesion, user: currentUser } = useAuth();
  const [catalogo, setCatalogo] = useState<PermisoDefinicion[]>([]);
  const [usuarioPermisos, setUsuarioPermisos] = useState<UsuarioPermisos | null>(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');

  useEffect(() => {
    if (!isOpen || !usuario?.id) return;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        setMensajeExito(null);

        const [catData, permData] = await Promise.all([
          rbacApi.obtenerCatalogo(),
          rbacApi.obtenerPermisosUsuario(usuario.id),
        ]);

        setCatalogo(catData);
        setUsuarioPermisos(permData);
        setPermisosSeleccionados(permData.permisosEfectivos || []);
      } catch (err: any) {
        console.error('Error al cargar permisos del usuario:', err);
        setError('No se pudieron obtener los permisos del usuario.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [isOpen, usuario?.id]);

  if (!isOpen || !usuario) return null;

  const handleTogglePermiso = (codigo: string) => {
    setPermisosSeleccionados(prev =>
      prev.includes(codigo) ? prev.filter(p => p !== codigo) : [...prev, codigo]
    );
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError(null);
      const res = await rbacApi.guardarPermisosUsuario(usuario.id, permisosSeleccionados);
      setUsuarioPermisos(res);
      setPermisosSeleccionados(res.permisosEfectivos);

      if (currentUser?.id === usuario.id) {
        await recargarSesion();
      }
      if (onPermisosActualizados) {
        onPermisosActualizados();
      }

      setMensajeExito('¡Permisos especiales asignados y guardados exitosamente!');
      setTimeout(() => setMensajeExito(null), 3500);
    } catch (err: any) {
      console.error('Error al guardar permisos de usuario:', err);
      setError('Error al guardar los permisos en el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const handleResetDefaults = async () => {
    const confirmar = window.confirm(
      `¿Deseas restablecer los permisos de ${usuario.nombreCompleto} a los valores predeterminados de su rol (${usuario.rol})?`
    );
    if (!confirmar) return;

    try {
      setGuardando(true);
      setError(null);
      const res = await rbacApi.restablecerPermisosUsuario(usuario.id);
      setUsuarioPermisos(res);
      setPermisosSeleccionados(res.permisosEfectivos);

      if (currentUser?.id === usuario.id) {
        await recargarSesion();
      }
      if (onPermisosActualizados) {
        onPermisosActualizados();
      }

      setMensajeExito('Permisos restablecidos a los valores por defecto del rol.');
      setTimeout(() => setMensajeExito(null), 3500);
    } catch (err: any) {
      console.error('Error al restablecer permisos:', err);
      setError('Error al restablecer permisos.');
    } finally {
      setGuardando(false);
    }
  };

  const categorias = ['TODAS', ...Array.from(new Set(catalogo.map(p => p.categoria)))];

  const permisosFiltrados = catalogo.filter(p => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === 'TODAS' || p.categoria === categoriaSeleccionada;
    return coincideTexto && coincideCategoria;
  });

  const getNombreRol = (rolCodigo?: string) => {
    switch (rolCodigo) {
      case 'ROLE_ADMIN':
        return 'Administrador SaaS';
      case 'ROLE_GERENTE_GENERAL':
        return 'Gerente General (Empresa)';
      case 'ROLE_GERENTE_SUCURSAL':
        return 'Gerente de Sucursal';
      case 'ROLE_GERENTE':
        return 'Gerente';
      default:
        return 'Vendedor / Operativo';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera Modal */}
        <div className="bg-[#1F3D3D] text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-xl shadow-md">
              🛡️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Permisos por Usuario: {usuario.nombreCompleto}
              </h2>
              <div className="flex items-center gap-2 text-xs text-teal-200 mt-0.5">
                <span className="font-mono bg-teal-900/80 px-2 py-0.5 rounded font-semibold text-white">
                  @{usuario.username}
                </span>
                <span>•</span>
                <span>Rol base: <strong>{getNombreRol(usuario.rol)}</strong></span>
                <span>•</span>
                <span>{usuario.cargo || 'Personal'}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-teal-200 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {cargando ? (
            <div className="py-16 text-center space-y-3">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1F3D3D] border-t-transparent rounded-full"></div>
              <p className="text-xs text-gray-600 font-semibold">Consultando autorizaciones del colaborador...</p>
            </div>
          ) : (
            <>
              {/* Notificación de Estado de Permisos */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {usuarioPermisos?.tienePermisosPersonalizados ? '✨' : '🛡️'}
                  </span>
                  <div>
                    <div className="font-bold text-gray-800">
                      {usuarioPermisos?.tienePermisosPersonalizados
                        ? 'Configuración Especial Activa'
                        : 'Permisos Predeterminados del Rol'}
                    </div>
                    <div className="text-gray-500">
                      {usuarioPermisos?.tienePermisosPersonalizados
                        ? 'Este usuario posee permisos personalizados que difieren de los valores de fábrica de su rol.'
                        : `Este usuario cuenta con las atribuciones estándar asignadas a ${usuario.rol}.`}
                    </div>
                  </div>
                </div>

                {usuarioPermisos?.tienePermisosPersonalizados && (
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    disabled={guardando}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    🔄 Restablecer a Rol Base
                  </button>
                )}
              </div>

              {mensajeExito && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span>✅</span> {mensajeExito}
                  </span>
                  <button onClick={() => setMensajeExito(null)} className="text-green-700 hover:text-green-900 font-bold">✕</button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {/* Filtros de Permisos */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
                  {categorias.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaSeleccionada(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        categoriaSeleccionada === cat
                          ? 'bg-[#1F3D3D] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-60 relative">
                  <input
                    type="text"
                    value={filtroTexto}
                    onChange={e => setFiltroTexto(e.target.value)}
                    placeholder="🔍 Buscar capacidad..."
                    className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                  {filtroTexto && (
                    <button
                      onClick={() => setFiltroTexto('')}
                      className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Listado Interactivo de Permisos */}
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {permisosFiltrados.map(permiso => {
                  const estaActivo = permisosSeleccionados.includes(permiso.codigo);
                  const estaEnRolBase = usuarioPermisos?.permisosRolPorDefecto.includes(permiso.codigo);
                  const esEspecialOtorgado = estaActivo && !estaEnRolBase;
                  const esRevocado = !estaActivo && estaEnRolBase;

                  return (
                    <div
                      key={permiso.codigo}
                      onClick={() => handleTogglePermiso(permiso.codigo)}
                      className={`p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        estaActivo ? 'bg-teal-50/30 hover:bg-teal-50/60' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={estaActivo}
                          onChange={() => {}} // Manejado por div padre
                          className="mt-1 w-4 h-4 text-[#1F3D3D] rounded border-gray-300 focus:ring-[#1F3D3D] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {permiso.nombre}
                            </span>
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded border border-gray-200">
                              {permiso.codigo}
                            </span>
                            {esEspecialOtorgado && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                ✨ Especial Otorgado
                              </span>
                            )}
                            {esRevocado && (
                              <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                                🚫 Revocado
                              </span>
                            )}
                            {estaEnRolBase && !esRevocado && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.2 rounded font-medium">
                                En rol base
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                            {permiso.descripcion}
                          </p>
                          <span className="inline-block mt-1 text-[10px] bg-teal-50 text-[#1F3D3D] font-semibold px-1.5 py-0.2 rounded border border-teal-200/50">
                            📂 {permiso.categoria}
                          </span>
                        </div>
                      </div>

                      {/* Switch Visual */}
                      <div className="shrink-0">
                        <div
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                            estaActivo ? 'bg-[#1F3D3D]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              estaActivo ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-gray-500">
            <span>Permisos habilitados: </span>
            <strong className="text-gray-800">{permisosSeleccionados.length}</strong> de {catalogo.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando || cargando}
              className="px-5 py-2 bg-[#1F3D3D] hover:bg-[#2a5252] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {guardando ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                  Guardando Permisos...
                </>
              ) : (
                <>
                  <span>💾</span> Guardar Permisos de Usuario
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
