import Prueba from "../models/Prueba.js";
import Competencia from "../models/Competencia.js";

// Convertir tiempo tipo 4"32.5 a número
const convertirTiempoANumero = (tiempo) => {
  if (!tiempo) return 0;

  const tiempoLimpio = tiempo.trim();

  if (tiempoLimpio.includes(":")) {
    const [minStr, segStr] = tiempoLimpio.split(":");

    const minutos = Number(minStr);
    const segundos = Number(segStr);

    if (isNaN(minutos) || isNaN(segundos)) {
      throw new Error("Formato de tiempo inválido");
    }

    return minutos * 60 + segundos;
  }

  const soloSegundos = Number(tiempoLimpio);

  if (isNaN(soloSegundos)) {
    throw new Error("Formato de tiempo inválido");
  }

  return soloSegundos;
};

export const crearPrueba = async (req, res) => {
  try {
    const { competenciaId } = req.params;
    const { estilo, distancia, tiempo, parciales } = req.body;

    const competencia = await Competencia.findById(competenciaId);
    if (!competencia) {
      return res.status(404).json({ message: "Competencia no encontrada" });
    }

    const tiempoNumerico = convertirTiempoANumero(tiempo);

    const nuevaPrueba = new Prueba({
      competencia: competenciaId,
      estilo,
      distancia,
      tiempo,
      tiempoNumerico,
      parciales
    });

    await nuevaPrueba.save();

    res.status(201).json(nuevaPrueba);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const listarPruebasPorCompetencia = async (req, res) => {
  try {
    const { competenciaId } = req.params;

    const pruebas = await Prueba.find({ competencia: competenciaId })
      .sort({ tiempoNumerico: 1 }); // menor tiempo primero

    res.json(pruebas);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const obtenerPruebasDisponibles = async (req, res) => {
  try {
    const { nadadorId } = req.params;

    const competencias = await Competencia.find({ nadador: nadadorId });
    const competenciaIds = competencias.map(c => c._id);

    const pruebas = await Prueba.aggregate([
      {
        $match: {
          competencia: { $in: competenciaIds }
        }
      },
      {
        $group: {
          _id: {
            estilo: "$estilo",
            distancia: "$distancia"
          }
        }
      }
    ]);

    res.json(pruebas);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rankingIndividual = async (req, res) => {
  try {
    const { nadadorId } = req.params;
    const { estilo, distancia, orden, piscina } = req.query;

    if (!estilo || !distancia) {
      return res.status(400).json({
        message: "Debes enviar estilo y distancia"
      });
    }

    const competencias = await Competencia.find({
        nadador: nadadorId,
        ...(piscina && { piscina: Number(piscina) })
    });

    const competenciaIds = competencias.map(c => c._id);

    const pruebas = await Prueba.find({
      competencia: { $in: competenciaIds },
      estilo,
      distancia: Number(distancia)
    })
      .populate("competencia", "nombre fecha año")
      .sort({
        tiempoNumerico: orden === "desc" ? -1 : 1
      });

    if (pruebas.length === 0) {
      return res.json([]);
    }

    if (competenciaIds.length === 0) {
        return res.json([]);
    }

    // Detectar mejor tiempo absoluto
    const mejorTiempo = Math.min(...pruebas.map(p => p.tiempoNumerico));

    // Agregar campo esRecordPersonal
    const pruebasConRecord = pruebas.map(prueba => ({
      ...prueba.toObject(),
      esRecordPersonal: prueba.tiempoNumerico === mejorTiempo
    }));

    res.json(pruebasConRecord);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};