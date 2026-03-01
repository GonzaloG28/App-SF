import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPrueba } from "../../api/pruebas.api";

const CrearPrueba = () => {
  const { competenciaId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    estilo: "",
    distancia: 50,
    tiempo: "",
    parciales: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPrueba(competenciaId, form);
      navigate(`/profesor/competencias/${competenciaId}/pruebas`);
    } catch (error) {
      console.error(error);
      alert("Error al crear prueba");
    }
  };

  return (
    <div>
      <h2>Crear Prueba</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="estilo"
          placeholder="Estilo (Libre, Espalda...)"
          value={form.estilo}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="distancia"
          placeholder="Distancia en metros"
          value={form.distancia}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="tiempo"
          placeholder='Tiempo (ej: 1:05.3 o 45.2)'
          value={form.tiempo}
          onChange={handleChange}
          required
        />
        <textarea
          name="parciales"
          placeholder="Parciales (opcional)"
          value={form.parciales}
          onChange={handleChange}
        />
        <button type="submit">Crear</button>
      </form>
      <button onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
};

export default CrearPrueba;