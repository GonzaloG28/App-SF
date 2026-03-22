import mongoose from "mongoose"

const EntrenamientoSchema = new mongoose.Schema({
  titulo:          { type: String, required: true },
  tipo:            { type: String, enum: ["texto", "archivo", "link"], default: "texto" },
  contenido:       { type: String },
  archivoUrl:      { type: String },
  archivoPublicId: { type: String },
  notasProfesor:   { type: String },
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  destinatarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Nadador" }],
  completadoPor: [{
    nadador:         { type: mongoose.Schema.Types.ObjectId, ref: "Nadador" },
    fechaCompletado: { type: Date, default: Date.now }
  }],
  fecha: { type: Date, default: Date.now }
})

// destinatarios → getMisEntrenamientos hace find({ destinatarios: miPerfil._id })
// profesor      → getReporteProfesor hace find({ profesor: profesorId })
EntrenamientoSchema.index({ destinatarios: 1, fecha: -1 })
EntrenamientoSchema.index({ profesor: 1,      fecha: -1 })

export default mongoose.model("Entrenamiento", EntrenamientoSchema)