import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CotizacionFormData, ItemCotizacionInput } from '../types/cotizacion.types';
import { calcularTotales } from '../utils/calculosFinancieros';
import { numeroALetras } from '../utils/numeroALetras';
import { cotizacionesApi } from '../../../api/cotizacionesApi';
import { clientesApi, usuariosApi, equiposApi } from '../../../api/catalogosApi';
import { Cliente, Usuario, Equipo } from '../../catalogos/types/catalogos.types';
import { useSucursal } from '../../../context/SucursalContext';
import { useAuth } from '../../../context/AuthContext';
import { ClienteCard } from './ClienteCard';
import { CotizacionMetadataCard } from './CotizacionMetadataCard';
import { ItemsTable } from './ItemsTable';
import { GuardarEquiposModal } from './GuardarEquiposModal';

const DEFAULT_FORM_VALUES: CotizacionFormData = {
  codigoCotizacion: '',
  usuarioEmisor: 'VENTASSR001',
  fechaEmision: new Date().toISOString().split('T')[0],
  contactoCliente: '',
  razonSocialCliente: '',
  nombreComercial: '',
  formaPago: 'Crédito 30 días, Transferencia Bancaria o Cheque',
  notaImportante: '** IMPORTANTE ** Tiempos de entrega y precios, podrían estar sujetos a cambios en inventario',
  subtotalSinIva: 0,
  montoIva: 0,
  totalInversion: 0,
  totalEnLetras: 'CERO DOLARES CON 00/100',
  items: [
    {
      itemNumero: 1,
      descripcionEquipo: '',
      partNumber: '',
      caracteristicas: '',
      tiempoEntrega: 'De 5 a 6 semanas',
      cantidad: 1,
      precioUnitario: 0,
      totalLinea: 0
    }
  ]
};

