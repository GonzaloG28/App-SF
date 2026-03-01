import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPruebasPorCompetencia } from "../../api/pruebas.api";

const PruebasList = () => {
  const { competenciaId } = useParams();
  const [pruebas, setPruebas] = useState([]);

  const fetchPruebas = async () => {
    const res = await getPruebasPorCompetencia(competenciaId);
    setPruebas(res.data);
  };

  useEffect(() => {
    fetchPruebas();
  }, [competenciaId]);

  return (
    <div>
      <h2>Pruebas</h2>
      <Link to={`/profesor/competencia/${competenciaId}/pruebas/nuevo`}>
        <button>Agregar Prueba</button>
      </Link>

      <ul>
        {pruebas.map((p) => (
          <li key={p._id}>
            {p.distancia}m {p.estilo} - Tiempo: {p.tiempo}
          </li>
        ))}
      </ul>

      <Link to={`/profesor/nadador/${pruebas[0]?.competencia?.nadador || ""}/competencias`}>
        <button>Volver</button>
      </Link>
    </div>
  );
};

export default PruebasList;