import { Convocatoria } from "../models/Convocatoria.js"
import Nadador from "../models/Nadadores.js"
import { crearNotificacion } from "./notificacion.controller.js"


export const crearConvocatoria = async (req, res) => {
  try {
    const { nombre, descripcion, lugar, fechaInicio, fechaFin, nadadores } = req.body

    // 1. Validaciones iniciales
    if (!nombre || !lugar || !fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "Faltan campos requeridos" })
    }

    // 2. Crear la convocatoria primero
    const nueva = await Convocatoria.create({
      nombre, descripcion: descripcion || "", lugar,
      fechaInicio, fechaFin,
      nadadores: nadadores || [],
      creadoPor: req.user._id
    })

    // 3. Notificaciones (en paralelo para evitar timeout)
    // Ejecutamos esto sin bloquear la respuesta principal si es necesario, 
    // o usamos Promise.all para que sea rápido.
    const enviarNotificaciones = async () => {
      try {
        // Notificaciones a nadadores
        const promesasNadadores = (nadadores || []).map(async (id) => {
          const n = await Nadador.findById(id).populate("user", "_id nombre")
          if (n?.user?._id) {
            return crearNotificacion({
              destinatario: n.user._id,
              tipo: "convocatoria_publicada",
              titulo: "Fuiste convocado",
              mensaje: `Has sido convocado para "${nombre}" en ${lugar}`,
              metadata: { entidad: nueva._id, nadadorNombre: n.user.nombre }
            })
          }
        })

        // Notificaciones a admins
        const admins = await User.find({ rol: "admin" }).select("_id")
        const promesasAdmins = admins.map(admin => 
          crearNotificacion({
            destinatario: admin._id,
            tipo: "convocatoria_admin",
            titulo: "Nueva convocatoria publicada",
            mensaje: `${req.user.nombre} publicó la convocatoria "${nombre}"`,
            metadata: { entidad: nueva._id }
          })
        )

        await Promise.all([...promesasNadadores, ...promesasAdmins])
      } catch (err) {
        console.error("Error enviando notificaciones:", err)
      }
    }

    // Ejecutar notificaciones
    enviarNotificaciones() 

    // 4. RESPUESTA INMEDIATA para evitar que el profesor clickee de nuevo
    return res.status(201).json(nueva)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al crear convocatoria", ...(isDev && { error: error.message }) })
  }
}

// Lista convocatorias — solo las que no han terminado (fechaFin >= hoy)
export const getConvocatorias = async (req, res) => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const convocatorias = await Convocatoria.find({ fechaFin: { $gte: hoy } })
      .populate("creadoPor", "nombre")
      .sort({ fechaInicio: 1 })

    res.json(convocatorias)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener convocatorias", ...(isDev && { error: error.message }) })
  }
}

// Detalle con nadadores + estado de pago
export const getConvocatoriaDetalle = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findById(req.params.id)
      .populate("creadoPor", "nombre")
      .populate({
        path: "nadadores",
        populate: { path: "user", select: "nombre correo" }
      })

    if (!convocatoria) return res.status(404).json({ message: "Convocatoria no encontrada" })
    res.json(convocatoria)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener convocatoria", ...(isDev && { error: error.message }) })
  }
}

// Convocatorias de un nadador específico (para su calendario)
export const getConvocatoriasNadador = async (req, res) => {
  try {
    const nadadorId = req.params.id
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const convocatorias = await Convocatoria.find({
      nadadores: nadadorId,
      fechaFin:  { $gte: hoy }
    }).sort({ fechaInicio: 1 })

    res.json(convocatorias)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error", ...(isDev && { error: error.message }) })
  }
}

// Convocatorias del nadador autenticado
export const getMisConvocatorias = async (req, res) => {
  try {
    const nadador = await Nadador.findOne({ user: req.user._id })
    if (!nadador) return res.status(404).json({ message: "Perfil no encontrado" })

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const convocatorias = await Convocatoria.find({
      nadadores: nadador._id,
      fechaFin:  { $gte: hoy }
    }).sort({ fechaInicio: 1 })

    res.json(convocatorias)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error", ...(isDev && { error: error.message }) })
  }
}

export const actualizarConvocatoria = async (req, res) => {
  try {
    const campos = ["nombre","descripcion","lugar","fechaInicio","fechaFin","nadadores","activa"]
    const datos  = {}
    campos.forEach(c => { if (req.body[c] !== undefined) datos[c] = req.body[c] })
    const actualizada = await Convocatoria.findByIdAndUpdate(req.params.id, datos, { new: true })
    if (!actualizada) return res.status(404).json({ message: "Convocatoria no encontrada" })
    res.json(actualizada)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al actualizar", ...(isDev && { error: error.message }) })
  }
}

export const eliminarConvocatoria = async (req, res) => {
  try {
    await Convocatoria.findByIdAndDelete(req.params.id)
    res.json({ message: "Convocatoria eliminada" })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al eliminar", ...(isDev && { error: error.message }) })
  }
}

// Limpiar convocatorias pasadas (puede llamarse con un cron job o manualmente)
export const limpiarConvocatoriasPasadas = async (req, res) => {
  try {
    const hoy    = new Date()
    const result = await Convocatoria.deleteMany({ fechaFin: { $lt: hoy } })
    res.json({ message: `${result.deletedCount} convocatorias pasadas eliminadas` })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al limpiar", ...(isDev && { error: error.message }) })
  }
}
