import mongoose from "mongoose";

const pruebaSchema = new mongoose.Schema({

  competencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competencia",
    required: true
  },

  estilo: {
    type: String,
    required: true
  },

  distancia: {
    type: Number,
    required: true
  },

  tiempo: {
    type: String,
    required: true
  },

  tiempoNumerico: {
    type: Number,
    required: true
  },

  parciales: {
    type: String
  }

}, { timestamps: true });

export default mongoose.model("Prueba", pruebaSchema);