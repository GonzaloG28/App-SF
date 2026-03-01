import mongoose from "mongoose";

const competenciaSchema = new mongoose.Schema({
  nadador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  nombre: {
    type: String,
    required: true
  },

  fecha: {
    type: Date,
    required: true
  },

  año: {
    type: Number,
    required: true
  },

  piscina: {
    type: Number,
    enum: [25, 50],
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Competencia", competenciaSchema);