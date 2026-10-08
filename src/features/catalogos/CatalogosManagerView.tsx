import React, { useState, useEffect } from 'react';
import { Cliente, Equipo, Usuario } from './types/catalogos.types';
import { clientesApi, equiposApi, usuariosApi } from '../../api/catalogosApi';
import { useSucursal } from '../../context/SucursalContext';
import {
  parsearCsvClientes,
  parsearCsvEquipos,
  parsearCsvUsuarios,
  descargarPlantillaCsv
} from './utils/csvImportUtils';
import { ClientesTable } from './components/ClientesTable';
import { EquiposTable } from './components/EquiposTable';
import { UsuariosTable } from './components/UsuariosTable';
import { CatalogoFormModal } from './components/CatalogoFormModal';
import { BatchImportModal } from './components/BatchImportModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { UserPermissionsModal } from '../rbac/components/UserPermissionsModal';
import { useAuth } from '../../context/AuthContext';

export const CatalogosManagerView: React.FC = () => {
  const { user, isAdmin, canSelectSucursal, isBranchLocked } = useAuth();
  const { sucursales, sucursalActiva, empresaSeleccionada } = useSucursal();

  const targetEmpresaId = isAdmin ? empresaSeleccionada?.id : user?.empresaId;

  // Pestaña activa ('clientes' | 'equipos' | 'usuarios')
  const [tabActiva, setTabActiva] = useState<'clientes' | 'equipos' | 'usuarios'>('clientes');

  // Estados de listas
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [sucursalFiltro, setSucursalFiltro] = useState<number | 'TODAS'>(() => {
    if (isBranchLocked && user?.sucursalId) return user.sucursalId;
    return 'TODAS';
  });
  const [cargando, setCargando] = useState(false);

  // Estados de Notificación Toast
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // Estados del Modal Formulario (Crear / Editar)
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [registroEdicion, setRegistroEdicion] = useState<any | null>(null);
  const [guardandoForm, setGuardandoForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Estados de Eliminación
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState<{ id: number; nombre: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Estados de Importación Masiva por Lotes
  const [modalLoteAbierto, setModalLoteAbierto] = useState(false);
  const [textoLote, setTextoLote] = useState('');
  const [previsualizacionLote, setPrevisualizacionLote] = useState<any[]>([]);
  const [importandoLote, setImportandoLote] = useState(false);
  const [sucursalLote, setSucursalLote] = useState<number>(1);

  // Sub-filtro para pestaña de usuarios (cuando es SuperAdmin)
  const [filtroTipoUsuario, setFiltroTipoUsuario] = useState<'EMPRESA' | 'ADMINS' | 'TODOS'>('EMPRESA');

  // Estados del Modal de Permisos Especiales por Usuario
  const [modalPermisosAbierto, setModalPermisosAbierto] = useState(false);
  const [usuarioParaPermisos, setUsuarioParaPermisos] = useState<Usuario | null>(null);

  // Sincronizar sucursal de lote con sucursal activa
  useEffect(() => {
    if (sucursalActiva?.id) {
      setSucursalLote(sucursalActiva.id);
    }
  }, [sucursalActiva]);

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setTimeout(() => setToastMensaje(null), 3500);
  };

  // Carga de datos
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const sId = isBranchLocked && user?.sucursalId
        ? user.sucursalId
        : (sucursalFiltro === 'TODAS' ? undefined : sucursalFiltro);
      const q = busqueda.trim() ? busqueda.trim() : undefined;
      const empId = targetEmpresaId;

      if (tabActiva === 'clientes') {
        const data = await clientesApi.listarOBuscar(q, sId, empId);
        setClientes(data);
      } else if (tabActiva === 'equipos') {
        const data = await equiposApi.listarOBuscar(q, sId, empId);
        setEquipos(data);
      } else {
        let data: Usuario[] = [];
        if (isAdmin) {
          if (filtroTipoUsuario === 'ADMINS') {
            data = await usuariosApi.listarOBuscar(q, undefined, true);
          } else if (filtroTipoUsuario === 'TODOS') {
            data = await usuariosApi.listarOBuscar(q, undefined, undefined);
          } else {
            data = await usuariosApi.listarOBuscar(q, empId);
          }
        } else {
          data = await usuariosApi.listarOBuscar(q, empId);
        }
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error al cargar datos del catálogo:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [tabActiva, sucursalFiltro, targetEmpresaId, filtroTipoUsuario]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarDatos();
  };

  // Abrir Modal para Nuevo Registro
  const handleNuevo = () => {
    setRegistroEdicion(null);
    const empresaIdAsignada = targetEmpresaId || 1;
    if (tabActiva === 'clientes') {
      setFormData({
        razonSocial: '',
        nombreComercial: '',
        contactoPrincipal: '',
        telefono: '',
        correo: '',
        direccion: '',
        sucursalId: sucursalFiltro !== 'TODAS' ? sucursalFiltro : (sucursalActiva?.id || 1),
        empresaId: empresaIdAsignada,
        activo: true
      });
    } else if (tabActiva === 'equipos') {
      setFormData({
        descripcion: '',
        partNumber: '',
        caracteristicas: '',
        precioReferencial: 0,
        tiempoEntregaPredeterminado: 'De 5 a 6 semanas',
        categoria: 'General',
        sucursalId: sucursalFiltro !== 'TODAS' ? sucursalFiltro : (sucursalActiva?.id || 1),
        empresaId: empresaIdAsignada,
        activo: true
      });
    } else {
      const esAdminModo = isAdmin && filtroTipoUsuario === 'ADMINS';
      setFormData({
        username: '',
        password: '',
        nombreCompleto: '',
        correo: '',
        cargo: esAdminModo ? 'Administrador de Plataforma' : '',
        rol: esAdminModo ? 'ROLE_ADMIN' : 'ROLE_VENTAS',
        sucursalId: esAdminModo ? undefined : (sucursalFiltro !== 'TODAS' ? sucursalFiltro : (sucursalActiva?.id || 1)),
        empresaId: esAdminModo ? undefined : empresaIdAsignada,
        activo: true
      });
    }
    setModalFormAbierto(true);
  };

  // Abrir Modal para Editar Registro
  const handleEditar = (item: any) => {
    setRegistroEdicion(item);
    setFormData({ ...item, password: '' });
    setModalFormAbierto(true);
  };

  // Abrir Modal para Gestionar Permisos Especiales de Usuario
  const handleGestionarPermisos = (usuario: Usuario) => {
    setUsuarioParaPermisos(usuario);
    setModalPermisosAbierto(true);
  };

  // Guardar Registro (Crear o Actualizar)
  const handleGuardarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardandoForm(true);
      const esAdminSaaS = tabActiva === 'usuarios' && formData.rol === 'ROLE_ADMIN';
      const payloadConEmpresa = {
        ...formData,
        empresaId: esAdminSaaS ? undefined : (formData.empresaId || targetEmpresaId || 1),
        sucursalId: esAdminSaaS ? undefined : (formData.sucursalId || undefined),
      };
      if (tabActiva === 'clientes') {
        if (registroEdicion) {
          await clientesApi.actualizar(registroEdicion.id, payloadConEmpresa);
          mostrarToast(`Cliente "${formData.razonSocial}" actualizado con éxito`);
        } else {
          await clientesApi.crear(payloadConEmpresa);
          mostrarToast(`Cliente "${formData.razonSocial}" creado con éxito`);
        }
      } else if (tabActiva === 'equipos') {
        if (registroEdicion) {
          await equiposApi.actualizar(registroEdicion.id, payloadConEmpresa);
          mostrarToast(`Equipo "${formData.descripcion}" actualizado con éxito`);
        } else {
          await equiposApi.crearOActualizar(payloadConEmpresa);
          mostrarToast(`Equipo "${formData.descripcion}" registrado con éxito`);
        }
      } else {
        if (registroEdicion) {
          await usuariosApi.actualizar(registroEdicion.id, payloadConEmpresa);
          mostrarToast(`Usuario "${formData.username}" actualizado con éxito`);
        } else {
          await usuariosApi.crear(payloadConEmpresa);
          mostrarToast(`Usuario "${formData.username}" creado con éxito`);
        }
      }
      setModalFormAbierto(false);
      cargarDatos();
    } catch (err: any) {
      console.error('Error al guardar registro:', err);
      alert('Error al guardar: ' + (err?.response?.data?.message || err?.message || 'Verifica los campos'));
    } finally {
      setGuardandoForm(false);
    }
  };

  // Confirmar y Ejecutar Eliminación
  const confirmarEliminar = (id: number, nombre: string) => {
    setItemParaEliminar({ id, nombre });
    setModalEliminarAbierto(true);
  };

  const ejecutarEliminacion = async () => {
    if (!itemParaEliminar) return;
    try {
      setEliminando(true);
      if (tabActiva === 'clientes') {
        await clientesApi.eliminar(itemParaEliminar.id);
        mostrarToast(`Cliente "${itemParaEliminar.nombre}" eliminado`);
      } else if (tabActiva === 'equipos') {
        await equiposApi.eliminar(itemParaEliminar.id);
        mostrarToast(`Equipo "${itemParaEliminar.nombre}" eliminado`);
      } else {
        await usuariosApi.eliminar(itemParaEliminar.id);
        mostrarToast(`Usuario "${itemParaEliminar.nombre}" eliminado`);
      }
      setModalEliminarAbierto(false);
      setItemParaEliminar(null);
      cargarDatos();
    } catch (err: any) {
      console.error('Error al eliminar registro:', err);
      alert('Error al eliminar: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setEliminando(false);
    }
  };

  // Apertura y parsing del Modal de Lote
  const handleAbrirLote = () => {
    setTextoLote('');
    setPrevisualizacionLote([]);
    setModalLoteAbierto(true);
  };

  const handleActualizarTextoLote = (texto: string) => {
    setTextoLote(texto);
    if (!texto.trim()) {
      setPrevisualizacionLote([]);
      return;
    }
    if (tabActiva === 'clientes') {
      const parsed = parsearCsvClientes(texto, sucursalLote, targetEmpresaId);
      setPrevisualizacionLote(parsed);
    } else if (tabActiva === 'equipos') {
      const parsed = parsearCsvEquipos(texto, sucursalLote, targetEmpresaId);
      setPrevisualizacionLote(parsed);
    } else {
      const parsed = parsearCsvUsuarios(texto, targetEmpresaId);
      setPrevisualizacionLote(parsed);
    }
  };

  const handleSubirArchivoCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleActualizarTextoLote(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Ejecutar Importación Masiva por Lote
  const handleEjecutarImportacionLote = async () => {
    if (previsualizacionLote.length === 0) return;
    try {
      setImportandoLote(true);
      if (tabActiva === 'clientes') {
        await clientesApi.crearLote(previsualizacionLote);
        mostrarToast(`¡Se importaron ${previsualizacionLote.length} clientes con éxito!`);
      } else if (tabActiva === 'equipos') {
        await equiposApi.crearLote(previsualizacionLote);
        mostrarToast(`¡Se importaron ${previsualizacionLote.length} equipos con éxito!`);
      } else {
        await usuariosApi.crearLote(previsualizacionLote);
        mostrarToast(`¡Se importaron ${previsualizacionLote.length} usuarios con éxito!`);
      }
      setModalLoteAbierto(false);
      setTextoLote('');
      setPrevisualizacionLote([]);
      cargarDatos();
    } catch (err: any) {
      console.error('Error en carga por lote:', err);
      alert('Error al importar registros: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setImportandoLote(false);
    }
  };

  const obtenerNombreSucursal = (id?: number) => {
    if (!id) return 'General';
    const s = sucursales.find(suc => suc.id === id);
    return s ? s.nombre : `Sucursal #${id}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F3D3D] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-teal-400/30 animate-bounce">
          <span className="text-xl">✅</span>
          <span className="text-sm font-semibold">{toastMensaje}</span>
        </div>
      )}

      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-[#1F3D3D] to-[#2a5252] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">🗂️</span>
            <h1 className="text-2xl font-black tracking-wide">Administración de Catálogos</h1>
            {isAdmin ? (
              <span className="bg-purple-900/50 border border-purple-400/40 text-purple-200 text-xs px-2.5 py-1 rounded-full font-bold ml-1">
                🏛️ {empresaSeleccionada?.nombre || 'Empresa'}
              </span>
            ) : user?.empresaNombre ? (
              <span className="bg-teal-900/50 border border-teal-400/40 text-teal-200 text-xs px-2.5 py-1 rounded-full font-bold ml-1">
                🏢 {user.empresaNombre}
              </span>
            ) : null}
          </div>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
            Gestión de Clientes, Equipos/Productos y Emisores segregados por empresa y sucursal.
          </p>
        </div>

        {/* Selector de Pestañas (Tabs) */}
        <div className="bg-[#173030] p-1 rounded-xl flex gap-1 border border-teal-500/20 w-full md:w-auto">
          <button
            type="button"
            onClick={() => { setTabActiva('clientes'); setBusqueda(''); }}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tabActiva === 'clientes'
                ? 'bg-white text-[#1F3D3D] shadow-md'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            👥 Clientes
          </button>
          <button
            type="button"
            onClick={() => { setTabActiva('equipos'); setBusqueda(''); }}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tabActiva === 'equipos'
                ? 'bg-white text-[#1F3D3D] shadow-md'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            📦 Equipos / Items
          </button>
          <button
            type="button"
            onClick={() => { setTabActiva('usuarios'); setBusqueda(''); }}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tabActiva === 'usuarios'
                ? 'bg-white text-[#1F3D3D] shadow-md'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            👤 Usuarios / Emisores
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Acciones */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">
        <form onSubmit={handleBuscar} className="flex flex-1 w-full md:w-auto gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={
                tabActiva === 'clientes'
                  ? 'Buscar por razón social, comercial, contacto...'
                  : tabActiva === 'equipos'
                  ? 'Buscar por descripción, part number, categoría...'
                  : 'Buscar por usuario o nombre completo...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3D3D]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Buscar
          </button>

          {/* Filtro por Sucursal (para Clientes y Equipos) con Gobernanza Automática */}
          {tabActiva !== 'usuarios' && (
            canSelectSucursal ? (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs font-bold text-gray-500 hidden lg:inline">Sucursal:</span>
                <select
                  value={sucursalFiltro}
                  onChange={(e) => setSucursalFiltro(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                  className="px-2.5 py-2 text-xs border rounded-lg bg-gray-50 font-medium text-gray-700 focus:ring-2 focus:ring-[#1F3D3D]"
                >
                  <option value="TODAS">🏢 Todas las Sucursales</option>
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            ) : isBranchLocked ? (
              <div className="flex items-center gap-1.5 ml-2">
                <span
                  className="bg-gray-100 border border-gray-300 text-gray-700 text-xs px-2.5 py-2 rounded-lg font-semibold flex items-center gap-1 shadow-xs"
                  title="Tu sede asignada (Filtro bloqueado por seguridad)"
                >
                  <span>🔒</span>
                  <span className="max-w-[130px] truncate">{obtenerNombreSucursal(user?.sucursalId)}</span>
                </span>
              </div>
            ) : null
          )}

          {/* Filtro Especial para SuperAdmin en pestaña Usuarios */}
          {tabActiva === 'usuarios' && isAdmin && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs font-bold text-purple-900 hidden lg:inline">Alcance:</span>
              <select
                value={filtroTipoUsuario}
                onChange={(e) => setFiltroTipoUsuario(e.target.value as any)}
                className="px-2.5 py-2 text-xs border rounded-lg bg-purple-50 text-purple-900 border-purple-300 font-bold focus:ring-2 focus:ring-purple-700"
              >
                <option value="EMPRESA">🏢 Empresa: {empresaSeleccionada?.nombre || 'Seleccionada'}</option>
                <option value="ADMINS">🛡️ Administradores Globales SaaS</option>
                <option value="TODOS">🌐 Todos los Usuarios del Sistema</option>
              </select>
            </div>
          )}
        </form>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleAbrirLote}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            title="Importar múltiples registros mediante archivo CSV o texto tabulado"
          >
            <span>📥</span> Cargar por Lote
          </button>

          <button
            type="button"
            onClick={handleNuevo}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1F3D3D] hover:bg-[#2a5252] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <span>+</span> Nuevo {tabActiva === 'clientes' ? 'Cliente' : tabActiva === 'equipos' ? 'Equipo' : 'Usuario'}
          </button>
        </div>
      </div>

      {/* Tabla de Registros Modular */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1F3D3D] border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm font-medium">Cargando registros...</p>
          </div>
        ) : tabActiva === 'clientes' ? (
          <ClientesTable
            clientes={clientes}
            obtenerNombreSucursal={obtenerNombreSucursal}
            onEditar={handleEditar}
            onEliminar={confirmarEliminar}
          />
        ) : tabActiva === 'equipos' ? (
          <EquiposTable
            equipos={equipos}
            obtenerNombreSucursal={obtenerNombreSucursal}
            onEditar={handleEditar}
            onEliminar={confirmarEliminar}
          />
        ) : (
          <UsuariosTable
            usuarios={usuarios}
            obtenerNombreSucursal={obtenerNombreSucursal}
            onEditar={handleEditar}
            onEliminar={confirmarEliminar}
            onGestionarPermisos={handleGestionarPermisos}
          />
        )}
      </div>

      {/* Modal de Formulario (Crear/Editar) */}
      <CatalogoFormModal
        isOpen={modalFormAbierto}
        tabActiva={tabActiva}
        registroEdicion={registroEdicion}
        formData={formData}
        setFormData={setFormData}
        sucursales={sucursales}
        guardando={guardandoForm}
        onSubmit={handleGuardarRegistro}
        onClose={() => setModalFormAbierto(false)}
      />

      {/* Modal de Carga Masiva por Lote */}
      <BatchImportModal
        isOpen={modalLoteAbierto}
        tabActiva={tabActiva}
        textoLote={textoLote}
        previsualizacionLote={previsualizacionLote}
        sucursalLote={sucursalLote}
        setSucursalLote={setSucursalLote}
        sucursales={sucursales}
        importandoLote={importandoLote}
        obtenerNombreSucursal={obtenerNombreSucursal}
        onActualizarTextoLote={handleActualizarTextoLote}
        onSubirArchivoCsv={handleSubirArchivoCsv}
        onDescargarPlantilla={descargarPlantillaCsv}
        onEjecutarImportacion={handleEjecutarImportacionLote}
        onClose={() => setModalLoteAbierto(false)}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        isOpen={modalEliminarAbierto}
        itemName={itemParaEliminar?.nombre || ''}
        eliminando={eliminando}
        onConfirm={ejecutarEliminacion}
        onCancel={() => setModalEliminarAbierto(false)}
      />

      {/* Modal de Permisos Especiales por Usuario */}
      <UserPermissionsModal
        isOpen={modalPermisosAbierto}
        usuario={usuarioParaPermisos}
        onClose={() => {
          setModalPermisosAbierto(false);
          setUsuarioParaPermisos(null);
        }}
        onPermisosActualizados={() => {
          cargarDatos();
        }}
      />
    </div>
  );
};
