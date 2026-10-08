import React, { useState, useEffect } from 'react';
import { useSucursal } from '../../context/SucursalContext';
import { useAuth } from '../../context/AuthContext';
import { sucursalesApi } from '../../api/sucursalesApi';
import { Sucursal } from '../catalogos/types/catalogos.types';

export const SucursalesView: React.FC = () => {
  const { user, isAdmin, isGerenteGeneral, isGerenteSucursal } = useAuth();
  const { sucursales, sucursalActiva, setSucursalActiva, recargarSucursales, cargandoSucursales, empresaSeleccionada } = useSucursal();

  // Permisos: SuperAdmin y Gerente General tienen control total sobre todas las sedes de la empresa.
  // El Gerente de Sucursal tiene control exclusivo y delimitado sobre su sede asignada.
  const puedeGestionarTodas = isAdmin || isGerenteGeneral;
  const sucursalesVisibles = puedeGestionarTodas
    ? sucursales
    : sucursales.filter(s => s.id === user?.sucursalId);

  const puedeCrear = puedeGestionarTodas;
  const puedeEliminar = puedeGestionarTodas;

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Sucursal>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Determinar la sucursal activa garantizando aislamiento para Gerente de Sucursal
  const activeBranchId: number | null = puedeGestionarTodas
    ? (selectedBranchId ?? sucursalActiva?.id ?? sucursalesVisibles[0]?.id ?? null)
    : (user?.sucursalId ?? sucursalesVisibles[0]?.id ?? null);

  const branchSeleccionada = (activeBranchId ? sucursalesVisibles.find(s => s.id === activeBranchId) : null) || sucursalesVisibles[0] || null;

  // Sincronizar sucursal fijada si es Gerente de Sucursal
  useEffect(() => {
    if (!puedeGestionarTodas && user?.sucursalId) {
      if (selectedBranchId !== user.sucursalId) {
        setSelectedBranchId(user.sucursalId);
      }
    }
  }, [puedeGestionarTodas, user?.sucursalId, selectedBranchId]);

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
    porcentajeIva: 13,
    monedaCodigo: 'USD',
    monedaSimbolo: '$',
    monedaNombre: 'DOLARES',
    diasValidezCotizacion: 15,
    tiempoEntregaPredeterminado: 'De 5 a 6 semanas',
    garantiaPredeterminada: '1 año contra defectos de fábrica',
    mostrarIvaDesglosado: true,
    activo: true,
  });

  // Sincronizar formulario cada vez que cambie la sucursal seleccionada
  useEffect(() => {
    if (branchSeleccionada) {
      setFormData({
        ...branchSeleccionada,
        porcentajeIva: branchSeleccionada.porcentajeIva !== undefined ? branchSeleccionada.porcentajeIva : 13,
        monedaCodigo: branchSeleccionada.monedaCodigo || 'USD',
        monedaSimbolo: branchSeleccionada.monedaSimbolo || '$',
        monedaNombre: branchSeleccionada.monedaNombre || 'DOLARES',
        diasValidezCotizacion: branchSeleccionada.diasValidezCotizacion !== undefined ? branchSeleccionada.diasValidezCotizacion : 15,
        tiempoEntregaPredeterminado: branchSeleccionada.tiempoEntregaPredeterminado || 'De 5 a 6 semanas',
        garantiaPredeterminada: branchSeleccionada.garantiaPredeterminada || '1 año contra defectos de fábrica',
        mostrarIvaDesglosado: branchSeleccionada.mostrarIvaDesglosado !== false,
      });
    }
  }, [branchSeleccionada?.id]);

  const handleCrearSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardando(true);
      const empresaId = user?.empresaId || empresaSeleccionada?.id || branchSeleccionada?.empresaId || 1;
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
      <div className="max-w-5xl mx-auto space-y-6" role="status" aria-label="Cargando configuración de sucursales">
        <span className="sr-only">Cargando información de sucursales...</span>
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-brand-primary animate-pulse space-y-3">
          <div className="h-6 w-72 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
        {/* Tabs Skeleton */}
        <div className="flex gap-2 border-b border-gray-200 pb-1 animate-pulse">
          <div className="h-10 w-32 bg-gray-200 rounded-t-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-t-lg"></div>
        </div>
        {/* Form Card Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-28 bg-gray-100 rounded-lg"></div>
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🏢</span> Configuración de Sucursales y Membretes
              </h1>
              {isAdmin ? (
                <span className="bg-purple-100 text-purple-900 border border-purple-200 text-xs px-2.5 py-1 rounded-full font-bold ml-1">
                  🏛️ {empresaSeleccionada?.nombre || 'Empresa'}
                </span>
              ) : user?.empresaNombre ? (
                <span className="bg-teal-100 text-teal-900 border border-teal-200 text-xs px-2.5 py-1 rounded-full font-bold ml-1">
                  🏢 {user.empresaNombre}
                </span>
              ) : null}
            </div>
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
            {puedeCrear && (
              <button
                type="button"
                onClick={() => {
                  setNuevaSucursal({
                    codigo: `SUC_0${sucursales.length + 1}`,
                    nombre: '',
                    razonSocial: branchSeleccionada?.razonSocial || empresaSeleccionada?.razonSocial || '',
                    nombreComercial: branchSeleccionada?.nombreComercial || empresaSeleccionada?.nombre || '',
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
            )}
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

      {/* Vista cuando no hay sucursales registradas */}
      {sucursalesVisibles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center border border-teal-100 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 bg-teal-50 text-[#1F3D3D] rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
            🏢
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {puedeGestionarTodas
              ? 'Aún no hay sucursales registradas para tu empresa'
              : 'No se encontró tu sucursal asignada'}
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {puedeGestionarTodas
              ? 'Para comenzar a emitir cotizaciones y personalizar membretes fiscales, registra la primera sucursal (Casa Matriz) de tu empresa.'
              : 'Tu usuario no tiene una sede activa asignada o no se pudo cargar. Por favor contacta al Gerente General de tu empresa.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {puedeCrear && (
              <button
                type="button"
                onClick={() => {
                  setNuevaSucursal({
                    codigo: 'SUC_01',
                    nombre: (user?.empresaNombre || 'Casa Matriz') + ' (Principal)',
                    razonSocial: user?.empresaNombre || '',
                    nombreComercial: user?.empresaNombre || '',
                    prefijoCotizacion: 'COT1',
                    direccion: '',
                    telefono: '',
                    correo: '',
                    formaPagoPredeterminada: 'Contado contra entrega / Transferencia Bancaria',
                    notaPredeterminada: '** IMPORTANTE ** Precios sujetos a inventario.',
                    nombreFirmante: user?.nombreCompleto || 'Gerente General',
                    cargoFirmante: user?.cargo || 'Gerente General',
                    activo: true,
                  });
                  setModalNuevaSucursal(true);
                }}
                className="bg-[#1F3D3D] hover:bg-[#2a5252] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>➕</span> Registrar Primera Sucursal
              </button>
            )}
            <button
              type="button"
              onClick={() => recargarSucursales()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              🔄 Sincronizar con el servidor
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Selector de Sucursal: Pestañas para Admin/Gerente General, o Badge informativo para Gerente de Sede */}
          {puedeGestionarTodas ? (
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
              {sucursalesVisibles.map(s => {
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
          ) : (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1F3D3D] text-white flex items-center justify-center text-xl shadow-xs">
                  🏬
                </div>
                <div>
                  <div className="text-[11px] text-teal-700 font-bold uppercase tracking-wider">Tu Sede Asignada</div>
                  <div className="text-base font-extrabold text-[#1F3D3D]">{branchSeleccionada?.nombre || 'Sede Asignada'}</div>
                  <p className="text-xs text-gray-500 mt-0.5">Estás editando los membretes y parámetros de tu sucursal.</p>
                </div>
              </div>
              <span className="bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full font-mono font-bold">
                {branchSeleccionada?.codigo || 'SUC'}
              </span>
            </div>
          )}

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

          {/* Tarjeta 2: Configuración Fiscal, Moneda y Parámetros Comerciales */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2 gap-2">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>⚙️</span> Configuración Fiscal, Moneda y Parámetros Comerciales
              </h2>
              <span className="text-xs text-gray-500">
                Afecta directamente los cálculos, monedas y leyendas de las cotizaciones emitidas en esta sede.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tasa de IVA */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tasa de IVA / Impuesto (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formData.porcentajeIva !== undefined ? formData.porcentajeIva : 13}
                    onChange={e => handleInputChange('porcentajeIva', Number(e.target.value))}
                    className="w-full px-3 py-2 pr-8 border rounded-lg text-sm font-bold text-blue-900 focus:ring-2 focus:ring-[#1F3D3D]"
                    placeholder="13.00"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-gray-400 pointer-events-none">%</span>
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-500">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('porcentajeIva', 13)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                  >
                    13% (El Salvador)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('porcentajeIva', 12)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                  >
                    12% (Guatemala)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('porcentajeIva', 15)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                  >
                    15% (Honduras/Nic)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('porcentajeIva', 0)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                  >
                    0% (Exento)
                  </button>
                </div>
              </div>

              {/* Moneda Código & Símbolo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Código de Moneda (ISO) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={formData.monedaCodigo || 'USD'}
                    onChange={e => handleInputChange('monedaCodigo', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold text-gray-800 uppercase focus:ring-2 focus:ring-[#1F3D3D]"
                    placeholder="USD"
                  />
                  <input
                    type="text"
                    required
                    value={formData.monedaSimbolo || '$'}
                    onChange={e => handleInputChange('monedaSimbolo', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-center text-teal-800 focus:ring-2 focus:ring-[#1F3D3D]"
                    placeholder="Símbolo: $"
                    title="Símbolo impreso en los totales y precios"
                  />
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-500">Monedas:</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('monedaCodigo', 'USD');
                      handleInputChange('monedaSimbolo', '$');
                      handleInputChange('monedaNombre', 'DOLARES');
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-[#1F3D3D] font-bold cursor-pointer"
                  >
                    $ USD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('monedaCodigo', 'GTQ');
                      handleInputChange('monedaSimbolo', 'Q');
                      handleInputChange('monedaNombre', 'QUETZALES');
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-[#1F3D3D] font-bold cursor-pointer"
                  >
                    Q Quetzal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('monedaCodigo', 'HNL');
                      handleInputChange('monedaSimbolo', 'L');
                      handleInputChange('monedaNombre', 'LEMPIRAS');
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-[#1F3D3D] font-bold cursor-pointer"
                  >
                    L Lempira
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('monedaCodigo', 'EUR');
                      handleInputChange('monedaSimbolo', '€');
                      handleInputChange('monedaNombre', 'EUROS');
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-[#1F3D3D] font-bold cursor-pointer"
                  >
                    € Euro
                  </button>
                </div>
              </div>

              {/* Nombre de Moneda para Total en Letras */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre de Moneda (Monto en Letras) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.monedaNombre || 'DOLARES'}
                  onChange={e => handleInputChange('monedaNombre', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-semibold uppercase focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="DOLARES"
                />
                <span className="text-[11px] text-gray-500 block mt-1">
                  Ej: "DOSCIENTOS <strong>{formData.monedaNombre || 'DOLARES'}</strong> CON 08/100"
                </span>
              </div>

              {/* Días de Validez de la Oferta */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Validez de la Oferta (Días)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.diasValidezCotizacion !== undefined ? formData.diasValidezCotizacion : 15}
                    onChange={e => handleInputChange('diasValidezCotizacion', Number(e.target.value))}
                    className="w-full px-3 py-2 pr-12 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                    placeholder="15"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-gray-400 pointer-events-none">días</span>
                </div>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Impreso en el PDF: "Validez de la oferta: {formData.diasValidezCotizacion || 15} días calendario".
                </span>
              </div>

              {/* Tiempo de Entrega Predeterminado */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tiempo de Entrega Predeterminado
                </label>
                <input
                  type="text"
                  value={formData.tiempoEntregaPredeterminado || ''}
                  onChange={e => handleInputChange('tiempoEntregaPredeterminado', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="De 5 a 6 semanas"
                />
                <span className="text-[11px] text-gray-500 block mt-1">
                  Valor sugerido en nuevas líneas de cotización.
                </span>
              </div>

              {/* Garantía Predeterminada */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Garantía Predeterminada
                </label>
                <input
                  type="text"
                  value={formData.garantiaPredeterminada || ''}
                  onChange={e => handleInputChange('garantiaPredeterminada', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1F3D3D]"
                  placeholder="1 año contra defectos de fábrica"
                />
                <span className="text-[11px] text-gray-500 block mt-1">
                  Leyenda en la sección de condiciones del PDF.
                </span>
              </div>

              {/* Toggle: Mostrar IVA Desglosado */}
              <div className="md:col-span-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.mostrarIvaDesglosado !== false}
                    onChange={e => handleInputChange('mostrarIvaDesglosado', e.target.checked)}
                    className="w-4 h-4 text-[#1F3D3D] rounded border-gray-300 focus:ring-[#1F3D3D]"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Desglosar fila de IVA en cotizaciones y documentos PDF
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Firmante y Condiciones Predeterminadas */}
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
            {sucursales.length > 1 && puedeEliminar ? (
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

            {(!isGerenteSucursal || branchSeleccionada?.id === user?.sucursalId) ? (
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
            ) : (
              <div className="bg-amber-50 text-amber-900 border border-amber-300 text-xs px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
                <span>🔒</span> Modo solo lectura: Esta sucursal no corresponde a tu sede asignada.
              </div>
            )}
          </div>
        </form>
      )}
      </>
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

                {/* Configuración Fiscal y Moneda inicial */}
                <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <span>⚙️</span> Configuración Fiscal y Moneda
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">IVA (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={nuevaSucursal.porcentajeIva ?? 13}
                        onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, porcentajeIva: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Moneda (ISO)</label>
                      <input
                        type="text"
                        value={nuevaSucursal.monedaCodigo || 'USD'}
                        onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, monedaCodigo: e.target.value.toUpperCase() })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Símbolo</label>
                      <input
                        type="text"
                        value={nuevaSucursal.monedaSimbolo || '$'}
                        onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, monedaSimbolo: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Validez (Días)</label>
                      <input
                        type="number"
                        value={nuevaSucursal.diasValidezCotizacion ?? 15}
                        onChange={(e) => setNuevaSucursal({ ...nuevaSucursal, diasValidezCotizacion: parseInt(e.target.value) || 15 })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                  </div>
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
