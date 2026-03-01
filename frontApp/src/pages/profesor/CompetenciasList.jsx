import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetenciasPorNadador } from "../../api/competencias.api";

const CompetenciasList = () => {
  const { id } = useParams(); // nadadorId
  const [competencias, setCompetencias] = useState([]);

  const fetchCompetencias = async () => {
    const res = await getCompetenciasPorNadador(id);
    setCompetencias(res.data);
  };

  useEffect(() => {
    fetchCompetencias();
  }, [id]);

  return (
    <div>
      <h2>Competencias</h2>
      <Link to={`/profesor/nadador/${id}/competencias/nuevo`}>
        <button>Agregar Competencia</button>
      </Link>

      <ul>
        {competencias.map((c) => (
          <li key={c._id}>
            {c.nombre} - {new Date(c.fecha).toLocaleDateString()} - Piscina: {c.piscina}m
            <Link to={`/profesor/competencia/${c._id}/pruebas`}>
              <button>Ver Pruebas</button>
            </Link>
          </li>
        ))}
      </ul>

      <Link to={`/profesor/nadador/${id}`}>
        <button>Volver</button>
      </Link>
    </div>
  );
};

export default CompetenciasList;