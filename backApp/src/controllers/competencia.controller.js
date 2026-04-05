import Competencia from "../models/Competencia.js"
import Nadador from "../models/Nadadores.js"
import { crearNotificacion } from "./notificacion.controller.js"

//crear competencia
export const crearCompetencia = async (req, res) => {
  try {
    const { nadadorId } = req.params
    const { nombre, fecha, piscina } = req.body

    // 🟢 OPTIMIZACIÓN: Validación rápida antes de tocar la DB
    const numPiscina = Number(piscina);
    if (![25, 50].includes(numPiscina)) {
      return res.status(400).json({ message: "La piscina debe ser 25 o 50" })
    }

    // 🟢 RAM: Solo pedimos el campo 'user' que necesitamos para la notificación
    const nadador = await Nadador.findById(nadadorId).select("user").lean();
    if (!nadador) return res.status(404).json({ message: "Nadador no encontrado" })

    // 🟢 ESPACIO DB: Eliminamos el campo 'año' si el modelo lo permite, 
    // ya que se puede calcular o indexar desde 'fecha'.
    const nuevaCompetencia = await Competencia.create({
      nadador: nadadorId,
      nombre: nombre.trim(),
      fecha,
      piscina: numPiscina
    })

    // 🟢 PERFORMANCE: Notificación sin 'await' para responder rápido al cliente
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric"
    })

    res.status(201).json(nuevaCompetencia)


    crearNotificacion({
      destinatario: nadador.user,
      tipo: "competencia_creada",
      titulo: "Nueva competencia",
      mensaje: `${nombre.slice(0, 30)} - ${fechaFormateada} (${numPiscina}m)`,
      metadata: { entidad: nuevaCompetencia._id }
    }).catch(err => console.error("Error notificación:", err));

  } catch (error) {
    res.status(500).json({ message: "Error al registrar competencia", error })
  }
}

//filtrar competencia por nadador
export const listarCompetenciasPorNadador = async (req, res) => {
  try {
    const { nadadorId } = req.params

    // 🟢 RAM & VELOCIDAD: .lean() es crítico aquí porque estas listas crecen mucho
    const competencias = await Competencia.find({ nadador: nadadorId })
      .sort({ fecha: -1 }) // Ordenamos por fecha directamente
      .select("-__v")      // Ahorramos unos bytes quitando el campo de versión de Mongoose
      .lean();

    res.json(competencias)

  } catch (error) {
    res.status(500).json({ message: "Error al obtener historial" })
  }
}