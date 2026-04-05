import mongoose from "mongoose"

const pruebaSchema = new mongoose.Schema({
  competencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competencia",
    required: true,
    index: true 
  },
  estilo: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true
  },
  distancia: { 
    type: Number, 
    required: true,
    index: true 
  },
  tiempo: { type: String, required: true },
  tiempoNumerico: { 
    type: Number, 
    required: true,
    index: true 
  },
  fecha: { type: Date, required: true },
  parciales: [{ 
    nroParcial: Number, 
    tiempo: String 
  }]
}, { 
  timestamps: true,
  versionKey: false
})

// --- ÍNDICES COMPUESTOS ---


pruebaSchema.index({ competencia: 1, tiempoNumerico: 1 });


pruebaSchema.index({ estilo: 1, distancia: 1, tiempoNumerico: 1 });

export default mongoose.model("Prueba", pruebaSchema)