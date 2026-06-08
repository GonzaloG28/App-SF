import axios from 'axios';

const BASE_URL = __DEV__
  ? 'http://192.168.1.100:5000/api'  // ← reemplaza XXX con tu IP
  : ''; //https://app-sf.onrender.com/api

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar token a cada request automáticamente
api.interceptors.request.use(
  (config) => {
    // Por ahora sin token, lo agregaremos con SecureStore
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado → hacer logout
      console.log('Sesión expirada');
    }
    return Promise.reject(error);
  }
);

export default api;