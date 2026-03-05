import { createContext, useState, useEffect } from "react"
import { loginRequest } from "../api/auth.api"
import { useNavigate } from "react-router-dom"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")
        const rol = localStorage.getItem("rol")
        // Recuperamos el flag del almacenamiento local
        const debeCambiar = localStorage.getItem("debeCambiarPassword") === "true"

        if (token && rol) {
            setUser({ token, rol, debeCambiarPassword: debeCambiar })
            setIsAuthenticated(true)
        }

        setLoading(false)
    }, [])

    const login = async (data) => {
        try {
            const res = await loginRequest(data)

            // Desestructuramos el flag que viene desde tu controlador de User del backend
            const { token, rol, debeCambiarPassword } = res.data

            localStorage.setItem("token", token)
            localStorage.setItem("rol", rol)
            // Guardamos el flag como string en localStorage
            localStorage.setItem("debeCambiarPassword", debeCambiarPassword)

            setUser({ token, rol, debeCambiarPassword })
            setIsAuthenticated(true)

            // Retornamos el flag para que el componente Login también pueda usarlo si lo necesita
            return { success: true, debeCambiarPassword }

        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Error al iniciar sesión",
            }
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("rol")
        localStorage.removeItem("debeCambiarPassword") // Limpiamos al salir

        setUser(null)
        setIsAuthenticated(false)
        navigate("/login")
    }

    // Función extra para actualizar el estado una vez que el nadador cambie su clave
    const passwordCambiadoExitosamente = () => {
        localStorage.setItem("debeCambiarPassword", "false")
        setUser(prev => ({ ...prev, debeCambiarPassword: false }))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                logout,
                loading,
                passwordCambiadoExitosamente // La exponemos para usarla en el Dashboard
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}