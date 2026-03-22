import axios from "axios"

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // FIX CRÍTICO: withCredentials: true le dice al navegador que incluya
  // las cookies (httpOnly) en cada request cross-origin.
  // Sin esto la cookie nunca se envía y el servidor siempre responde 401.
  withCredentials: true,
})

// FIX: eliminado el interceptor que leía el token de localStorage
// y lo ponía en el header Authorization.
// Ahora el token viaja automáticamente como cookie httpOnly —
// el navegador lo adjunta solo, sin que JavaScript lo toque.

// Interceptor de respuesta — manejo de sesión expirada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Sesión expirada o no autorizado")
      // No limpiamos localStorage del token porque ya no lo usamos.
      // El logout real lo maneja AuthContext llamando a /api/auth/logout
      // que borra la cookie desde el servidor.
      //
      // Solo redirigimos si no estamos ya en login para evitar loop
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api