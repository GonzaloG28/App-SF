import mongoose from "mongoose";

const convocatoriaSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: "" },
  lugar:       { type: String, required: true },
  fechaInicio: { type: Date,   required: true },
  fechaFin:    { type: Date,   required: true },
  // Nadadores convocados (solo competitivos)
  nadadores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nadador"
  }],
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  activa: { type: Boolean, default: true }
}, { timestamps: true })

convocatoriaSchema.index({ fechaFin: 1 })          // para filtrar pasadas
convocatoriaSchema.index({ nadadores: 1 })          // para buscar por nadador
convocatoriaSchema.index({ creadoPor: 1 })

export const Convocatoria = mongoose.model("Convocatoria", convocatoriaSchema)