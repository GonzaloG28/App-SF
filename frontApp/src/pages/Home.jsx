import { Link } from "react-router-dom"

const Home = () => {
    return(
        <div style={{ textAlign: "center"}}>
            <h1>¡Bienvenido!</h1>
            <button style={{width: "10%", padding: "10px", background: "none"}}><Link style={{textDecoration: "none", height: "100%", width: "100%"}} to={"/login"}>INICIA SESION</Link></button>
        </div>
    )
}

export default Home