import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true
  },
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    select: false
  },
  rol: {
    type: String,
    enum: {
      values: ["profesor", "nadador", "admin"],
      message: '{VALUE} no es un rol válido'
    },
    default: "nadador",
    index: true
  },
  debeCambiarPassword: {
    type: Boolean,
    default: false
  },
  lastEmailChange: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  versionKey: false 
})

userSchema.index({ rol: 1, nombre: 1 });

export default mongoose.model("User", userSchema)
