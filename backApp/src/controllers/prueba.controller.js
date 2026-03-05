import Prueba from "../models/Prueba.js";
import Competencia from "../models/Competencia.js";

// Convertir tiempo tipo 4"32.5 a número
const convertirTiempoANumero = (tiempo) => {
  if (!tiempo) return 0;

  // Limpiamos espacios y cambiamos comas por puntos por si acaso
  const tiempoLimpio = tiempo.toString().trim().replace(",", ".");

  let totalSegundos = 0;

  if (tiempoLimpio.includes(":")) {
    // Formato 1:05.32
    const [minutos, resto] = tiempoLimpio.split(":");
    totalSegundos = Number(minutos) * 60 + Number(resto);
  } else {
    // Formato 28.45
    totalSegundos = Number(tiempoLimpio);
  }

  if (isNaN(totalSegundos)) {
    console.error("Fallo al convertir tiempo:", tiempoLimpio);
    throw new Error("Formato de tiempo inválido. Use 1:05.32 o 28.45");
  }

  return totalSegundos;
};



export const crearPrueba = async (req, res) => {
  try {
    const { competenciaId } = req.params;
    // ERROR AQUÍ: Faltaba extraer 'fecha' del body
    const { estilo, distancia, tiempo, parciales, fecha } = req.body; 

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
      tiempoNumerico, // Ahora sí se guardará en el modelo
      parciales,
      fecha // Ahora sí está definida porque la extrajimos del body
    });

    const pruebaGuardada = await nuevaPrueba.save();

    // VITAL: Si tu modelo de Competencia tiene un array de pruebas, hay que pushearla
    await Competencia.findByIdAndUpdate(competenciaId, {
      $push: { pruebas: pruebaGuardada._id }
    });

    res.status(201).json(pruebaGuardada);

  } catch (error) {
    console.error("Error en crearPrueba:", error); // Para que veas el error real en tu consola
    res.status(500).json({ message: error.message });
  }
};


export const listarPruebasPorCompetencia = async (req, res) => {
  try {
    const { competenciaId } = req.params;

    const competencia = await Competencia.findById(competenciaId);

    if (!competencia) {
      return res.status(404).json({ message: "Competencia no encontrada" });
    }

    const pruebas = await Prueba.find({ competencia: competenciaId })
      .sort({ tiempoNumerico: 1 });

    res.json({
      pruebas,
      nadadorId: competencia.nadador
    });
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

export const eliminarPrueba = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscar y eliminar la prueba por su ID
    const pruebaEliminada = await Prueba.findByIdAndDelete(id);

    if (!pruebaEliminada) {
      return res.status(404).json({ message: "Prueba no encontrada" });
    }

    // 2. Limpiar la referencia en la Competencia (Altamente recomendado)
    // Asumiendo que tu modelo 'Prueba' guarda el ID de la 'competencia'
    // y tu modelo 'Competencia' tiene un array [{ type: ObjectId, ref: 'Prueba' }]
    if (pruebaEliminada.competencia) {
      await Competencia.findByIdAndUpdate(
        pruebaEliminada.competencia,
        { $pull: { pruebas: id } }, // $pull saca el ID del array
        { new: true }
      );
    }

    res.status(200).json({ 
      message: "Prueba eliminada exitosamente",
      pruebaId: id 
    });

  } catch (error) {
    console.error("Error al eliminar la prueba:", error);
    res.status(500).json({ 
      message: "Error en el servidor al intentar eliminar la prueba",
      error: error.message 
    });
  }
};