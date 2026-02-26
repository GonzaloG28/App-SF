
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getNadadores, deleteNadador } from "../../api/profesor.api"

const Nadadores = () => {
  const [nadadores, setNadadores] = useState([])
  const [categoria, setCategoria] = useState("")
  const [nombre, setNombre] = useState("")

  const fetchNadadores = async () => {
    const res = await getNadadores({ categoria, nombre })
  setNadadores(res.data)
  }

  useEffect(() => {
    fetchNadadores()
  }, [categoria, nombre])

  const handleDelete = async (id) => {
    try {
      await deleteNadador(id)
      fetchNadadores() // refresca lista
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
        <button><Link to="/profesor/nadadores/nuevo">Crear Nadador</Link></button>
      <h2>Lista de Nadadores</h2>
    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="">Todas</option>
        <option value="Infantil">Infantil</option>
        <option value="JA">Juvenil A</option>
        <option value="JB">Juvenil B</option>
        <option value="Mayores">Mayores - Master</option>
    </select>

    <input
        type="text"
        placeholder="Buscar por nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
    />

    <button onClick={fetchNadadores}>Buscar</button>
      <ul>
        {nadadores.map((n) => (
          <li key={n._id}>
            {n.user?.nombre} - {n.user?.correo}
            <button><Link to={`/profesor/nadadores/editar/${n._id}`}>Editar</Link></button>
            <button onClick={() => handleDelete(n._id)}>
              Eliminar
            </button>
          </li>
          
        ))}
      </ul>
    </div>
  )
}

export default Nadadores