import { createContext, useState, useEffect } from "react"
import { loginRequest } from "../api/auth.api"
import { useNavigate } from "react-router-dom"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const rol = localStorage.getItem("rol")

        if (token && rol) {
            setUser({ token, rol })
            setIsAuthenticated(true)
        }

        setLoading(false)
    }, [])

    const login = async (data) => {
        try{
            const res = await loginRequest(data)

            const { token, rol} = res.data

            localStorage.setItem("token", token)
            localStorage.setItem("rol", rol)

            setUser({ token, rol})
            setIsAuthenticated(true)

            return { success: true}

        }catch(error){
            return{
                success: false,
                message: error.response?.data?.message || "Error al iniciar sesion",
            }
        }
    }

    const navigate = useNavigate()

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("rol")

        setUser(null)
        setIsAuthenticated(false)
        navigate("/login")
    }

    return(
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}