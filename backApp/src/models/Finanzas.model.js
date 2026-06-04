import mongoose from "mongoose"

const finanzasSchema = new mongoose.Schema({
  // Precios de mensualidad
  precioCompetitivo: { type: Number, default: 0 },
  precioFormativo:   { type: Number, default: 0 },

  // Fondo base del club (capital inicial que el admin ingresa manualmente)
  fondoBase: { type: Number, default: 0 },

  // Categorías de egreso disponibles (el admin puede añadir las suyas)
  categoriasEgreso: {
    type: [String],
    default: ["Arriendo de pista", "Material deportivo", "Inscripción federación", "Pago entrenador", "Otro"]
  },

  // Marcador de singleton
  _singleton: { type: Boolean, default: true, unique: true }
}, { timestamps: true })

// Garantizar que solo haya un documento
finanzasSchema.statics.getConfig = async function () {
  let config = await this.findOne({ _singleton: true })
  if (!config) config = await this.create({ _singleton: true })
  return config
}

export default mongoose.model("Finanzas", finanzasSchema)
