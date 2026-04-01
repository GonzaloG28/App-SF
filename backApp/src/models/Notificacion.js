import mongoose from "mongoose"

const notificacionSchema = new mongoose.Schema({
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tipo: {
    type: String,
    enum: [
      // Entrenamientos
      "entrenamiento_asignado",
      "entrenamiento_completado",
      // Competencias y convocatorias
      "competencia_creada",
      "convocatoria_publicada",  // nadador convocado
      "convocatoria_admin",      // admin: nueva convocatoria creada
      // Marcas
      "marca_subida",
      // Mensajes
      "mensaje_recibido",
      // Nuevos nadadores (para admin)
      "nadador_creado",
    ],
    required: true
  },
  titulo:  { type: String, required: true },
  mensaje: { type: String, required: true },
  metadata: {
    fecha:         Date,
    entidad:       mongoose.Schema.Types.ObjectId,
    nadadorNombre: String,
  },
  leida: { type: Boolean, default: false }
}, { timestamps: true })

notificacionSchema.index({ destinatario: 1, leida: 1, createdAt: -1 })

export default mongoose.model("Notificacion", notificacionSchema)