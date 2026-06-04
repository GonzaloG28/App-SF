import mongoose from "mongoose"

const movimientoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["ingreso", "egreso"],
    required: true,
    index: true
  },

  categoria: {
    type: String,
    // Ingresos: "mensualidad", "campeonato", "rifa", "otro"
    // Egresos:  "arriendo_pista", "material", "federacion", "entrenador", "otro"
    required: true
  },

  descripcion: { type: String, required: true, trim: true },
  monto:       { type: Number, required: true, min: 0 },
  fecha:       { type: Date, default: Date.now, index: true },

  // Referencia opcional al nadador (para mensualidades y pagos de campeonato)
  nadador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nadador",
    default: null,
    index: true
  },

  // Referencia opcional a convocatoria (para pagos de campeonato)
  convocatoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Convocatoria",
    default: null
  },

  // Mes al que corresponde (para mensualidades) → "2026-04"
  mesPago: { type: String, default: null },

  // Usuario admin que registró el movimiento
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true })

// Índice compuesto para consultas de estado de cuenta por nadador
movimientoSchema.index({ nadador: 1, fecha: -1 })
movimientoSchema.index({ fecha: -1 })

export default mongoose.model("Movimiento", movimientoSchema)
