import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"
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
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const limpiarEstadoLocal = useCallback(() => {
    localStorage.removeItem("rol")
    // 🟢 RAM: No guardamos nombre/correo en disco, solo en el estado 'user'
    setUser(null)
    setIsAuthenticated(false)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    const verificarSesion = async () => {
      // 🟢 OPTIMIZACIÓN: Solo chequeamos el rol para decidir si vale la pena llamar a la API
      if (!localStorage.getItem("rol")) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get("/auth/me")
        setUser(data) // data: { id, nombre, correo, rol, debeCambiarPassword }
        setIsAuthenticated(true)
        localStorage.setItem("rol", data.rol)
      } catch (error) {
        limpiarEstadoLocal()
      } finally {
        setLoading(false)
      }
    }
    verificarSesion()
  }, [limpiarEstadoLocal])

  const login = useCallback(async (data) => {
    try {
      const res = await loginRequest(data)
      const userData = res.data.user

      localStorage.setItem("rol", userData.rol)
      setUser(userData)
      setIsAuthenticated(true)
      queryClient.clear() // Limpiamos basura de sesiones previas

      return { success: true, rol: userData.rol }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión"
      }
    }
  }, [queryClient])

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
    } finally {
      limpiarEstadoLocal()
      navigate("/login", { replace: true }) // replace evita que el usuario vuelva atrás con el botón del navegador
    }
  }, [limpiarEstadoLocal, navigate])

  // 🟢 RAM/CPU: Memorizamos el objeto del contexto para que los componentes 
  // hijos no se re-rendericen a menos que el estado cambie de verdad.
  const authValue = useMemo(() => ({
    user,
    isAuthenticated,
    login,
    logout,
    loading,
    passwordCambiadoExitosamente: () => {
      queryClient.invalidateQueries({ queryKey: ["miPerfil"] })
      setUser(prev => prev ? { ...prev, debeCambiarPassword: false } : prev)
    }
  }), [user, isAuthenticated, login, logout, loading, queryClient])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}
