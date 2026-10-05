import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cotizacionesApi } from '../../../api/cotizacionesApi';
import { CotizacionResponse } from '../types/cotizacion.types';
import { useSucursal } from '../../../context/SucursalContext';

export const CotizacionesList = () => {
  const location = useLocation();
  const { sucursales } = useSucursal();
  const [bannerMessage, setBannerMessage] = useState<string | null>(location.state?.mensaje || null);
  const [cotizaciones, setCotizaciones] = useState<CotizacionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtroSucursalId, setFiltroSucursalId] = useState<number | 'TODAS'>('TODAS');

  // Clear history state after reading so refreshing doesn't keep showing the message
  useEffect(() => {
    if (location.state?.mensaje) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchCotizaciones = async (pageNumber: number, sucursalId?: number) => {
    try {
      setLoading(true);
      const data = await cotizacionesApi.listar(pageNumber, 10, sucursalId);
      setCotizaciones(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sucursalId = filtroSucursalId === 'TODAS' ? undefined : filtroSucursalId;
    fetchCotizaciones(page, sucursalId);
  }, [page, filtroSucursalId]);

  const handleVerPdf = async (id: number) => {
    const newWindow = window.open('about:blank', '_blank');
    try {
      const blob = await cotizacionesApi.descargarPdf(id);
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      if (newWindow) newWindow.close();
      console.error('Error opening pdf:', error);
      alert('Error al abrir el PDF');
    }
  };

  if (loading && page === 0 && cotizaciones.length === 0) {
    return <div className="flex justify-center p-8">Cargando historial de cotizaciones...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-2 sm:px-4">
      {bannerMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 sm:px-5 sm:py-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold shrink-0">✓</span>
            <div>
              <p className="font-semibold text-sm">{bannerMessage}</p>
              <p className="text-xs text-emerald-600">El documento se ha abierto en una pestaña nueva para su revisión.</p>
            </div>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 text-lg font-bold p-1 ml-2"
            title="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Historial de Cotizaciones</h2>
            <p className="text-xs sm:text-sm text-gray-500">Listado consolidado de cotizaciones emitidas por sucursal.</p>
          </div>

          {/* Filtro por Sucursal */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Filtrar por:</span>
            <select
              value={filtroSucursalId}
              onChange={(e) => {
                const val = e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value);
                setFiltroSucursalId(val);
                setPage(0);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#1F3D3D] focus:border-[#1F3D3D]"
            >
              <option value="TODAS">🏢 Todas las Sucursales</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>🏢 {s.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        
        {cotizaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay cotizaciones registradas para el filtro seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-[#1F3D3D] text-white">
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">#</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Código</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Sucursal</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Cliente</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Razón Social</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Fecha</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm text-right">Total</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cotizaciones.map((cot, index) => (
                  <tr key={cot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-900">{page * 10 + index + 1}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-blue-700">{cot.codigoCotizacion}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {cot.nombreSucursal || 'Matriz'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600">{cot.contactoCliente}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600">{cot.razonSocialCliente}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600">{new Date(cot.fechaCreacion).toLocaleDateString()}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-900 text-right">${cot.totalInversion.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleVerPdf(cot.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6394EC] text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6394EC] transition-colors cursor-pointer"
                        title="Abrir PDF en nueva pestaña"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
