import mongoose from "mongoose"

const convocatoriaSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, "El nombre de la convocatoria es obligatorio"], 
    trim: true 
  },
  descripcion: { type: String, default: "" },
  lugar: { type: String, required: true, trim: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true, index: true },
  
  nadadores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nadador",
    index: true 
  }],
  
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  activa: { 
    type: Boolean, 
    default: true,
    index: true 
  }
}, { 
  timestamps: true,
  versionKey: false 
})

convocatoriaSchema.index({ fechaFin: 1 }, { expires: 7776000 });

convocatoriaSchema.index({ activa: 1, fechaInicio: 1 });

export const Convocatoria = mongoose.model("Convocatoria", convocatoriaSchema)