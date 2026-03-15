import mongoose from "mongoose";

const EntrenamientoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['texto', 'archivo', 'link'], 
    default: 'texto' 
  },
  contenido: { type: String }, // Aquí va el texto o la URL del link
  archivoUrl: { type: String }, // URL si se sube un PDF/Imagen
  notasProfesor: { type: String },
  profesor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  destinatarios: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Nadador' 
  }],
  completadoPor: [{ 
    nadador: { type: mongoose.Schema.Types.ObjectId, ref: 'Nadador' },
    fechaCompletado: { type: Date, default: Date.now }
  }],
  fecha: { type: Date, default: Date.now},
});

export default mongoose.model('Entrenamiento', EntrenamientoSchema)