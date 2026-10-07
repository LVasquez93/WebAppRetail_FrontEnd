import axiosClient from './axiosClient';
import { Sucursal } from '../features/catalogos/types/catalogos.types';

export const sucursalesApi = {
  listar: async (empresaId?: number): Promise<Sucursal[]> => {
    const response = await axiosClient.get<Sucursal[]>('/sucursales', {
      params: empresaId ? { empresaId } : undefined,
    });
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<Sucursal> => {
    const response = await axiosClient.get<Sucursal>(`/sucursales/${id}`);
    return response.data;
  },

  crear: async (data: Partial<Sucursal>): Promise<Sucursal> => {
    const response = await axiosClient.post<Sucursal>('/sucursales', data);
    return response.data;
  },

  actualizar: async (id: number, data: Partial<Sucursal>): Promise<Sucursal> => {
    const response = await axiosClient.put<Sucursal>(`/sucursales/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosClient.delete(`/sucursales/${id}`);
  },
};
