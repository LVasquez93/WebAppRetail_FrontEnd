import axiosClient from './axiosClient';
import { CotizacionFormData, CotizacionResponse } from '../features/cotizaciones/types/cotizacion.types';

export const cotizacionesApi = {
  crear: async (data: CotizacionFormData): Promise<CotizacionResponse> => {
    const response = await axiosClient.post('/cotizaciones', data);
    return response.data;
  },

  listar: async (page: number = 0, size: number = 10, sucursalId?: number, empresaId?: number): Promise<{ content: CotizacionResponse[]; totalPages: number; totalElements: number }> => {
    const params: Record<string, any> = { page, size, sort: 'fechaCreacion,desc' };
    if (sucursalId) params.sucursalId = sucursalId;
    if (empresaId) params.empresaId = empresaId;
    const response = await axiosClient.get('/cotizaciones', { params });
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<CotizacionResponse> => {
    const response = await axiosClient.get(`/cotizaciones/${id}`);
    return response.data;
  },

  descargarPdf: async (id: number): Promise<Blob> => {
    const response = await axiosClient.get(`/cotizaciones/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  previsualizarPdf: async (data: CotizacionFormData): Promise<Blob> => {
    const response = await axiosClient.post('/cotizaciones/preview-pdf', data, { responseType: 'blob' });
    return response.data;
  },
};
