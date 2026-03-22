import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ["profesor", "nadador", "admin"],
    required: true
  },
  debeCambiarPassword: {
    type: Boolean,
    default: false
  },
  // FIX: guarda cuándo fue el último cambio de correo
  // null = nunca lo cambió → puede cambiar libremente la primera vez
  lastEmailChange: {
    type: Date,
    default: null
  }
}, { timestamps: true })

export default mongoose.model("User", userSchema)
