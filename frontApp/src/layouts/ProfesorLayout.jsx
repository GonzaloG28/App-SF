import { Link, Outlet } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/authContext"

const ProfesorLayout = () => {

    const { logout } = useContext(AuthContext)
    return(
        <div>
            <nav style={{ width: "100%", background: "#ff8c00c5", padding: "1rem", display: "flex" }}>
                <h2>Panel Profesor</h2>
                <nav style={{display: "flex", width: "70%"}}>
                    <ul style={{display: "flex", justifyContent: "space-around", width: "100%"}}>
                        <li style={{listStyle: "none"}}><Link style={{color: "black", textDecoration: "none", background: "white", padding: "7px"}} to="/profesor">INICIO</Link></li>
                        <li style={{listStyle: "none"}}><Link style={{color: "black", textDecoration: "none", background: "white", padding: "7px"}} to="/profesor">CALENDARIO</Link></li>
                        <li style={{listStyle: "none"}}><Link style={{color: "black", textDecoration: "none", background: "white", padding: "7px"}} to="/profesor/nadadores">NADADORES</Link></li>
                        <li style={{listStyle: "none"}}><Link style={{color: "black", textDecoration: "none", background: "white", padding: "7px"}} to="/profesor/entrenamientos">ENTRENAMIENTOS</Link></li>
                        <li style={{listStyle: "none"}}><Link style={{color: "black", textDecoration: "none", background: "white", padding: "7px"}} to="/profesor">CHAT</Link></li>
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