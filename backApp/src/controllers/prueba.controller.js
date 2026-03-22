import Prueba from "../models/Prueba.js"
import Competencia from "../models/Competencia.js"
import Nadador from "../models/Nadadores.js"
import { crearNotificacion } from "./notificacion.controller.js"

const convertirTiempoANumero = (tiempo) => {
  if (!tiempo) return 0
  const tiempoLimpio = tiempo.toString().trim().replace(",", ".")
  let totalSegundos = 0

  if (tiempoLimpio.includes(":")) {
    const [minutos, resto] = tiempoLimpio.split(":")
    totalSegundos = Number(minutos) * 60 + Number(resto)
  } else {
    totalSegundos = Number(tiempoLimpio)
  }

  if (isNaN(totalSegundos)) throw new Error("Formato de tiempo inválido. Use 1:05.32 o 28.45")
  return totalSegundos
}

export const crearPrueba = async (req, res) => {
  try {
    const { competenciaId } = req.params
    const { estilo, distancia, tiempo, parciales, fecha } = req.body

    const competencia = await Competencia.findById(competenciaId)
    if (!competencia) {
      return res.status(404).json({ message: "Competencia no encontrada" })
    }

    const tiempoNumerico = convertirTiempoANumero(tiempo)

    const nuevaPrueba = new Prueba({
      competencia: competenciaId,
      estilo,
      distancia,
      tiempo,
      tiempoNumerico,
      parciales,
      fecha
    })

    const pruebaGuardada = await nuevaPrueba.save()

    await Competencia.findByIdAndUpdate(competenciaId, {
      $push: { pruebas: pruebaGuardada._id }
    })

    // NOTIFICACIÓN AL NADADOR: nueva marca registrada
    // La competencia tiene el nadadorId (Nadador._id), necesitamos el User._id
    const nadador = await Nadador.findById(competencia.nadador).select("user apellido")

    if (nadador) {
      const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit", month: "long", year: "numeric"
      })

      await crearNotificacion({
        destinatario: nadador.user, // User._id
        tipo:         "marca_subida",
        titulo:       "Nueva marca registrada",
        mensaje:      `${distancia}m ${estilo} — ${tiempo} el ${fechaFormateada} en "${competencia.nombre}"`,
        metadata: {
          fecha:   new Date(fecha),
          entidad: competencia.nombre
        }
      })
    }

    res.status(201).json(pruebaGuardada)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: error.message, ...(isDev && { error: error.message }) })
  }
}

export const listarPruebasPorCompetencia = async (req, res) => {
  try {
    const { competenciaId } = req.params
    const competencia = await Competencia.findById(competenciaId)
    if (!competencia) {
      return res.status(404).json({ message: "Competencia no encontrada" })
    }

    const pruebas = await Prueba.find({ competencia: competenciaId })
      .sort({ tiempoNumerico: 1 })

    res.json({ pruebas, nadadorId: competencia.nadador })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: error.message, ...(isDev && { error: error.message }) })
  }
}

export const obtenerPruebasDisponibles = async (req, res) => {
  try {
    const { nadadorId } = req.params
    const competencias = await Competencia.find({ nadador: nadadorId })
    const competenciaIds = competencias.map(c => c._id)

    const pruebas = await Prueba.aggregate([
      { $match: { competencia: { $in: competenciaIds } } },
      { $group: { _id: { estilo: "$estilo", distancia: "$distancia" } } }
    ])

    res.json(pruebas)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: error.message, ...(isDev && { error: error.message }) })
  }
}

export const rankingIndividual = async (req, res) => {
  try {
    const { nadadorId } = req.params
    const { estilo, distancia, orden, piscina } = req.query

    if (!estilo || !distancia) {
      return res.status(400).json({ message: "Debes enviar estilo y distancia" })
    }

    const competencias = await Competencia.find({
      nadador: nadadorId,
      ...(piscina && { piscina: Number(piscina) })
    })

    const competenciaIds = competencias.map(c => c._id)
    if (competenciaIds.length === 0) return res.json([])

    const pruebas = await Prueba.find({
      competencia: { $in: competenciaIds },
      estilo,
      distancia: Number(distancia)
    })
      .populate("competencia", "nombre fecha año")
      .sort({ tiempoNumerico: orden === "desc" ? -1 : 1 })

    if (pruebas.length === 0) return res.json([])

    const mejorTiempo = Math.min(...pruebas.map(p => p.tiempoNumerico))
    const pruebasConRecord = pruebas.map(prueba => ({
      ...prueba.toObject(),
      esRecordPersonal: prueba.tiempoNumerico === mejorTiempo
    }))

    res.json(pruebasConRecord)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: error.message, ...(isDev && { error: error.message }) })
  }
}

export const eliminarPrueba = async (req, res) => {
  try {
    const { id } = req.params
    const pruebaEliminada = await Prueba.findByIdAndDelete(id)

    if (!pruebaEliminada) {
      return res.status(404).json({ message: "Prueba no encontrada" })
    }

    if (pruebaEliminada.competencia) {
      await Competencia.findByIdAndUpdate(
        pruebaEliminada.competencia,
        { $pull: { pruebas: id } }
      )
    }

    res.status(200).json({ message: "Prueba eliminada exitosamente", pruebaId: id })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al eliminar la prueba", ...(isDev && { error: error.message }) })
  }
}
