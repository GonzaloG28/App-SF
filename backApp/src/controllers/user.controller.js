import bcrypt from "bcrypt"
import User from "../models/User.js"
import envs from "../utils/envs.utils.js"
import jwt from "jsonwebtoken"

export const registerProfesor = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body

    // FIX #8: Validación básica de inputs
    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" })
    }

    const existeUsuario = await User.findOne({ correo })
    if (existeUsuario) {
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const nuevoUsuario = new User({
      nombre,
      correo,
      password: passwordHash,
      rol: "profesor"
    })

    await nuevoUsuario.save()
    res.status(201).json({ message: "Profesor creado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    // FIX: el objeto original tenía dos keys "message" (bug JS silencioso)
    res.status(500).json({
      message: "Error con el servidor",
      ...(isDev && { error: error.message })
    })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { correo, password } = req.body

    // FIX #8: Validar inputs
    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña requeridos" })
    }

    const user = await User.findOne({ correo })

    // FIX #2: Mensaje GENÉRICO para evitar User Enumeration Attack.
    // Antes: "Correo incorrecto" vs "Contraseña incorrecta" revelaba si el correo existía.
    // Ahora: siempre el mismo mensaje independiente de qué falló.
    if (!user) {
      return res.status(400).json({ message: "Credenciales incorrectas" })
    }

    const passwordValida = await bcrypt.compare(password, user.password)
    if (!passwordValida) {
      return res.status(400).json({ message: "Credenciales incorrectas" })
    }

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      envs.JWT_SECRET,
      { expiresIn: "1h" }
    )

    res.json({
      message: "Login exitoso",
      token,
      correo: user.correo,
      nombre: user.nombre,
      rol: user.rol,
      debeCambiarPassword: user.debeCambiarPassword
    })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({
      message: "Error en el servidor",
      ...(isDev && { error: error.message })
    })
  }
}

export const cambiarPassword = async (req, res) => {
  try {
    const { passwordNueva } = req.body
    const userId = req.user._id

    // FIX #8: Validar que la contraseña cumpla requisitos mínimos
    if (!passwordNueva || passwordNueva.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(passwordNueva, salt)

    await User.findByIdAndUpdate(userId, {
      password: passwordHash,
      debeCambiarPassword: false
    })

    res.json({ message: "Contraseña actualizada correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({
      message: "Error al cambiar la contraseña",
      ...(isDev && { error: error.message })
    })
  }
}
