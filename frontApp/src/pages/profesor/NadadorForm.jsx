import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"

import { createNadador, getNadadorById, updateNadador} from "../../api/profesor.api"

const NadadorForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    fechaNacimiento: "",
    peso: "",
    altura: "",
    rut: "",
    pruebasEspecialidad: ""
  })

  useEffect(() => {
    if (id) {
      const fetchNadador = async () => {
        const res = await getNadadorById(id)
        setForm({
          ...res.data,
          fechaNacimiento: res.data.fechaNacimiento
          ? res.data.fechaNacimiento.split("T")[0]
          : "",
        pruebasEspecialidad: res.data.pruebasEspecialidad
          ? res.data.pruebasEspecialidad.join(", ")
          : ""
        })
      }
      fetchNadador()
    }
  }, [id])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      ...form,
        peso: Number(form.peso),
        altura: Number(form.altura),
        pruebasEspecialidad: form.pruebasEspecialidad
            .split(",")
            .map(p => p.trim())
    }

    if (id) {
      await updateNadador(id, data)
    } else {
      await createNadador(data)
    }

    navigate("/profesor/nadadores")
  }

  return (
    <div>
      <h2>{id ? "Editar Nadador" : "Crear Nadador"}</h2>

      <form style={{display: "inline-block", width: "20%"}} onSubmit={handleSubmit}>
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} name="nombre" required value={form.nombre} onChange={handleChange} placeholder="Nombre" />
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} name="apellido" required value={form.apellido} onChange={handleChange} placeholder="Apellido" />
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} name="correo" required value={form.correo} onChange={handleChange} placeholder="Correo" />
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} type="date" required name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} />
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} type="number" required name="peso" value={form.peso} onChange={handleChange} placeholder="Peso" />
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} type="number" required name="altura" value={form.altura} onChange={handleChange} placeholder="Altura" />
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} name="rut" required value={form.rut} onChange={handleChange} placeholder="RUT" />
        <input style={{width: "100%", padding: "5px", marginBottom: "20px"}} name="pruebasEspecialidad" value={form.pruebasEspecialidad} onChange={handleChange} placeholder="Pruebas (separadas por coma)" />

        <button type="submit">Guardar</button>
        <Link to="/profesor/nadadores">
          <button>Volver</button>
        </Link>
      </form>
    </div>
  )
}

export default NadadorForm