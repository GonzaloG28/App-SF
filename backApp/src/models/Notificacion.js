import mongoose from "mongoose"

const notificacionSchema = new mongoose.Schema({
  // Usuario que RECIBE la notificación
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tipo: {
    type: String,
    enum: [
      "entrenamiento_asignado",   // nadador recibe nuevo entrenamiento
      "entrenamiento_completado", // profesor: nadador completó entrenamiento
      "competencia_creada",       // nadador: nueva competencia
      "marca_subida",             // nadador: nueva prueba/marca registrada
    ],
    required: true
  },

  titulo:  { type: String, required: true },
  mensaje: { type: String, required: true },

  // Datos extra para mostrar en la notificación (fecha del evento, etc.)
  metadata: {
    fecha:         { type: Date },
    entidad:       { type: String }, // nombre del entrenamiento, competencia, etc.
    nadadorNombre: { type: String }, // para notificaciones del profesor
  },

  leida: { type: Boolean, default: false },

}, { timestamps: true })

// Índices para las queries más frecuentes
// destinatario + leida → getNotificaciones filtra por ambos en cada poll
notificacionSchema.index({ destinatario: 1, leida: 1, createdAt: -1 })

export default mongoose.model("Notificacion", notificacionSchema)
