import mongoose from "mongoose";

const nadadorFormativoSchema = new mongoose.Schema({
  nombre:          { type: String, required: true },
  apellido:        { type: String, required: true },
  rut:             { type: String, required: true, unique: true },
  fechaNacimiento: { type: Date,   required: true },
  // Datos del apoderado
  apoderado:       { type: String, required: true },
  telefono:        { type: String, required: true },
  // Físico (opcional)
  peso:            { type: Number, default: 0 },
  altura:          { type: Number, default: 0 },
  // Siempre "Formativo" hasta que el profesor lo promueva
  categoria:       { type: String, default: "Formativo" },
  // Estado pago
  pagoAlDia:       { type: Boolean, default: false },
  fechaUltimoPago: { type: Date,    default: null },
  // Quién lo gestiona
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  notas:           { type: String, default: "" }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
})

nadadorFormativoSchema.index({ profesor: 1 })
nadadorFormativoSchema.index({ pagoAlDia: 1 })

nadadorFormativoSchema.virtual("edad").get(function () {
  const hoy        = new Date()
  const nacimiento = new Date(this.fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
})

export const NadadorFormativo = mongoose.model("NadadorFormativo", nadadorFormativoSchema)