import mongoose from "mongoose"

const mensajeSchema = new mongoose.Schema({
  emisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true 
  },
  receptor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true 
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  leido: {
    type: Boolean,
    default: false,
    index: true
  }
}, { 
  timestamps: true,
  versionKey: false 
})

//Limpieza cada 60 dias
mensajeSchema.index({ createdAt: 1 }, { expires: 5184000 });

mensajeSchema.index({ emisor: 1, receptor: 1, createdAt: -1 });
mensajeSchema.index({ receptor: 1, emisor: 1, createdAt: -1 });

export default mongoose.model("Mensaje", mensajeSchema)