import React, { useState, useEffect } from 'react';
import { useSucursal } from '../../context/SucursalContext';
import { useAuth } from '../../context/AuthContext';
import { sucursalesApi } from '../../api/sucursalesApi';
import { Sucursal } from '../catalogos/types/catalogos.types';

export const SucursalesView: React.FC = () => {
  const { user } = useAuth();
  const { sucursales, sucursalActiva, setSucursalActiva, recargarSucursales, cargandoSucursales } = useSucursal();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(sucursalActiva?.id || null);
  const [formData, setFormData] = useState<Partial<Sucursal>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Estado para modal de nueva sucursal
  const [modalNuevaSucursal, setModalNuevaSucursal] = useState(false);
  const [nuevaSucursal, setNuevaSucursal] = useState<Partial<Sucursal>>({
    codigo: '',
    nombre: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    telefono: '',
    correo: '',
    prefijoCotizacion: '',
    nombreFirmante: '',
    cargoFirmante: '',
    formaPagoPredeterminada: 'Contado contra entrega / Transferencia Bancaria',
    notaPredeterminada: '** IMPORTANTE ** Precios sujetos a inventario.',
    activo: true,
  });

  // Determinar la sucursal activa garantizando que nunca sea nula si existen sucursales
  const activeBranchId = selectedBranchId ?? sucursalActiva?.id ?? sucursales[0]?.id ?? null;
  const branchSeleccionada = (activeBranchId ? sucursales.find(s => s.id === activeBranchId) : null) || sucursales[0] || null;

  // Sincronizar formulario cada vez que cambie la sucursal seleccionada
  useEffect(() => {
    if (branchSeleccionada) {
      setFormData({ ...branchSeleccionada });
    }
  }, [branchSeleccionada?.id]);

  const handleCrearSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardando(true);
      const empresaId = user?.empresaId || branchSeleccionada?.empresaId || 1;
      const creada = await sucursalesApi.crear({
        ...nuevaSucursal,
        empresaId,
        activo: true,
      });
      await recargarSucursales();
      setSelectedBranchId(creada.id);
      setModalNuevaSucursal(false);
      setMensajeExito(`¡Sucursal "${creada.nombre}" creada con éxito!`);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (error: any) {
      console.error('Error al crear sucursal:', error);
      alert('Error al crear la nueva sucursal.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarSucursal = async () => {
    if (!selectedBranchId) return;
    if (sucursales.length <= 1) {
      alert('No puedes eliminar la única sucursal registrada de la empresa.');
      return;
    }
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar la sucursal "${branchSeleccionada?.nombre}"? Esta acción desactivará la sucursal del sistema.`
    );
    if (!confirmacion) return;

    try {
      setGuardando(true);
      await sucursalesApi.eliminar(selectedBranchId);
      await recargarSucursales();
      const restantes = sucursales.filter(s => s.id !== selectedBranchId);
      if (restantes.length > 0) {
        setSelectedBranchId(restantes[0].id);
        setSucursalActiva(restantes[0]);
      }
      setMensajeExito('Sucursal eliminada correctamente.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (error) {
      console.error('Error al eliminar sucursal:', error);
      alert('Ocurrió un error al eliminar la sucursal.');
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (field: keyof Sucursal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'headerBannerBase64' | 'footerBannerBase64' | 'firmaBase64', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen (JPEG, PNG o WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2 MB para un óptimo rendimiento del PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      handleInputChange(field, result);
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) return;

    try {
      setGuardando(true);
      const updated = await sucursalesApi.actualizar(selectedBranchId, formData);
      await recargarSucursales();
      if (sucursalActiva?.id === selectedBranchId) {
        setSucursalActiva(updated);
      }
      setMensajeExito(`¡Sucursal "${updated.nombre}" actualizada con éxito!`);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      alert('Ocurrió un error al guardar los cambios de la sucursal.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoSucursales && sucursales.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md p-12 text-center border-l-4 border-[#1F3D3D]">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1F3D3D] border-t-transparent rounded-full mb-3"></div>
          <p className="text-gray-700 font-medium">Cargando información de sucursales...</p>
        </div>
      </div>
    );
  }

  if (sucursales.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-amber-500 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>⚠️</span> No se pudieron obtener las sucursales
          </h2>
          <p className="text-sm text-gray-600">
            No se recibió información de las sucursales desde el backend. Asegúrate de que el servidor Spring Boot esté ejecutándose en el puerto 8080.
          </p>
          <button
            type="button"
            onClick={() => recargarSucursales()}
            className="bg-[#1F3D3D] hover:bg-[#2a5252] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
          >
            <span>🔄</span> Reintentar cargar sucursales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#1F3D3D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>🏢</span> Configuración de Sucursales y Membretes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Personaliza los datos fiscales, correlativos, membretes y firmas digitales de cada sucursal de la empresa.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sucursalActiva && (
              <div className="bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg text-xs text-teal-800">
                <span className="font-semibold">Sucursal activa:</span>{' '}
                <span className="font-bold text-[#1F3D3D]">{sucursalActiva.nombre}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setNuevaSucursal({
                  codigo: `SUC_0${sucursales.length + 1}`,
                  nombre: '',
                  razonSocial: branchSeleccionada?.razonSocial || '',
                  nombreComercial: branchSeleccionada?.nombreComercial || '',
                  prefijoCotizacion: `COT${sucursales.length + 1}`,
                  direccion: '',
                  telefono: '',
                  correo: '',
                  formaPagoPredeterminada: 'Contado contra entrega / Transferencia Bancaria',
                  notaPredeterminada: '** IMPORTANTE ** Precios sujetos a inventario.',
                  nombreFirmante: user?.nombreCompleto || 'Ing. Erick Ramírez',
                  cargoFirmante: user?.cargo || 'Gerente de Sucursal',
                  activo: true,
                });
                setModalNuevaSucursal(true);
              }}
              className="bg-[#1F3D3D] hover:bg-[#2a5252] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>➕</span> Nueva Sucursal
            </button>
          </div>
        </div>
      </div>

      {mensajeExito && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm animate-fadeIn">
          <span className="flex items-center gap-2">
            <span>✅</span> {mensajeExito}
          </span>
          <button onClick={() => setMensajeExito(null)} className="text-green-600 hover:text-green-900 font-bold">✕</button>
        </div>
      )}

      {/* Pestañas de Sucursales */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {sucursales.map(s => {
          const isSelected = s.id === branchSeleccionada?.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedBranchId(s.id)}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-white text-[#1F3D3D] border-t-2 border-l border-r border-[#1F3D3D] shadow-sm -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
              }`}
            >
              🏢 {s.nombre}
            </button>
          );
        })}
      </div>

      {/* Formulario de Configuración de la Sucursal Seleccionada */}
      {branchSeleccionada && (
        <form onSubmit={handleGuardar} className="space-y-6">
          {/* Tarjeta 1: Información General y Fiscal */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span>📋</span> Datos Generales y Fiscales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Descriptivo de la Sucursal *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre || ''}
                  onChange={e => handleInputChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: Retail El Salvador (Matriz)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial || ''}
                  onChange={e => handleInputChange('razonSocial', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: RETAIL SERVICES EL SALVADOR S.A. DE C.V."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={formData.nombreComercial || ''}
                  onChange={e => handleInputChange('nombreComercial', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: RETAIL EL SALVADOR"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Código Identificador</label>
                <input
                  type="text"
                  required
                  value={formData.codigo || ''}
                  onChange={e => handleInputChange('codigo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: SUC_SV"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Prefijo de Correlativo en Cotización *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prefijoCotizacion || ''}
                  onChange={e => handleInputChange('prefijoCotizacion', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold text-blue-700 focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: COT (genera COT202610001)"
                />
                <span className="text-[11px] text-gray-500">Ejemplo: "COT" generará cotizaciones como "COT202610001". "COT2" generará "COT2202610001".</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono || ''}
                  onChange={e => handleInputChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: 2250-7700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección Física</label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={e => handleInputChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: Calle Los Bambúes, Col. San Benito, San Salvador"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Firmante y Condiciones Predeterminadas */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span>✍️</span> Firmante y Condiciones de Venta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del Firmante Autorizado</label>
                <input
                  type="text"
                  value={formData.nombreFirmante || ''}
                  onChange={e => handleInputChange('nombreFirmante', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: ING. ERICK RAMIREZ"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cargo del Firmante</label>
                <input
                  type="text"
                  value={formData.cargoFirmante || ''}
                  onChange={e => handleInputChange('cargoFirmante', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: GERENTE GENERAL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Forma de Pago Predeterminada</label>
                <input
                  type="text"
                  value={formData.formaPagoPredeterminada || ''}
                  onChange={e => handleInputChange('formaPagoPredeterminada', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: Crédito 30 días, Transferencia Bancaria o Cheque"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nota Importante Predeterminada</label>
                <textarea
                  rows={2}
                  value={formData.notaPredeterminada || ''}
                  onChange={e => handleInputChange('notaPredeterminada', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="Ej: ** IMPORTANTE ** Tiempos de entrega y precios..."
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Membretes y Firma Digital (Assets) */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🖼️</span> Membretes y Firma Digital para PDF
              </span>
              <span className="text-xs text-gray-500 font-normal">
                Si no se sube imagen personalizada, se usará el diseño predeterminado del sistema.
              </span>
            </h2>

            {/* Cintillo Superior */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Cintillo Superior (Header Banner)</h3>
                  <p className="text-xs text-gray-500">Se estampará en la parte superior de cada página del PDF.</p>
                </div>
                <div className="flex items-center gap-2">
                  {formData.headerBannerBase64 && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('headerBannerBase64', null)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    >
                      Restablecer al predeterminado
                    </button>
                  )}
                  <label className="px-3 py-1.5 bg-[#1F3D3D] hover:bg-[#2a5252] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                    Subir Nuevo Cintillo Superior
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload('headerBannerBase64', e)}
                    />
                  </label>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-2 text-center overflow-hidden">
                {formData.headerBannerBase64 ? (
                  <img
                    src={formData.headerBannerBase64}
                    alt="Header Banner"
                    className="max-h-24 w-full object-contain mx-auto"
                  />
                ) : (
                  <div className="py-4 text-xs text-gray-400 italic">
                    (Usando Cintillo Superior predeterminado del sistema: "Retail Services")
                  </div>
                )}
              </div>
            </div>

            {/* Cintillo Inferior */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Cintillo Inferior (Footer Banner)</h3>
                  <p className="text-xs text-gray-500">Se estampará en el pie de página de cada hoja del PDF.</p>
                </div>
                <div className="flex items-center gap-2">
                  {formData.footerBannerBase64 && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('footerBannerBase64', null)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    >
                      Restablecer al predeterminado
                    </button>
                  )}
                  <label className="px-3 py-1.5 bg-[#1F3D3D] hover:bg-[#2a5252] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                    Subir Nuevo Cintillo Inferior
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload('footerBannerBase64', e)}
                    />
                  </label>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-2 text-center overflow-hidden">
                {formData.footerBannerBase64 ? (
                  <img
                    src={formData.footerBannerBase64}
                    alt="Footer Banner"
                    className="max-h-24 w-full object-contain mx-auto"
                  />
                ) : (
                  <div className="py-4 text-xs text-gray-400 italic">
                    (Usando Cintillo Inferior predeterminado del sistema: Teléfonos, marcas y contacto)
                  </div>
                )}
              </div>
            </div>

            {/* Firma Digital */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Firma Digital del Encargado / Gerente</h3>
                  <p className="text-xs text-gray-500">Aparecerá en el bloque final centrado de la cotización.</p>
                </div>
                <div className="flex items-center gap-2">
                  {formData.firmaBase64 && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('firmaBase64', null)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    >
                      Restablecer al predeterminado
                    </button>
                  )}
                  <label className="px-3 py-1.5 bg-[#1F3D3D] hover:bg-[#2a5252] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                    Subir Firma Digital
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload('firmaBase64', e)}
                    />
                  </label>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-3 text-center overflow-hidden flex flex-col items-center justify-center min-h-[90px]">
                {formData.firmaBase64 ? (
                  <img
                    src={formData.firmaBase64}
                    alt="Firma Digital"
                    className="h-16 object-contain"
                  />
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    (Usando Firma predeterminada: Erick Ramírez)
                  </div>
                )}
                <div className="mt-1 font-bold text-xs text-gray-800">{formData.nombreFirmante || 'ING. ERICK RAMIREZ'}</div>
                <div className="text-[11px] text-gray-500">{formData.cargoFirmante || 'GERENTE GENERAL'}</div>
              </div>
            </div>
          </div>

          {/* Botones de Acción Principal */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            {sucursales.length > 1 ? (
              <button
                type="button"
                onClick={handleEliminarSucursal}
                disabled={guardando}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Desactivar/Eliminar esta sucursal"
              >
                <span>🗑️</span> Eliminar Sucursal
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={guardando}
              className="bg-[#1F3D3D] hover:bg-[#2a5252] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Guardando Cambios...
                </>
              ) : (
                <>
                  <span>💾</span> Guardar Configuración de la Sucursal
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modal para Crear Nueva Sucursal */}
      {modalNuevaSucursal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>➕</span> Registrar Nueva Sucursal
              </h2>
              <button
                onClick={() => setModalNuevaSucursal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearSucursal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Código Interno *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaSucursal.codigo || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, codigo: e.target.value })}
                    placeholder="SUC_03"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prefijo Cotización *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaSucursal.prefijoCotizacion || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, prefijoCotizacion: e.target.value })}
                    placeholder="COT3"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nombre Descriptivo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaSucursal.nombre || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, nombre: e.target.value })}
                    placeholder="Ej: Retail Sucursal 3 (Santa Tecla)"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaSucursal.razonSocial || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, razonSocial: e.target.value })}
                    placeholder="Ej: RETAIL SERVICES EL SALVADOR S.A. DE C.V."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={nuevaSucursal.telefono || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, telefono: e.target.value })}
                    placeholder="2200-0000"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={nuevaSucursal.correo || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, correo: e.target.value })}
                    placeholder="sucursal3@retail.com"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={nuevaSucursal.direccion || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, direccion: e.target.value })}
                    placeholder="Dirección física de la sucursal"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Firmante</label>
                  <input
                    type="text"
                    value={nuevaSucursal.nombreFirmante || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, nombreFirmante: e.target.value })}
                    placeholder="ING. ERICK RAMIREZ"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cargo Firmante</label>
                  <input
                    type="text"
                    value={nuevaSucursal.cargoFirmante || ''}
                    onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, cargoFirmante: e.target.value })}
                    placeholder="GERENTE DE SUCURSAL"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalNuevaSucursal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-[#1F3D3D] hover:bg-[#2a5252] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Crear Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
