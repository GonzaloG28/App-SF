import mongoose from "mongoose"

const competenciaSchema = new mongoose.Schema({
  nadador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nadador", 
    required: true
  },
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  fecha: { 
    type: Date, 
    required: true 
  },
  piscina: { 
    type: Number, 
    enum: [25, 50], 
    required: true 
  }
}, { 
  timestamps: true,
  versionKey: false 
})

competenciaSchema.index({ nadador: 1, fecha: -1 })

export default mongoose.model("Competencia", competenciaSchema)