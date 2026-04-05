import mongoose from "mongoose"

const EntrenamientoSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  tipo: { 
    type: String, 
    enum: ["texto", "archivo", "link"], 
    default: "texto",
    index: true 
  },
  contenido: { type: String }, 
  archivoUrl: { type: String }, 
  archivoPublicId: { type: String }, 
  notasProfesor: { type: String },
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  destinatarios: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Nadador",
    index: true 
  }],
  completadoPor: [{
    nadador: { type: mongoose.Schema.Types.ObjectId, ref: "Nadador" },
    fechaCompletado: { type: Date, default: Date.now }
  }],
  fecha: { 
    type: Date, 
    default: Date.now,
    index: true,
    expires: 5184000
  }
}, { 
  timestamps: true,
  versionKey: false 
})


EntrenamientoSchema.index({ destinatarios: 1, fecha: -1 });

EntrenamientoSchema.index({ profesor: 1, fecha: -1 });

export default mongoose.model("Entrenamiento", EntrenamientoSchema)