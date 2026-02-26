import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { createNadador, getNadadorById, updateNadador} from "../../api/profesor.api"

const NadadorForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: "",
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

      <form onSubmit={handleSubmit}>
        <input name="nombre" required value={form.nombre} onChange={handleChange} placeholder="Nombre" />
        <input name="correo" required value={form.correo} onChange={handleChange} placeholder="Correo" />
        <input type="date" required name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} />
        <input type="number" required name="peso" value={form.peso} onChange={handleChange} placeholder="Peso" />
        <input type="number" required name="altura" value={form.altura} onChange={handleChange} placeholder="Altura" />
        <input name="rut" required value={form.rut} onChange={handleChange} placeholder="RUT" />
        <input name="pruebasEspecialidad" value={form.pruebasEspecialidad} onChange={handleChange} placeholder="Pruebas (separadas por coma)" />

        <button type="submit">Guardar</button>
      </form>
    </div>
  )
}

export default NadadorForm