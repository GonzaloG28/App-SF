import bcrypt from "bcrypt"
import User from "../models/User.js"
import envs from "../utils/envs.utils.js"
import jwt from "jsonwebtoken"

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

    // Mensaje genérico — evita User Enumeration Attack
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
      { expiresIn: "8h" }   // ampliado a 8h para sesiones de trabajo cómodas
    )

    // FIX SEGURIDAD: el token ya no se devuelve en el body de la respuesta.
    // Se envía como httpOnly cookie → JavaScript del navegador NO puede leerla,
    // por lo que un ataque XSS no puede robar el token.
    //
    // Atributos de seguridad:
    // - httpOnly:  invisible para document.cookie y cualquier script JS
    // - secure:    solo se envía por HTTPS (en producción)
    // - sameSite:  "strict" bloquea el envío en requests cross-site (anti CSRF)
    // - maxAge:    8 horas en ms → coincide con expiresIn del JWT
    res.cookie("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge:   8 * 60 * 60 * 1000
    })

    // El body solo devuelve datos NO sensibles que el frontend necesita
    // para saber a qué panel redirigir y mostrar el nombre del usuario.
    // El token NO va aquí.
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

export const getMe = async (req, res) => {
  // verificarToken ya validó la cookie — si llegamos aquí, el token es válido
  res.json({
    correo: req.user.correo,
    rol:    req.user.rol,
    _id:    req.user._id
  })
}

// NUEVO: endpoint de logout — borra la cookie del servidor
export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  })
  res.json({ message: "Sesión cerrada correctamente" })
}
