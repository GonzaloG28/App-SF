import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getNadadorById } from "../../api/profesor.api";

const NadadorProfile = () => {
  const { id } = useParams();
  const [nadador, setNadador] = useState(null);

  useEffect(() => {
    const fetchNadador = async () => {
      const res = await getNadadorById(id);
      setNadador(res.data);
    };
    fetchNadador();
  }, [id]);

  if (!nadador) return <p>Cargando...</p>;

  return (
    <div>
      <h2>{nadador.user.nombre}</h2>
      <p>Edad: {nadador.edad}</p>
      <p>RUT: {nadador.rut}</p>
      <p>Categoría: {nadador.categoria}</p>
      <p>Peso: {nadador.peso} kg</p>
      <p>Altura: {nadador.altura} cm</p>
      <p>Pruebas: {nadador.pruebasEspecialidad.join(", ")}</p>

      <div>
        <Link to={`/profesor/nadador/${id}/competencias`}>
          <button>Ver Competencias</button>
        </Link>
        <Link to="/profesor/nadadores">
          <button>Volver</button>
        </Link>
      </div>
    </div>
  );
};

export default NadadorProfile;