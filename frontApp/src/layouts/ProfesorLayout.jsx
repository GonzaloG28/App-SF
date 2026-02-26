import { Link, Outlet } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/authContext"

const ProfesorLayout = () => {

    const { logout } = useContext(AuthContext)
    return(
        <div>
            <nav style={{ width: "100%", background: "#ff8c00c5", padding: "1rem", display: "flex" }}>
                <h3>Panel Profesor</h3>
                <nav style={{display: "flex", width: "70%"}}>
                    <ul style={{display: "flex", justifyContent: "space-around", width: "100%"}}>
                        <li><Link to="/profesor">DASHBOARD</Link></li>
                        <li><Link to="/profesor/nadadores">NADADORES</Link></li>
                        <li><Link to="/profesor/entrenamientos">ENTRENAMIENTOS</Link></li>
                    </ul>
                </nav>
                <button style={{padding: "10px", width: "7%", height: "7%", margin: "auto auto"}} onClick={logout}>Cerrar sesion</button>
            </nav>

            <main style={{ padding: "2rem", flex: 1, textAlign: "center" }}>
                <Outlet />
            </main>
        </div>
    )
}

export default ProfesorLayout