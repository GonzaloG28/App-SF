import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { loginRequest } from "../api/auth.api"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import api from "../api/axios"

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider")
  return context
}

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading,         setLoading]         = useState(true)
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
  const verificarSesion = async () => {
    const rol = localStorage.getItem("rol")

    if (!rol) {
      // Sin datos locales — definitivamente no autenticado
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    try {
      // Verificar con el servidor si la cookie sigue válida
      const res = await api.get("/auth/me")
      const { correo, rol } = res.data
      const nombre = localStorage.getItem("nombre")

      setUser({ rol, correo, nombre })
      setIsAuthenticated(true)
    } catch {
      // Cookie expirada o inválida — limpiar todo y forzar login
      localStorage.removeItem("rol")
      localStorage.removeItem("correo")
      localStorage.removeItem("nombre")
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  verificarSesion()
}, [])

  const login = useCallback(async (data) => {
    try {
      // Limpiamos el caché antes de loguearse — evita que el segundo
      // usuario vea datos del primero en el momento del login
      queryClient.clear()

      const res = await loginRequest(data)
      const { correo, nombre, rol, debeCambiarPassword } = res.data
      // NOTA: el token NO viene en res.data — el backend lo puso
      // directamente en la cookie httpOnly. axios lo recibió y el
      // navegador lo guardó automáticamente.

      // Solo guardamos datos de UI en localStorage — nunca el token
      localStorage.setItem("rol",    rol)
      localStorage.setItem("correo", correo)
      localStorage.setItem("nombre", nombre)

      setUser({ rol, correo, nombre })
      setIsAuthenticated(true)

      return { success: true, rol }
    } catch (error) {
      console.error("Login Error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión"
      }
    }
  }, [queryClient])

  const logout = useCallback(async () => {
    try {
      // Llamamos al backend para que borre la cookie httpOnly desde el servidor.
      // Solo el servidor puede borrar una cookie httpOnly —
      // JavaScript del navegador no puede hacerlo.
      await api.post("/auth/logout")
    } catch {
      // Si el request falla (red caída, token ya expirado), continuamos
      // con el logout local de todas formas
    } finally {
      queryClient.clear()
      localStorage.removeItem("rol")
      localStorage.removeItem("correo")
      localStorage.removeItem("nombre")
      setUser(null)
      setIsAuthenticated(false)
      navigate("/login")
    }
  }, [queryClient, navigate])

  const passwordCambiadoExitosamente = useCallback(() => {
    // Invalida la query del perfil para que React Query vuelva a pedirle
    // al servidor el valor actualizado de debeCambiarPassword
    queryClient.invalidateQueries({ queryKey: ["miPerfil"] })
    setUser(prev => ({ ...prev, debeCambiarPassword: false }))
  }, [queryClient])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      loading,
      passwordCambiadoExitosamente
    }}>
      {children}
    </AuthContext.Provider>
  )
}

