import mongoose from "mongoose"

const nadadorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  apellido:        { type: String, required: true },
  fechaNacimiento: { type: Date,   required: true },
  peso:            { type: Number, required: true },
  altura:          { type: Number, required: true },
  rut: {
    type: String,
    required: true,
    unique: true   // ya crea índice implícito
  },
  pruebasEspecialidad: [{ type: String }],
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rama: {
  type:    String,
  enum:    ["competitivo", "formativo"],
  default: "competitivo"
 },
  pagoAlDia:        { type: Boolean, default: false },
  fechaUltimoPago:  { type: Date,    default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
})

// ÍNDICES
// user → obtenerMiPerfil hace findOne({ user: req.user._id }) en cada request autenticado
nadadorSchema.index({ user: 1 })
// profesor → obtenerNadadores filtra por profesor en el futuro + eliminarNadador verifica propiedad
nadadorSchema.index({ profesor: 1 })

nadadorSchema.virtual("edad").get(function () {
  const hoy       = new Date()
  const nacimiento = new Date(this.fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
})

nadadorSchema.virtual("categoria").get(function () {
  const edad = this.edad
  if (edad < 13)                   return "Infantil"
  if (edad >= 13 && edad <= 14)    return "JA"
  if (edad >= 15 && edad <= 17)    return "JB"
  if (edad >= 18)                  return "Mayores"
  return "Sin categoría"
})

export default mongoose.model("Nadador", nadadorSchema)