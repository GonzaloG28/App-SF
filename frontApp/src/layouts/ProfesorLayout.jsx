import { Link, Outlet } from "react-router-dom"

const ProfesorLayout = () => {
    return(
        <div style={{display: "flex"}}>
            <aside style={{ width: "200px", background: "#eee", padding: "1rem" }}>
                <h3>Panel Profesor</h3>
                <nav>
                    <ul>
                        <li><Link to="/profesor">Dashboard</Link></li>
                        <li><Link to="/profesor/nadadores">Nadadores</Link></li>
                        <li><Link to="/profesor/entrenamientos">Entrenamientos</Link></li>
                    </ul>
                </nav>
            </aside>

            <main style={{ padding: "2rem", flex: 1 }}>
                <Outlet />
            </main>
        </div>
    )
}

export default ProfesorLayout