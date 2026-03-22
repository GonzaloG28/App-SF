import Competencia from "../models/Competencia.js"
import Nadador from "../models/Nadadores.js"
import { crearNotificacion } from "./notificacion.controller.js"

export const crearCompetencia = async (req, res) => {
  try {
    const { nadadorId } = req.params
    const { nombre, fecha, piscina } = req.body

    if (![25, 50].includes(Number(piscina))) {
      return res.status(400).json({ message: "La piscina debe ser 25 o 50" })
    }

    const nadador = await Nadador.findById(nadadorId)
    if (!nadador) {
      return res.status(404).json({ message: "Nadador no encontrado" })
    }

    const año = new Date(fecha).getFullYear()

    const nuevaCompetencia = new Competencia({
      nadador: nadadorId,
      nombre,
      fecha,
      año,
      piscina: Number(piscina)
    })

    await nuevaCompetencia.save()

    // NOTIFICACIÓN AL NADADOR: nueva competencia registrada
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit", month: "long", year: "numeric"
    })

    await crearNotificacion({
      destinatario: nadador.user, // User._id del nadador
      tipo:         "competencia_creada",
      titulo:       "Nueva competencia registrada",
      mensaje:      `Se registró "${nombre}" el ${fechaFormateada} — Piscina ${piscina}m`,
      metadata: {
        fecha:   new Date(fecha),
        entidad: nombre
      }
    })

    res.status(201).json(nuevaCompetencia)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: error.message, ...(isDev && { error: error.message }) })
  }
}

export const listarCompetenciasPorNadador = async (req, res) => {
  try {
    const { nadadorId } = req.params

    const competencias = await Competencia.find({ nadador: nadadorId })
      .sort({ año: -1, fecha: -1 })

    res.json(competencias)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: error.message, ...(isDev && { error: error.message }) })
  }
}
