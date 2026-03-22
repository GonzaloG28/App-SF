import mongoose from "mongoose"

const competenciaSchema = new mongoose.Schema({
  nadador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nadador",   // FIX previo: era ref:"User"
    required: true
  },
  nombre:  { type: String, required: true },
  fecha:   { type: Date,   required: true },
  año:     { type: Number, required: true },
  piscina: { type: Number, enum: [25, 50], required: true }
}, { timestamps: true })

// nadador → listarCompetenciasPorNadador hace find({ nadador }) en cada vista
competenciaSchema.index({ nadador: 1, fecha: -1 })

export default mongoose.model("Competencia", competenciaSchema)