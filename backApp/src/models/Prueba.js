import mongoose from "mongoose";

const pruebaSchema = new mongoose.Schema({
  competencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competencia",
    required: true
  },
  estilo: { type: String, required: true },
  distancia: { type: Number, required: true },
  tiempo: { type: String, required: true },
  // AGREGAMOS ESTO:
  tiempoNumerico: { type: Number, required: true }, 
  fecha: { type: Date, required: true },
  parciales: [
    {
      nroParcial: Number,
      tiempo: String
    }
  ]
}, { timestamps: true });

export default mongoose.model("Prueba", pruebaSchema);