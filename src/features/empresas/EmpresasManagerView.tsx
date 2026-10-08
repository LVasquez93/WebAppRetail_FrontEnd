import React, { useState, useEffect } from 'react';
import { Empresa, EmpresaFormData } from './types/empresas.types';
import { empresasApi } from '../../api/empresasApi';

export const EmpresasManagerView: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const initialFormState: EmpresaFormData = {
    nombre: '',
    razonSocial: '',
    nit: '',
    telefono: '',
    correo: '',
    direccion: '',
    logoBase64: '',
    activo: true,
    gerenteId: undefined,
    gerenteUsername: '',
    gerentePassword: '',
    gerenteNombreCompleto: '',
    gerenteCorreo: '',
  };

  const [form, setForm] = useState<EmpresaFormData>(initialFormState);

  const cargarEmpresas = async () => {
    try {
      setCargando(true);
      setErrorMsg(null);
      const data = await empresasApi.listar(false);
      setEmpresas(data);
    } catch (err: any) {
      console.error('Error al listar empresas:', err);
      setErrorMsg('No se pudieron cargar las empresas. Verifica que el backend esté en ejecución.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const abrirModalCrear = () => {
    setEmpresaEditando(null);
    setForm(initialFormState);
    setModalAbierto(true);
  };

  const abrirModalEditar = (emp: Empresa) => {
    setEmpresaEditando(emp);
    setForm({
      nombre: emp.nombre,
      razonSocial: emp.razonSocial,
      nit: emp.nit || '',
      telefono: emp.telefono || '',
      correo: emp.correo || '',
      direccion: emp.direccion || '',
      logoBase64: emp.logoBase64 || '',
      activo: emp.activo,
      gerenteId: emp.gerenteId,
      gerenteUsername: emp.gerenteUsername || '',
      gerenteNombreCompleto: emp.gerenteNombreCompleto || '',
      gerenteCorreo: emp.gerenteCorreo || '',
      gerentePassword: '',
    });
    setModalAbierto(true);
  };

  const handleToggleEstado = async (id: number) => {
    try {
      await empresasApi.alternarEstado(id);
      await cargarEmpresas();
      setMensajeExito('Estado de la empresa actualizado.');
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      console.error('Error al alternar estado:', err);
      alert('Error al actualizar el estado de la empresa.');
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardando(true);
      setErrorMsg(null);

      if (empresaEditando) {
        await empresasApi.actualizar(empresaEditando.id, form);
        setMensajeExito(`¡Empresa "${form.nombre}" actualizada con éxito!`);
      } else {
        await empresasApi.crear(form);
        setMensajeExito(`¡Empresa "${form.nombre}" creada exitosamente con su Gerente inicial!`);
      }

      setModalAbierto(false);
      await cargarEmpresas();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      console.error('Error al guardar empresa:', err);
      const backendError = err.response?.data?.message || 'Error al procesar la solicitud.';
      setErrorMsg(backendError);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#1F3D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🏛️</span> Gestión Central de Empresas (Multi-Tenant)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Como Super Administrador, administra las empresas clientes registradas en la plataforma y aprovisiona sus gerentes.
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-[#1F3D3D] hover:bg-[#2a5252] text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>➕</span> Registrar Nueva Empresa
        </button>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
          <span>✅ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Tabla de Empresas */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1F3D3D] border-t-transparent rounded-full mb-2"></div>
            <p>Cargando empresas registradas...</p>
          </div>
        ) : empresas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-semibold">No hay empresas registradas</p>
            <p className="text-xs mt-1">Haz clic en "Registrar Nueva Empresa" para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-[#1F3D3D] text-white text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nombre Comercial</th>
                  <th className="px-4 py-3">Razón Social</th>
                  <th className="px-4 py-3">NIT</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Gerente Asignado</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {empresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-500">#{emp.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{emp.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.razonSocial}</td>
                    <td className="px-4 py-3 text-xs font-mono">{emp.nit || '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>📞 {emp.telefono || '—'}</div>
                      <div>✉️ {emp.correo || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      {emp.gerenteUsername ? (
                        <div className="flex items-start gap-2">
                          <span className="text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center font-bold">
                            👤
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                              <span>{emp.gerenteNombreCompleto || emp.gerenteUsername}</span>
                              <span className="bg-indigo-50 text-indigo-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-indigo-200">
                                @{emp.gerenteUsername}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500">{emp.gerenteCorreo || 'Sin correo registrado'}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-block text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          ⚠️ Sin gerente asignado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          emp.activo
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {emp.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalEditar(emp)}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors"
                          title="Editar empresa"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleToggleEstado(emp.id)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                            emp.activo
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={emp.activo ? 'Desactivar empresa' : 'Activar empresa'}
                        >
                          {emp.activo ? '⏸️ Suspender' : '▶️ Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">
                {empresaEditando ? '✏️ Editar Empresa' : '➕ Registrar Nueva Empresa'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4">
              {/* Sección 1: Datos de la Empresa */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F3D3D] uppercase tracking-wide border-b pb-1">
                  🏢 Datos de la Empresa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nombre Comercial *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Ej: Retail Central"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Razón Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.razonSocial}
                      onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                      placeholder="Ej: RETAIL CENTRAL S.A. DE C.V."
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">NIT</label>
                    <input
                      type="text"
                      value={form.nit || ''}
                      onChange={(e) => setForm({ ...form, nit: e.target.value })}
                      placeholder="0614-xxxxxx-xxx-x"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={form.telefono || ''}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="2200-0000"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={form.correo || ''}
                      onChange={(e) => setForm({ ...form, correo: e.target.value })}
                      placeholder="contacto@empresa.com"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección Fiscal</label>
                    <input
                      type="text"
                      value={form.direccion || ''}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      placeholder="Col. Escalón, San Salvador"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Cuenta de Gerente (Crear o Editar) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-brand-accent-text uppercase tracking-wide border-b pb-1">
                  👤 {empresaEditando ? 'Cuenta de Gerente de la Empresa' : 'Cuenta Inicial de Gerente (Dueño / Administrador)'}
                </h3>
                <p className="text-xs text-gray-500">
                  {empresaEditando
                    ? 'Gestiona el usuario con rol GERENTE asignado a esta empresa. Deja la contraseña vacía si no deseas cambiarla.'
                    : 'Opcional: Si completas estos campos, se creará automáticamente un usuario con rol GERENTE vinculado a esta empresa.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Usuario (Login)</label>
                    <input
                      type="text"
                      value={form.gerenteUsername || ''}
                      onChange={(e) => setForm({ ...form, gerenteUsername: e.target.value })}
                      placeholder="ej: gerenteretail"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {empresaEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                    </label>
                    <input
                      type="password"
                      value={form.gerentePassword || ''}
                      onChange={(e) => setForm({ ...form, gerentePassword: e.target.value })}
                      placeholder={empresaEditando ? 'Dejar en blanco para conservar actual' : 'Contraseña segura'}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={form.gerenteNombreCompleto || ''}
                      onChange={(e) => setForm({ ...form, gerenteNombreCompleto: e.target.value })}
                      placeholder="Lic. Roberto Morales"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={form.gerenteCorreo || ''}
                      onChange={(e) => setForm({ ...form, gerenteCorreo: e.target.value })}
                      placeholder="gerente@empresa.com"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-[#1F3D3D] hover:bg-[#2a5252] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : empresaEditando ? 'Guardar Cambios' : 'Registrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
