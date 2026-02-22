import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/authContext"

const Login = () => {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        correo: "",
        password: "",
    })

    const [error, setError] = useState("")

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await login(formData)

        if(result.success){
            navigate("/")
        }else{
            setError(result.message)
        }
    }

    return(
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="correo"
                    placeholder="Correo"
                    value={formData.correo}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                />
                <button type="submit">Ingresar</button>
            </form>

            {error && <p style={{color: "red"}}>{error}</p>}
        </div>
    )
}

export default Login
