import Notificacion from "../models/Notificacion.js"

// GET /api/notificaciones
// Devuelve las notificaciones NO leídas del usuario autenticado.
// El frontend hace polling a este endpoint cada 30 segundos.
export const getNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({
      destinatario: req.user._id,
      leida: false
    })
    .sort({ createdAt: -1 })
    .limit(20) // máximo 20 no leídas — evita payloads grandes

    res.json(notificaciones)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener notificaciones", ...(isDev && { error: error.message }) })
  }
}

// PATCH /api/notificaciones/marcar-leidas
// Se llama cuando el usuario ABRE el panel de notificaciones.
// Marca todas sus notificaciones como leídas de una sola vez.
export const marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.updateMany(
      { destinatario: req.user._id, leida: false },
      { $set: { leida: true } }
    )
    res.json({ message: "Notificaciones marcadas como leídas" })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al marcar notificaciones", ...(isDev && { error: error.message }) })
  }
}

// Función interna — NO es un endpoint.
// La llaman otros controllers cuando ocurre un evento.
// Ejemplo: crearEntrenamiento llama a crearNotificacion() para cada destinatario.
export const crearNotificacion = async ({ destinatario, tipo, titulo, mensaje, metadata }) => {
  try {
    await Notificacion.create({ destinatario, tipo, titulo, mensaje, metadata })
  } catch (error) {
    // No propagamos el error — si falla la notificación, la operación principal
    // (crear entrenamiento, competencia, etc.) no debe verse afectada
    console.error("Error al crear notificación:", error.message)
  }
}