export const CotizacionForm = () => {
  const navigate = useNavigate();
  const { sucursalActiva } = useSucursal();
  const { user, isAdminOrGerente } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estados de Base de Datos (Clientes, Usuarios, Equipos)
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([]);
  const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [equiposCatalogo, setEquiposCatalogo] = useState<Equipo[]>([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState<{ [itemIndex: number]: Equipo[] }>({});
  const [busquedaActivaItem, setBusquedaActivaItem] = useState<number | null>(null);

  // Estados para modal de confirmación y guardado de equipos nuevos
  const [equiposNuevosDetectados, setEquiposNuevosDetectados] = useState<ItemCotizacionInput[]>([]);
  const [mostrarModalEquiposNuevos, setMostrarModalEquiposNuevos] = useState(false);
  const [datosPendientesGuardar, setDatosPendientesGuardar] = useState<CotizacionFormData | null>(null);

  const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<CotizacionFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Carga inicial y reactiva de datos maestros según la sucursal activa seleccionada
  useEffect(() => {
    const sucursalId = sucursalActiva?.id;
    const targetEmpresaId = sucursalActiva?.empresaId || user?.empresaId;

    clientesApi.listarOBuscar(undefined, sucursalId, targetEmpresaId).then(data => {
      setClientes(data);
      setClientesSugeridos(data);
    }).catch(console.error);

    if (user?.username) {
      setValue('usuarioEmisor', user.username);
    }

    if (isAdminOrGerente) {
      usuariosApi.listarOBuscar(undefined, targetEmpresaId).then(data => {
        setUsuarios(data);
      }).catch(console.error);
    }

    equiposApi.listarOBuscar(undefined, sucursalId, targetEmpresaId).then(data => {
      setEquiposCatalogo(data);
    }).catch(console.error);

    // Ajustar condiciones comerciales y notas por defecto según la sucursal activa
    if (sucursalActiva) {
      if (sucursalActiva.formaPagoPredeterminada) {
        setValue('formaPago', sucursalActiva.formaPagoPredeterminada);
      }
      if (sucursalActiva.notaPredeterminada) {
        setValue('notaImportante', sucursalActiva.notaPredeterminada);
      }
    }
  }, [sucursalActiva, user?.username, user?.empresaId, isAdminOrGerente, setValue]);

  // Autocompletado de Clientes
  const handleBuscarCliente = (texto: string) => {
    setValue('razonSocialCliente', texto);
    if (!texto.trim()) {
      setClientesSugeridos(clientes);
      setMostrarDropdownClientes(false);
      return;
    }
    const query = texto.toLowerCase();
    const filtrados = clientes.filter(c =>
      c.razonSocial.toLowerCase().includes(query) ||
      (c.nombreComercial && c.nombreComercial.toLowerCase().includes(query)) ||
      (c.contactoPrincipal && c.contactoPrincipal.toLowerCase().includes(query))
    );
    setClientesSugeridos(filtrados);
    setMostrarDropdownClientes(true);
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setValue('razonSocialCliente', cliente.razonSocial);
    if (cliente.nombreComercial) {
      setValue('nombreComercial', cliente.nombreComercial);
    }
    if (cliente.contactoPrincipal) {
      setValue('contactoCliente', cliente.contactoPrincipal);
    }
    setMostrarDropdownClientes(false);
  };

  // Autocompletado de Equipos
  const handleBuscarEquipoEnCatalogo = (index: number, texto: string) => {
    setValue(`items.${index}.descripcionEquipo`, texto);
    setValue(`items.${index}.equipoId`, undefined);

    if (!texto.trim()) {
      setEquiposFiltrados(prev => ({ ...prev, [index]: [] }));
      setBusquedaActivaItem(null);
      return;
    }

    const query = texto.toLowerCase();
    const filtrados = equiposCatalogo.filter(e =>
      e.descripcion.toLowerCase().includes(query) ||
      (e.partNumber && e.partNumber.toLowerCase().includes(query)) ||
      (e.caracteristicas && e.caracteristicas.toLowerCase().includes(query)) ||
      (e.categoria && e.categoria.toLowerCase().includes(query))
    );

    setEquiposFiltrados(prev => ({ ...prev, [index]: filtrados }));
    setBusquedaActivaItem(index);
  };

  const handleSeleccionarEquipoDeCatalogo = (index: number, equipo: Equipo) => {
    setValue(`items.${index}.descripcionEquipo`, equipo.descripcion);
    setValue(`items.${index}.equipoId`, equipo.id);

    if (equipo.partNumber) {
      setValue(`items.${index}.partNumber`, equipo.partNumber);
    }
    if (equipo.caracteristicas) {
      setValue(`items.${index}.caracteristicas`, equipo.caracteristicas);
    }
    if (equipo.tiempoEntregaPredeterminado) {
      setValue(`items.${index}.tiempoEntrega`, equipo.tiempoEntregaPredeterminado);
    }
    if (equipo.precioReferencial) {
      setValue(`items.${index}.precioUnitario`, Number(equipo.precioReferencial));
    }

    setBusquedaActivaItem(null);
    setEquiposFiltrados(prev => ({ ...prev, [index]: [] }));
  };

  // Cálculos reactivos de montos y totales
  const watchItems = useWatch({
    control,
    name: 'items'
  });

  const { subtotalSinIva, montoIva, totalInversion } = calcularTotales(
    (watchItems || []).map(it => ({
      cantidad: Number(it?.cantidad || 0),
      precioUnitario: Number(it?.precioUnitario || 0)
    }))
  );

  const totalEnLetras = numeroALetras(totalInversion);

  const prepararDatos = (data: CotizacionFormData): CotizacionFormData => {
    const itemsCalculados = (data.items || []).map((it, idx) => {
      const cant = Number(it.cantidad || 0);
      const precio = Number(it.precioUnitario || 0);
      const totalLinea = Math.round((cant * precio) * 100) / 100;
      return {
        ...it,
        itemNumero: idx + 1,
        cantidad: cant,
        precioUnitario: precio,
        totalLinea
      };
    });

    return {
      ...data,
      sucursalId: sucursalActiva?.id || 1,
      empresaId: sucursalActiva?.empresaId || user?.empresaId,
      subtotalSinIva,
      montoIva,
      totalInversion,
      totalEnLetras,
      items: itemsCalculados
    };
  };

  // Vista Previa PDF
  const handlePreview = async () => {
    const newWindow = window.open('about:blank', '_blank');
    try {
      setLoading(true);
      const currentValues = watch();
      const dataPreparada = prepararDatos(currentValues);
      const blob = await cotizacionesApi.previsualizarPdf(dataPreparada);
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      if (newWindow) newWindow.close();
      console.error('Error previewing PDF:', error);
      alert('Error generando la vista previa del PDF');
    } finally {
      setLoading(false);
    }
  };

  // Guardado de Cotización
  const ejecutarGuardadoCotizacion = async (data: CotizacionFormData) => {
    const newWindow = window.open('about:blank', '_blank');
    try {
      setLoading(true);
      const dataPreparada = prepararDatos(data);
      const response = await cotizacionesApi.crear(dataPreparada);

      const blob = await cotizacionesApi.descargarPdf(response.id);
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);

      reset(DEFAULT_FORM_VALUES);
      navigate('/cotizaciones', {
        state: { mensaje: `¡Cotización ${response.codigoCotizacion} generada y guardada exitosamente!` }
      });
    } catch (error: any) {
      if (newWindow) newWindow.close();
      console.error('Error creating cotizacion:', error);
      const details = error?.response?.data?.details;
      if (details) {
        const msgs = Object.entries(details).map(([f, m]) => `• ${f}: ${m}`).join('\n');
        alert(`Faltan campos obligatorios para guardar:\n${msgs}`);
      } else {
        alert(error?.response?.data?.message || 'Error guardando la cotización');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CotizacionFormData) => {
    // Detectar si hay equipos nuevos que no existen en el catálogo
    const itemsNuevos = (data.items || []).filter(it => {
      if (!it.descripcionEquipo || it.descripcionEquipo.trim() === '') return false;
      if (it.equipoId) return false;
      const existeEnCatalogo = equiposCatalogo.some(
        eq => eq.descripcion.trim().toLowerCase() === it.descripcionEquipo.trim().toLowerCase() ||
              (it.partNumber && eq.partNumber && eq.partNumber.trim().toLowerCase() === it.partNumber.trim().toLowerCase())
      );
      return !existeEnCatalogo;
    });

    if (itemsNuevos.length > 0) {
      setEquiposNuevosDetectados(itemsNuevos);
      setDatosPendientesGuardar(data);
      setMostrarModalEquiposNuevos(true);
      return;
    }

    await ejecutarGuardadoCotizacion(data);
  };

  const handleConfirmarGuardarEquiposYCotizar = async () => {
    setMostrarModalEquiposNuevos(false);
    setLoading(true);
    const targetEmpresaId = sucursalActiva?.empresaId || user?.empresaId;
    try {
      for (const itemNuevo of equiposNuevosDetectados) {
        await equiposApi.crearOActualizar({
          descripcion: itemNuevo.descripcionEquipo.trim(),
          partNumber: itemNuevo.partNumber?.trim() || undefined,
          caracteristicas: itemNuevo.caracteristicas?.trim() || undefined,
          precioReferencial: Number(itemNuevo.precioUnitario || 0),
          tiempoEntregaPredeterminado: itemNuevo.tiempoEntrega?.trim() || 'De 5 a 6 semanas',
          sucursalId: sucursalActiva?.id,
          empresaId: targetEmpresaId,
          categoria: 'General'
        });
      }
      const actualizados = await equiposApi.listarOBuscar(undefined, sucursalActiva?.id, targetEmpresaId);
      setEquiposCatalogo(actualizados);
    } catch (err) {
      console.error('Error guardando equipos nuevos en el catálogo:', err);
    } finally {
      setLoading(false);
    }

    if (datosPendientesGuardar) {
      await ejecutarGuardadoCotizacion(datosPendientesGuardar);
    }
  };

  const handleOmitirGuardarEquiposYCotizar = async () => {
    setMostrarModalEquiposNuevos(false);
    if (datosPendientesGuardar) {
      await ejecutarGuardadoCotizacion(datosPendientesGuardar);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1F3D3D] focus:ring-[#1F3D3D] sm:text-sm p-2 border";

  return (
    <div className="max-w-7xl mx-auto pb-12 px-2 sm:px-4">
      {/* Indicador de Sucursal Activa */}
      {sucursalActiva && (
        <div className="mb-4 bg-white rounded-xl shadow-sm border-l-4 border-[#1F3D3D] p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏢</span>
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Cotizando para la Sucursal
              </div>
              <div className="text-sm sm:text-base font-bold text-[#1F3D3D]">
                {sucursalActiva.nombre}
                <span className="ml-2 text-xs font-normal text-gray-500 hidden sm:inline">
                  ({sucursalActiva.razonSocial})
                </span>
              </div>
            </div>
          </div>
          <span className="bg-teal-50 text-teal-800 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-teal-200">
            Prefijo: {sucursalActiva.prefijoCotizacion}
          </span>
        </div>
      )}

      <form
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
        className="space-y-6 sm:space-y-8"
      >
        {/* Cabecera de Dos Columnas: Cliente + Metadatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <ClienteCard
            register={register}
            errors={errors}
            clientes={clientes}
            clientesSugeridos={clientesSugeridos}
            mostrarDropdownClientes={mostrarDropdownClientes}
            setMostrarDropdownClientes={setMostrarDropdownClientes}
            handleBuscarCliente={handleBuscarCliente}
            handleSelectCliente={handleSelectCliente}
            inputClasses={inputClasses}
          />

          <CotizacionMetadataCard
            register={register}
            errors={errors}
            setValue={setValue}
            usuarioEmisorValor={watch('usuarioEmisor')}
            usuarios={usuarios}
            isAdminOrGerente={isAdminOrGerente}
            inputClasses={inputClasses}
          />
        </div>

        {/* Tabla de Items y Resumen de Totales */}
        <ItemsTable
          fields={fields}
          register={register}
          setValue={setValue}
          append={append}
          remove={remove}
          watchItems={watchItems}
          equiposCatalogo={equiposCatalogo}
          equiposFiltrados={equiposFiltrados}
          busquedaActivaItem={busquedaActivaItem}
          setBusquedaActivaItem={setBusquedaActivaItem}
          handleBuscarEquipoEnCatalogo={handleBuscarEquipoEnCatalogo}
          handleSeleccionarEquipoDeCatalogo={handleSeleccionarEquipoDeCatalogo}
          subtotalSinIva={subtotalSinIva}
          montoIva={montoIva}
          totalInversion={totalInversion}
          totalEnLetras={totalEnLetras}
          inputClasses={inputClasses}
        />

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white font-medium rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 text-center cursor-pointer"
          >
            Vista Previa PDF
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-[#1F3D3D] text-white font-medium rounded-lg shadow-sm hover:bg-[#152a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F3D3D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-center cursor-pointer"
          >
            {loading ? 'Guardando...' : 'Guardar Cotización'}
          </button>
        </div>
      </form>

      {/* Modal interactivo de detección y guardado de equipos nuevos en BD */}
      <GuardarEquiposModal
        isOpen={mostrarModalEquiposNuevos}
        equiposNuevos={equiposNuevosDetectados}
        onCancelar={() => setMostrarModalEquiposNuevos(false)}
        onSoloCotizar={handleOmitirGuardarEquiposYCotizar}
        onGuardarEnBdYCotizar={handleConfirmarGuardarEquiposYCotizar}
      />
    </div>
  );
};
