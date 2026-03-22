import jwt from "jsonwebtoken"
import env from "../utils/envs.utils.js"
import User from "../models/User.js"

export const verificarToken = async (req, res, next) => {
  try {
    // FIX: el token ahora viene de la cookie httpOnly, no del header Authorization.
    // req.cookies requiere el middleware cookie-parser en server.js.
    //
    // Mantenemos fallback al header Authorization para compatibilidad con
    // Postman o clientes que no soporten cookies (ej: apps móviles nativas).
    const tokenDeCookie = req.cookies?.token
    const tokenDeHeader = req.headers.authorization?.split(" ")[1]
    const token = tokenDeCookie || tokenDeHeader

    if (!token) {
      return res.status(401).json({ message: "Acceso denegado — sin token" })
    }

    const decoded = jwt.verify(token, env.JWT_SECRET)
    const user    = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({ message: "Usuario no válido" })
    }

    req.user = {
      _id:    user._id,
      rol:    user.rol,
      correo: user.correo
    }

    next()
  } catch (error) {
    // Token expirado o inválido → limpiar la cookie para no dejar residuos
    res.clearCookie("token", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    })
    return res.status(401).json({ message: "Token inválido o expirado" })
  }
}

