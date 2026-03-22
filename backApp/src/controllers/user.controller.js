import bcrypt from "bcrypt"
import User from "../models/User.js"
import envs from "../utils/envs.utils.js"
import jwt from "jsonwebtoken"

// Configuración de cookie reutilizada en login y logout
const cookieOptions = {
  httpOnly: true,
  secure:   true, // siempre true — Render y Vercel usan HTTPS
  // FIX: "strict" bloqueaba la cookie en requests cross-origin
  // (frontend Vercel → backend Render son dominios distintos).
  // "none" permite el envío cross-origin, pero REQUIERE secure:true.
  sameSite: "none",
  maxAge:   8 * 60 * 60 * 1000 // 8 horas
}

export const registerProfesor = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body

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
      nombre, correo, password: passwordHash, rol: "profesor"
    })
    await nuevoUsuario.save()

    res.status(201).json({ message: "Profesor creado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error con el servidor", ...(isDev && { error: error.message }) })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { correo, password } = req.body

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña requeridos" })
    }

    const user = await User.findOne({ correo })
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
      { expiresIn: "8h" }
    )

    res.cookie("token", token, cookieOptions)

    res.json({
      message:             "Login exitoso",
      correo:              user.correo,
      nombre:              user.nombre,
      rol:                 user.rol,
      debeCambiarPassword: user.debeCambiarPassword
    })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error en el servidor", ...(isDev && { error: error.message }) })
  }
}

export const cambiarPassword = async (req, res) => {
  try {
    const { passwordNueva } = req.body
    const userId = req.user._id

    if (!passwordNueva || passwordNueva.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(passwordNueva, salt)

    await User.findByIdAndUpdate(userId, {
      password:            passwordHash,
      debeCambiarPassword: false
    })

    res.json({ message: "Contraseña actualizada correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al cambiar la contraseña", ...(isDev && { error: error.message }) })
  }
}

export const logoutUser = async (req, res) => {
  // clearCookie debe usar las mismas opciones que al setear
  // excepto maxAge — se reemplaza por expires en el pasado
  res.clearCookie("token", {
    httpOnly: true,
    secure:   true,
    sameSite: "none"
  })
  res.json({ message: "Sesión cerrada correctamente" })
}

export const getMe = async (req, res) => {
  // verificarToken ya validó la cookie — si llegamos aquí el token es válido
  res.json({
    correo: req.user.correo,
    rol:    req.user.rol,
    _id:    req.user._id
  })
}
