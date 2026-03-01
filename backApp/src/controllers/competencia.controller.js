import Competencia from "../models/Competencia.js";
import Nadador from "../models/Nadadores.js";

export const crearCompetencia = async (req, res) => {
  try {
    const { nadadorId } = req.params;
    const { nombre, fecha, piscina } = req.body;

    // Validar piscina
    if (![25, 50].includes(Number(piscina))) {
      return res.status(400).json({
        message: "La piscina debe ser 25 o 50"
      });
    }

    // Verificar que exista el nadador
    const nadador = await Nadador.findById(nadadorId);
    if (!nadador) {
      return res.status(404).json({ message: "Nadador no encontrado" });
    }

    const año = new Date(fecha).getFullYear();

    const nuevaCompetencia = new Competencia({
      nadador: nadadorId,
      nombre,
      fecha,
      año,
      piscina: Number(piscina)
    });

    await nuevaCompetencia.save();

    res.status(201).json(nuevaCompetencia);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const listarCompetenciasPorNadador = async (req, res) => {
  try {
    const { nadadorId } = req.params;

    const competencias = await Competencia.find({ nadador: nadadorId })
      .sort({ año: -1, fecha: -1 });

    res.json(competencias);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};