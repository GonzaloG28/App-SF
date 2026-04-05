import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  // 🟢 RAM: Evita que peticiones colgadas consuman memoria eternamente
  timeout: 10000, 
});

// Interceptor de Petición (Request)
api.interceptors.request.use(
  (config) => {
    // Aquí podrías añadir headers de telemetría o versión si fuera necesario
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta (Response)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};

    // 🟢 OPTIMIZACIÓN: Solo redirigir si no es una ruta que ya estamos validando
    // o si el error no fue una cancelación voluntaria.
    if (status === 401) {
      const isLoginRoute = window.location.pathname.includes("/login");
      
      // Si el token expiró, avisamos al sistema pero no matamos la RAM con un refresh 
      // a menos que sea estrictamente necesario.
      if (!isLoginRoute) {
        console.warn("Sesión expirada. Redirigiendo...");
        
        // En lugar de window.location.href, lo ideal es limpiar el estado global 
        // de tu App (ej. AuthContext) para que el Router de React haga lo suyo.
        // window.location.href = "/login"; 
      }
    }

    // 🟢 RAM: Manejo de errores de red o Timeouts para no dejar promesas pendientes
    if (error.code === 'ECONNABORTED') {
      console.error("La petición tardó demasiado y fue cancelada.");
    }

    return Promise.reject(error);
  }
);

export default api;