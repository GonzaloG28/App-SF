import mongoose from "mongoose"

const notificacionSchema = new mongoose.Schema({
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true 
  },
  tipo: {
    type: String,
    enum: [
      "entrenamiento_asignado",
      "entrenamiento_completado",
      "competencia_creada",
      "convocatoria_publicada",
      "convocatoria_admin",
      "marca_subida",
      "mensaje_recibido",
      "nadador_creado",
      "perfil_actualizado"
    ],
    required: true,
    index: true
  },
  titulo: { type: String, required: true, trim: true },
  mensaje: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now },
  metadata: {
    entidadId: { type: mongoose.Schema.Types.ObjectId }, 
    nadadorNombre: String,
    tipoEntidad: String 
  },
  
  leida: { 
    type: Boolean, 
    default: false,
    index: true 
  }
}, { 
  timestamps: true,
  versionKey: false 
})


notificacionSchema.index({ createdAt: 1 }, { expires: 432000 });

notificacionSchema.index({ destinatario: 1, leida: 1, createdAt: -1 });

export default mongoose.model("Notificacion", notificacionSchema)