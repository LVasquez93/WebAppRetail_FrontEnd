import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cotizacionesApi } from '../../../api/cotizacionesApi';
import { CotizacionResponse } from '../types/cotizacion.types';
import { TenantScopeFilter } from '../../../components/common/TenantScopeFilter';
import { useTenantScopeFilter } from '../../../components/common/useTenantScopeFilter';
import { useAuth } from '../../../context/AuthContext';
import { TableSkeleton } from '../../../components/common/skeletons/TableSkeleton';

export const CotizacionesList = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [bannerMessage, setBannerMessage] = useState<string | null>(location.state?.mensaje || null);
  const [cotizaciones, setCotizaciones] = useState<CotizacionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filtro de Alcance Multi-Tenant Centralizado (Empresa y Sucursal con Gobernanza Automática)
  const { scope, setScope } = useTenantScopeFilter();

  // Clear history state after reading so refreshing doesn't keep showing the message
  useEffect(() => {
    if (location.state?.mensaje) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchCotizaciones = async (pageNumber: number, sucursalId?: number, empresaId?: number) => {
    try {
      setLoading(true);
      const data = await cotizacionesApi.listar(pageNumber, 10, sucursalId, empresaId);
      setCotizaciones(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotizaciones(page, scope.sucursalId, scope.empresaId);
  }, [page, scope.sucursalId, scope.empresaId]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-2 sm:px-4">
      {bannerMessage && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 sm:px-5 sm:py-4 rounded-xl flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold shrink-0">✓</span>
            <div>
              <p className="font-semibold text-sm">{bannerMessage}</p>
              <p className="text-xs text-emerald-600">El documento se ha abierto en una pestaña nueva para su revisión.</p>
            </div>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 text-lg font-bold p-1 ml-2 cursor-pointer"
            title="Cerrar notificación"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Historial de Cotizaciones</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Listado consolidado de cotizaciones emitidas con filtros por empresa y sucursal.</p>
          </div>

          {/* Filtros Cascada Centralizados (Empresa y Sucursal con Gobernanza Automática) */}
          <TenantScopeFilter
            value={scope}
            onChange={(newScope) => {
              setScope(newScope);
              setPage(0);
            }}
          />
        </div>
        
        {loading ? (
          <TableSkeleton columns={isAdmin ? 9 : 8} rows={7} ariaLabel="Cargando historial de cotizaciones..." />
        ) : cotizaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay cotizaciones registradas para el filtro seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-brand-primary text-white">
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">#</th>
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Código</th>
                  {isAdmin && (
                    <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Empresa</th>
                  )}
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Sucursal</th>
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Cliente</th>
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Razón Social</th>
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Fecha</th>
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm text-right">Total</th>
                  <th scope="col" className="p-3 sm:p-4 font-semibold text-xs sm:text-sm text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cotizaciones.map((cot, index) => (
                  <tr key={cot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-900">{page * 10 + index + 1}</td>
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-blue-700">{cot.codigoCotizacion}</td>
                    {isAdmin && (
                      <td className="p-3 sm:p-4 text-xs sm:text-sm">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          {cot.nombreEmpresa || `Empresa #${cot.empresaId || '—'}`}
                        </span>
                      </td>
                    )}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-quote-header text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-quote-header transition-colors cursor-pointer"
                        title="Abrir PDF en nueva pestaña"
                        aria-label={`Ver PDF de la cotización ${cot.codigoCotizacion}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
