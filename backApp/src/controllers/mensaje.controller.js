import Mensaje from "../models/Mensaje.js"
import User    from "../models/User.js"
import Nadador from "../models/Nadadores.js"
import { crearNotificacion } from "./notificacion.controller.js"

// Reglas de mensajería: quién puede hablar con quién
const puedeEnviar = (rolEmisor, rolReceptor) => {
  const permitidos = {
    nadador:  ["profesor", "admin"],
    profesor: ["nadador", "admin"],
    admin:    ["nadador", "profesor", "admin"]  // admin puede con todos
  }
  return permitidos[rolEmisor]?.includes(rolReceptor) ?? false
}

// POST /api/mensajes — enviar mensaje
export const enviarMensaje = async (req, res) => {
  try {
    const { receptorId, contenido } = req.body

    if (!receptorId || !contenido?.trim()) {
      return res.status(400).json({ message: "Receptor y contenido son requeridos" })
    }

    const receptor = await User.findById(receptorId)
    if (!receptor) return res.status(404).json({ message: "Receptor no encontrado" })

    if (!puedeEnviar(req.user.rol, receptor.rol)) {
      return res.status(403).json({
        message: `No puedes enviar mensajes entre ${req.user.rol} y ${receptor.rol}`
      })
    }

    const mensaje = await Mensaje.create({
      emisor:    req.user._id,
      receptor:  receptorId,
      contenido: contenido.trim()
    })

    const emisor = await User.findById(req.user._id).select("nombre").lean()
       await crearNotificacion({
         destinatario: receptorId,
         tipo:         "mensaje_recibido",
         titulo:       "Nuevo mensaje",
         mensaje:      `${emisor?.nombre || "Alguien"}: ${contenido.trim().slice(0, 60)}${contenido.length > 60 ? "..." : ""}`,
         metadata:     { entidad: mensaje._id, nadadorNombre: emisor?.nombre || "" }
       })

    res.status(201).json(mensaje)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al enviar mensaje", ...(isDev && { error: error.message }) })
  }
}

// GET /api/mensajes/conversacion/:userId — historial con un usuario
export const getConversacion = async (req, res) => {
  try {
    const { userId } = req.params
    const miId       = req.user._id

    const mensajes = await Mensaje.find({
      $or: [
        { emisor: miId,   receptor: userId },
        { emisor: userId, receptor: miId   }
      ]
    })
      .populate("emisor",   "nombre rol")
      .populate("receptor", "nombre rol")
      .sort({ createdAt: 1 })
      .limit(200)

    // Marcar como leídos los mensajes que me enviaron
    await Mensaje.updateMany(
      { emisor: userId, receptor: miId, leido: false },
      { leido: true }
    )

    res.json(mensajes)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener conversación", ...(isDev && { error: error.message }) })
  }
}

// GET /api/mensajes/contactos — lista de personas con quienes puedo hablar
export const getContactos = async (req, res) => {
  try {
    const { rol, _id } = req.user

    let rolesPermitidos = []
    if (rol === "nadador")  rolesPermitidos = ["profesor", "admin"]
    if (rol === "profesor") rolesPermitidos = ["nadador",  "admin"]
    if (rol === "admin")    rolesPermitidos = ["nadador",  "profesor", "admin"]

    // Obtener todos los usuarios con esos roles (excepto yo mismo)
    const contactos = await User.find({
      rol: { $in: rolesPermitidos },
      _id: { $ne: _id }
    }).select("nombre correo rol").lean()

    // Para cada contacto calcular mensajes no leídos
    const contactosConNoLeidos = await Promise.all(
      contactos.map(async (c) => {
        const noLeidos = await Mensaje.countDocuments({
          emisor:   c._id,
          receptor: _id,
          leido:    false
        })
        // Último mensaje de la conversación
        const ultimoMensaje = await Mensaje.findOne({
          $or: [
            { emisor: _id, receptor: c._id },
            { emisor: c._id, receptor: _id }
          ]
        }).sort({ createdAt: -1 }).select("contenido createdAt")

        return { ...c, noLeidos, ultimoMensaje }
      })
    )

    // Ordenar: primero los que tienen mensajes recientes
    contactosConNoLeidos.sort((a, b) => {
      const fechaA = a.ultimoMensaje?.createdAt || 0
      const fechaB = b.ultimoMensaje?.createdAt || 0
      return new Date(fechaB) - new Date(fechaA)
    })

    res.json(contactosConNoLeidos)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener contactos", ...(isDev && { error: error.message }) })
  }
}

// GET /api/mensajes/no-leidos — total de mensajes no leídos (para badge)
export const getNoLeidos = async (req, res) => {
  try {
    const cantidad = await Mensaje.countDocuments({
      receptor: req.user._id,
      leido:    false
    })
    res.json({ cantidad })
  } catch (error) {
    res.status(500).json({ message: "Error", cantidad: 0 })
  }
}