import jwt  from "jsonwebtoken"
import User from "../models/User.js"
import envs from "../utils/envs.utils.js"

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token
    if (!token) {
      return res.status(401).json({ message: "No autorizado: falta token" })
    }

    // Decodificar JWT — falla si expiró o es inválido
    let decoded
    try {
      decoded = jwt.verify(token, envs.JWT_SECRET)
    } catch (jwtErr) {
      res.clearCookie("token", {
        httpOnly: true, secure: true, sameSite: "none"
      })
      return res.status(401).json({ message: "Sesión expirada, inicia sesión nuevamente" })
    }

    // Buscar usuario en BD para obtener nombre y correo (no están en el JWT)
    // .lean() evita instanciar un documento Mongoose completo → menos RAM
    const user = await User.findById(decoded.id)
      .select("nombre correo rol")
      .lean()

    if (!user) {
      res.clearCookie("token", {
        httpOnly: true, secure: true, sameSite: "none"
      })
      return res.status(401).json({ message: "Usuario no encontrado" })
    }

    // Poblar req.user con todo lo necesario
    req.user = {
      _id:    user._id,
      id:     user._id,     // compatibilidad con código que usa req.user.id
      nombre: user.nombre,
      correo: user.correo,
      rol:    user.rol
    }

    next()
  } catch (err) {
    console.error("[AUTH MIDDLEWARE ERROR]:", err.message)
    return res.status(500).json({ message: "Error de autenticación" })
  }
}

// Middleware de roles — usar después de verificarToken
export const soloRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return res.status(403).json({
      message: `Acceso denegado. Se requiere rol: ${roles.join(" o ")}`
    })
  }
  next()
}
