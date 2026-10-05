import axios from 'axios';

// En producción (Cloudflare) se inyecta VITE_API_BASE_URL (ej. https://cotizador-backend.onrender.com).
// En desarrollo local, permanece vacío '' para utilizar el proxy de Vite (/api/v1) sin cambios.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el Bearer Token en cada solicitud HTTP
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cotizador_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para capturar expiración o rechazo de credenciales (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('cotizador_token');
      localStorage.removeItem('cotizador_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
