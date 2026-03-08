import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")

        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
  (response) => {
    return response; // Si todo va bien, deja pasar la respuesta
  },
  (error) => {
    // Si el error es 401 (No autorizado / Token expirado)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada. Limpiando credenciales...");
      
      // Limpiamos el almacenamiento
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirigimos al login limpiamente (evita el bug visual)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export default api