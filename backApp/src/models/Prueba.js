import mongoose from "mongoose"
const pruebaSchema = new mongoose.Schema({
  competencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competencia",
    required: true
  },
  estilo:         { type: String, required: true },
  distancia:      { type: Number, required: true },
  tiempo:         { type: String, required: true },
  tiempoNumerico: { type: Number, required: true },
  fecha:          { type: Date,   required: true },
  parciales: [{ nroParcial: Number, tiempo: String }]
}, { timestamps: true })

// competencia → listarPruebasPorCompetencia hace find({ competencia })
// estilo+distancia → rankingIndividual filtra por ambos
pruebaSchema.index({ competencia: 1, tiempoNumerico: 1 })
pruebaSchema.index({ competencia: 1, estilo: 1, distancia: 1 })

export default mongoose.model("Prueba", pruebaSchema)