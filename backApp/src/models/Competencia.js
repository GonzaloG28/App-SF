import mongoose from "mongoose"

const competenciaSchema = new mongoose.Schema({
  // FIX: antes era ref: "User" — esto hacía que populate devolviera
  // un documento User en lugar del Nadador, rompiendo consultas relacionadas.
  nadador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nadador",  
    required: true
  },
  nombre: { type: String, required: true },
  fecha:  { type: Date,   required: true },
  año:    { type: Number, required: true },
  piscina: {
    type: Number,
    enum: [25, 50],
    required: true
  }
}, { timestamps: true })

export const Competencia = mongoose.model("Competencia", competenciaSchema)