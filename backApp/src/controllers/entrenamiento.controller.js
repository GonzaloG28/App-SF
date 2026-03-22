import Entrenamiento from "../models/Entrenamiento.js"
import Nadador from "../models/Nadadores.js"
import { uploadToCloudinary } from "../middleware/multerMiddleware.js"
import { v2 as cloudinary } from "cloudinary"
import { crearNotificacion } from "./notificacion.controller.js"

export const crearEntrenamiento = async (req, res) => {
  try {
    const { titulo, tipo, contenido, notas, destinatarios } = req.body

    let archivoUrl = null
    let archivoPublicId = null

    if (req.file) {
      const resultado = await uploadToCloudinary(req.file)
      archivoUrl = resultado.url
      archivoPublicId = resultado.publicId
    }

    const listaDestinatarios = typeof destinatarios === "string"
      ? JSON.parse(destinatarios)
      : destinatarios

    const nuevoEntrenamiento = new Entrenamiento({
      titulo,
      tipo,
      contenido,
      notasProfesor: notas,
      destinatarios: listaDestinatarios,
      profesor: req.user._id,
      archivoUrl,
      archivoPublicId
    })

    await nuevoEntrenamiento.save()

    // NOTIFICACIONES: buscar el User._id de cada nadador destinatario
    // para enviarles la notificación correctamente
    const nadadores = await Nadador.find({
      _id: { $in: listaDestinatarios }
    }).select("user")

    const fechaHoy = new Date()

    // Crear una notificación para cada nadador destinatario
    await Promise.all(
      nadadores.map(nadador =>
        crearNotificacion({
          destinatario: nadador.user, // User._id, no Nadador._id
          tipo:         "entrenamiento_asignado",
          titulo:       "Nuevo entrenamiento asignado",
          mensaje:      `Tienes un nuevo entrenamiento: "${titulo}"`,
          metadata: {
            fecha:   fechaHoy,
            entidad: titulo
          }
        })
      )
    )

    res.status(201).json({ message: "Entrenamiento enviado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al crear entrenamiento", ...(isDev && { error: error.message }) })
  }
}

export const getMisEntrenamientos = async (req, res) => {
  try {
    const miPerfil = await Nadador.findOne({ user: req.user._id })
    if (!miPerfil) {
      return res.status(404).json({ message: "Perfil de nadador no encontrado" })
    }

    const entrenamientos = await Entrenamiento.find({
      destinatarios: miPerfil._id
    }).sort({ fecha: -1 }).lean()

    const entrenamientosConEstado = entrenamientos.map(ent => ({
      ...ent,
      completado: ent.completadoPor?.some(
        c => c.nadador?.toString() === miPerfil._id.toString()
      ) || false
    }))

    res.json(entrenamientosConEstado)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener entrenamientos", ...(isDev && { error: error.message }) })
  }
}

export const completarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params
    const miPerfil = await Nadador.findOne({ user: req.user._id })

    if (!miPerfil) {
      return res.status(404).json({ message: "Perfil de nadador no encontrado" })
    }

    const yaCompletado = await Entrenamiento.findOne({
      _id: id,
      "completadoPor.nadador": miPerfil._id
    })

    if (yaCompletado) {
      return res.status(400).json({ message: "Ya habías marcado este entrenamiento como completado" })
    }

    const entrenamiento = await Entrenamiento.findByIdAndUpdate(
      id,
      { $push: { completadoPor: { nadador: miPerfil._id, fechaCompletado: new Date() } } },
      { new: true }
    )

    // NOTIFICACIÓN AL PROFESOR: avisarle que un nadador completó el entrenamiento
    await crearNotificacion({
      destinatario: entrenamiento.profesor, // User._id del profesor
      tipo:         "entrenamiento_completado",
      titulo:       "Entrenamiento completado",
      mensaje:      `${miPerfil.apellido || "Un atleta"} completó "${entrenamiento.titulo}"`,
      metadata: {
        fecha:         new Date(),
        entidad:       entrenamiento.titulo,
        nadadorNombre: miPerfil.apellido || ""
      }
    })

    res.json({ message: "¡Entrenamiento completado! Buen trabajo." })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al marcar como completado", ...(isDev && { error: error.message }) })
  }
}

export const getReporteProfesor = async (req, res) => {
  try {
    const profesorId = req.user._id

    const entrenamientos = await Entrenamiento.find({ profesor: profesorId })
      .populate({
        path: "completadoPor.nadador",
        model: "Nadador",
        populate: { path: "user", model: "User", select: "nombre" }
      })
      .sort({ fecha: -1 })
      .lean()

    const reporte = entrenamientos.map(ent => ({
      _id:      ent._id,
      titulo:   ent.titulo,
      fecha:    ent.fecha,
      completados:  ent.completadoPor?.length || 0,
      totalAlumnos: ent.destinatarios?.length || 0,
      detallesCompletados: ent.completadoPor?.map(c => ({
        nombre: c.nadador?.user?.nombre
          ? `${c.nadador.user.nombre} ${c.nadador.apellido || ""}`
          : "Atleta Desconocido",
        hora: c.fechaCompletado
      })) || []
    }))

    res.json(reporte)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener reporte", ...(isDev && { error: error.message }) })
  }
}

export const eliminarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params
    const profesorId = req.user._id

    const entrenamiento = await Entrenamiento.findOne({ _id: id, profesor: profesorId })
    if (!entrenamiento) {
      return res.status(404).json({ message: "Entrenamiento no encontrado o no tienes permiso" })
    }

    if (entrenamiento.archivoPublicId) {
      try {
        await cloudinary.uploader.destroy(entrenamiento.archivoPublicId)
      } catch (cloudError) {
        console.error("Error al borrar en Cloudinary:", cloudError.message)
      }
    }

    await Entrenamiento.findByIdAndDelete(id)
    res.json({ message: "Entrenamiento eliminado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al eliminar el entrenamiento", ...(isDev && { error: error.message }) })
  }
}
