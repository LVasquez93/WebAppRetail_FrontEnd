import axiosClient from './axiosClient';
import { Empresa, EmpresaFormData } from '../features/empresas/types/empresas.types';

export const empresasApi = {
  listar: async (soloActivas: boolean = false): Promise<Empresa[]> => {
    const response = await axiosClient.get<Empresa[]>('/empresas', {
      params: soloActivas ? { soloActivas: true } : undefined,
    });
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<Empresa> => {
    const response = await axiosClient.get<Empresa>(`/empresas/${id}`);
    return response.data;
  },

  crear: async (data: EmpresaFormData): Promise<Empresa> => {
    const response = await axiosClient.post<Empresa>('/empresas', data);
    return response.data;
  },

  actualizar: async (id: number, data: Partial<EmpresaFormData>): Promise<Empresa> => {
    const response = await axiosClient.put<Empresa>(`/empresas/${id}`, data);
    return response.data;
  },

  alternarEstado: async (id: number): Promise<void> => {
    await axiosClient.patch(`/empresas/${id}/estado`);
  },
};
