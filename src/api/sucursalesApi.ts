import axiosClient from './axiosClient';
import { Sucursal } from '../features/catalogos/types/catalogos.types';

export const sucursalesApi = {
  listar: async (): Promise<Sucursal[]> => {
    const response = await axiosClient.get<Sucursal[]>('/sucursales');
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
};
