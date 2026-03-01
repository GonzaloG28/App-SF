import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCompetencia } from "../../api/competencias.api";

const CrearCompetencia = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [form, setForm] = useState({
    nombre: "",
    fecha: "",
    piscina: 25
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCompetencia(id, form);
      navigate(`/profesor/nadador/${id}/competencias`);
    } catch (error) {
      console.error(error);
      alert("Error al crear competencia");
    }
  };

  return (
    <div>
      <h2>Crear Competencia</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la competencia"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />
        <select name="piscina" value={form.piscina} onChange={handleChange}>
          <option value={25}>25 metros</option>
          <option value={50}>50 metros</option>
        </select>
        <button type="submit">Crear</button>
      </form>
      <button onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
};

export default CrearCompetencia;
