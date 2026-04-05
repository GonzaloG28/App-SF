import mongoose from "mongoose"

const nadadorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true 
  },
  apellido: { type: String, required: true, trim: true },
  fechaNacimiento: { type: Date, required: true },
  peso: { type: Number, required: true },
  altura: { type: Number, required: true },
  rut: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  pruebasEspecialidad: [{ type: String }],
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true 
  },
  rama: {
    type: String,
    enum: ["competitivo", "formativo"],
    default: "competitivo",
    index: true 
  },
  pagoAlDia: { type: Boolean, default: false, index: true },
  fechaUltimoPago: { type: Date, default: null },
  
  // --- DATOS DEL APODERADO ---
  nombreApoderado: { type: String, trim: true },
  telefonoApoderado: { type: String, trim: true },
  correoApoderado: { 
    type: String, 
    trim: true, 
    lowercase: true,
    required: function() {
      if (!this.fechaNacimiento) return false;
      const hoy = new Date();
      const nacimiento = new Date(this.fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
      
      return edad < 18; // Obligatorio solo si es menor de 18
    }
  }
}, {
  timestamps: true,
  versionKey: false, 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// --- ÍNDICES COMPUESTOS ---
nadadorSchema.index({ profesor: 1, rama: 1, apellido: 1 });
nadadorSchema.index({ profesor: 1, pagoAlDia: 1 });

// --- VIRTUALS ---
nadadorSchema.virtual("edad").get(function () {
  if (!this.fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
})

nadadorSchema.virtual("categoria").get(function () {
  const edad = this.edad;
  if (edad === null) return "Sin datos";
  if (edad < 13) return "Infantil";
  if (edad <= 14) return "JA";
  if (edad <= 17) return "JB";
  return "Mayores";
})

export default mongoose.model("Nadador", nadadorSchema)