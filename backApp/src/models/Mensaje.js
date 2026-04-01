import mongoose from "mongoose"

const mensajeSchema = new mongoose.Schema({
  emisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receptor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  leido: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

// Índices para buscar conversaciones rápidamente
mensajeSchema.index({ emisor: 1, receptor: 1, createdAt: -1 })
mensajeSchema.index({ receptor: 1, leido: 1 })

export default mongoose.model("Mensaje", mensajeSchema)