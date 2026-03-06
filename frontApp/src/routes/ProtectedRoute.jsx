import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AutHContext"

const ProtectedRouter = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, user } = useContext(AuthContext)

    if(loading){
        return <p>Cargando...</p>
    }

    if(!isAuthenticated){
        return <Navigate to='/login' replace/>
    }

    if(allowedRoles && !allowedRoles.includes(user?.rol)){
        return <Navigate to='/' replace />
    }

    return children
}

export default ProtectedRouter