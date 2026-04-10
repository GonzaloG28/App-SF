import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  // 🟢 RAM: Evita que peticiones colgadas consuman memoria eternamente
  timeout: 10000, 
});

// Interceptor de Petición (Request)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta (Response)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};

    if (status === 401) {
      const isLoginRoute = window.location.pathname.includes("/login");
      
      if (!isLoginRoute) {
        console.warn("Sesión expirada. Redirigiendo...");
        
        // 🔥 AQUÍ ESTÁ LA MAGIA: Descomentamos esta línea
        window.location.href = "/login"; 
      }
    }

    if (error.code === 'ECONNABORTED') {
      console.error("La petición tardó demasiado y fue cancelada.");
    }

    return Promise.reject(error);
  }
);

export default api;