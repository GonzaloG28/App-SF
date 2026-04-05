import Notificacion from "../models/Notificacion.js"

// ── HELPER PRIVADO: emitir por socket si el usuario está online ──────
// Se llama DESPUÉS de crearNotificacion cuando el controller tiene req.
// Es opcional — si no se llama, la notificación igual queda en la BD.
export const emitirSocketNotif = (req, notif) => {
  try {
    const io                = req?.app?.get("io")
    const usuariosConectados = req?.app?.get("usuariosConectados")
    if (!io || !usuariosConectados || !notif) return

    const socketId = usuariosConectados[notif.destinatario?.toString()]
    if (socketId) {
      io.to(socketId).emit("nueva_notificacion", notif)
    }
  } catch (err) {
    // Socket falla silenciosamente — no rompe nada
    console.error("[SOCKET_EMIT_ERROR]:", err.message)
  }
}

// ── FUNCIÓN PRINCIPAL: crear notificación en BD ──────────────────────
// Firma: crearNotificacion({ destinatario, tipo, titulo, mensaje, metadata })
// SIN req — firma consistente para todos los controllers.
export const crearNotificacion = async ({
  destinatario,
  tipo,
  titulo,
  mensaje,
  metadata = {},
  // req opcional — si se pasa, emite por socket automáticamente
  req = null
}) => {
  try {
    if (!destinatario || !tipo || !titulo || !mensaje) {
      console.warn("[NOTIF WARN]: Faltan campos requeridos", { destinatario, tipo })
      return null
    }

    const nuevaNotif = await Notificacion.create({
      destinatario,
      tipo,
      titulo,
      mensaje,
      metadata: {
        entidadId:     metadata.entidadId || metadata.entidad || null,
        nadadorNombre: metadata.nadadorNombre || "",
        tipoEntidad:   metadata.tipoEntidad   || ""
      }
    })

    // Emitir por socket si hay req disponible
    if (req) emitirSocketNotif(req, nuevaNotif)

    return nuevaNotif
  } catch (err) {
    // NUNCA romper el flujo principal
    console.error("[NOTIF ERROR]:", err.message)
    return null
  }
}

// GET /api/notificaciones
export const getNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({ destinatario: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-__v")
      .lean()

    res.json(notificaciones)
  } catch (err) {
    res.status(500).json({ message: "Error al obtener notificaciones" })
  }
}

// PATCH /api/notificaciones/marcar-leidas
export const marcarLeidas = async (req, res) => {
  try {
    const result = await Notificacion.updateMany(
      { destinatario: req.user._id, leida: false },
      { $set: { leida: true } }
    )
    res.json({ message: "Marcadas como leídas", modificadas: result.modifiedCount })
  } catch (err) {
    res.status(500).json({ message: "Error al marcar notificaciones" })
  }
}
