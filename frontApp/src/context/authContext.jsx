import { createContext, useState, useEffect, useContext } from "react"
import { loginRequest } from "../api/auth.api"
import { useNavigate } from "react-router-dom"

export const AuthContext = createContext()

// Hook personalizado para usar el contexto fácilmente
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

    useEffect(() => {
        const checkLogin = () => {
            const token = localStorage.getItem("token");
            const rol = localStorage.getItem("rol");
            const correo = localStorage.getItem("correo"); // <-- Recuperamos
            const nombre = localStorage.getItem("nombre"); // <-- Recuperamos
            const debeCambiar = localStorage.getItem("debeCambiarPassword") === "true";

            if (token && rol) {
                setUser({ token, rol, correo, nombre, debeCambiarPassword: debeCambiar });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        }
        checkLogin()
    }, [])

    const login = async (data) => {
        try {
            const res = await loginRequest(data);
            // Capturamos nombre y correo de la respuesta del backend
            const { token, rol, correo, nombre, debeCambiarPassword } = res.data;

            localStorage.setItem("token", token);
            localStorage.setItem("rol", rol);
            localStorage.setItem("correo", correo); // Guardamos para persistencia
            localStorage.setItem("nombre", nombre);
            localStorage.setItem("debeCambiarPassword", debeCambiarPassword);

            // Actualizamos el estado global
            setUser({ token, rol, correo, nombre, debeCambiarPassword });
            setIsAuthenticated(true);

            return { success: true, rol, debeCambiarPassword };
        } catch (error) {
            console.error("Login Error:", error);
            return {
                success: false,
                message: error.message || "Error al iniciar sesión",
            }
        }
    }

    const logout = () => {
        localStorage.clear() // Limpia todo para evitar residuos de sesión
        setUser(null)
        setIsAuthenticated(false)
        navigate("/login")
    }

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
                passwordCambiadoExitosamente
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}