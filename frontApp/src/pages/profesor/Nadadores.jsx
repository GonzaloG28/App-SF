
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNadadores, deleteNadador } from "../../api/profesor.api";

const Nadadores = () => {
  const [nadadores, setNadadores] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [nombre, setNombre] = useState("");

  const fetchNadadores = async () => {
    const res = await getNadadores({ categoria, nombre });
    setNadadores(res.data);
  };

  useEffect(() => {
    fetchNadadores();
  }, []);

  const handleDelete = async (id) => {
    await deleteNadador(id);
    fetchNadadores();
  };

  return (
    <div>
      <button>
        <Link to="/profesor/nadadores/nuevo">Crear Nadador</Link>
      </button>

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
          <li
            key={n._id}
            style={{ display: "flex", justifyContent: "space-evenly", width: "40%", margin: "0 auto", borderBottom: "solid 2px black", padding: "10px"}}
          >
            {n.user?.nombre} - {n.categoria}
            <Link to={`/profesor/nadador/${n._id}`}>
              <button>Ver perfil</button>
            </Link>
            <Link to={`/profesor/nadadores/editar/${n._id}`}>
              <button>Editar</button>
            </Link>
            <button onClick={() => handleDelete(n._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Nadadores;