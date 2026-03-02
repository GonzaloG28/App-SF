import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPruebasPorCompetencia } from "../../api/pruebas.api";

const PruebasList = () => {
  const { id } = useParams();
  const [pruebas, setPruebas] = useState([]);
  const [nadadorId, setNadadorId] = useState([])

  const fetchPruebas = async () => {
  const res = await getPruebasPorCompetencia(id);
  setPruebas(res.data.pruebas);
  setNadadorId(res.data.nadadorId);
};

  useEffect(() => {
    fetchPruebas();
  }, [id]);

  return (
    <div>
      <h2>Pruebas</h2>
      <Link to={`/profesor/competencia/${id}/pruebas/nuevo`}>
        <button>Agregar Prueba</button>
      </Link>

      <ul>
        {pruebas.map((p) => (
          <li key={p._id}>
            {p.distancia}m {p.estilo} - Tiempo: {p.tiempo}
          </li>
        ))}
      </ul>

      <Link to={`/profesor/nadador/${nadadorId}/competencias`}>
        <button>Volver</button>
      </Link>
    </div>
  );
};

export default PruebasList;