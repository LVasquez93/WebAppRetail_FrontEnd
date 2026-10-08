import axiosClient from './axiosClient';
import { RbacMatriz } from '../features/rbac/types/rbac.types';

export const rbacApi = {
  obtenerMatriz: async (): Promise<RbacMatriz> => {
    const response = await axiosClient.get('/rbac/matriz');
    return response.data;
  },

  guardarMatriz: async (matriz: RbacMatriz): Promise<RbacMatriz> => {
    const response = await axiosClient.put('/rbac/matriz', matriz);
    return response.data;
  },

  restablecerDefaults: async (): Promise<RbacMatriz> => {
    const response = await axiosClient.post('/rbac/reset');
    return response.data;
  },

  obtenerMisPermisos: async (): Promise<string[]> => {
    const response = await axiosClient.get('/rbac/mis-permisos');
    return response.data;
  },
};
