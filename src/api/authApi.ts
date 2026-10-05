import axiosClient from './axiosClient';
import { AuthResponse, AuthUser, LoginRequest } from '../features/auth/types/auth.types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await axiosClient.get<AuthUser>('/auth/me');
    return response.data;
  },
};
