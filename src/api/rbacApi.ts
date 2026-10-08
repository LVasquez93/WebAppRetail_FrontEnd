import axiosClient from './axiosClient';
import { RbacMatriz, PermisoDefinicion, UsuarioPermisos } from '../features/rbac/types/rbac.types';

export const rbacApi = {
  obtenerCatalogo: async (): Promise<PermisoDefinicion[]> => {
    const response = await axiosClient.get('/rbac/catalogo');
    return response.data;
  },

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

  obtenerPermisosUsuario: async (usuarioId: number): Promise<UsuarioPermisos> => {
    const response = await axiosClient.get(`/rbac/usuarios/${usuarioId}/permisos`);
    return response.data;
  },

  guardarPermisosUsuario: async (usuarioId: number, permisos: string[]): Promise<UsuarioPermisos> => {
    const response = await axiosClient.put(`/rbac/usuarios/${usuarioId}/permisos`, permisos);
    return response.data;
  },

  restablecerPermisosUsuario: async (usuarioId: number): Promise<UsuarioPermisos> => {
    const response = await axiosClient.post(`/rbac/usuarios/${usuarioId}/permisos/reset`);
    return response.data;
  },

  obtenerMisPermisos: async (): Promise<string[]> => {
    const response = await axiosClient.get('/rbac/mis-permisos');
    return response.data;
  },
};
