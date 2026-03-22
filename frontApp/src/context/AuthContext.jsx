import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { loginRequest } from "../api/auth.api"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

export const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider")
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser]                     = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading]               = useState(true)
    const navigate     = useNavigate()
    const queryClient  = useQueryClient()

    useEffect(() => {
        const token  = localStorage.getItem("token")
        const rol    = localStorage.getItem("rol")
        const correo = localStorage.getItem("correo")
        const nombre = localStorage.getItem("nombre")

        if (token && rol) {
            setUser({ token, rol, correo, nombre })
            setIsAuthenticated(true)
        } else {
            setUser(null)
            setIsAuthenticated(false)
        }
        setLoading(false)
    }, [])

    const login = useCallback(async (data) => {
        try {
            // FIX: antes de setear el nuevo usuario, limpiamos el caché completo
            // de React Query. Sin esto, React Query devuelve instantáneamente el
            // perfil del usuario anterior (miPerfil, nadadores, etc.) porque la
            // queryKey es la misma — provocando que el segundo usuario vea datos
            // del primero hasta que el request termina.
            queryClient.clear()

            const res = await loginRequest(data)
            const { token, rol, correo, nombre, debeCambiarPassword } = res.data

            localStorage.setItem("token",  token)
            localStorage.setItem("rol",    rol)
            localStorage.setItem("correo", correo)
            localStorage.setItem("nombre", nombre)
            // FIX DE SEGURIDAD: ya no guardamos debeCambiarPassword en localStorage
            // porque es manipulable desde DevTools. El valor viene del servidor
            // a través de la query del perfil (perfil.user.debeCambiarPassword).

            setUser({ token, rol, correo, nombre })
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

    const logout = useCallback(() => {
        // FIX: limpiar el caché de React Query ANTES de borrar localStorage
        // y de navegar. Si se hace después, componentes que siguen montados
        // pueden lanzar queries con el token viejo en el último render.
        queryClient.clear()

        localStorage.clear()
        setUser(null)
        setIsAuthenticated(false)
        navigate("/login")
    }, [queryClient, navigate])

    const passwordCambiadoExitosamente = useCallback(() => {
        // FIX: ya no tocamos localStorage para debeCambiarPassword.
        // Solo invalidamos la query del perfil para que React Query
        // vuelva a pedirle al servidor el valor actualizado.
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
