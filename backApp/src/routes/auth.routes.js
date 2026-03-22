import { Router } from "express"
import { registerProfesor, loginUser, logoutUser } from "../controllers/user.controller.js"
import { verificarToken } from "../middleware/authMiddleware.js"

const router = Router()

// Protección de register en producción
const protegerRegister = (req, res, next) => {
  if (process.env.NODE_ENV === "development") return next()
  const adminToken = req.headers["x-admin-token"]
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Acceso denegado" })
  }
  next()
}

router.post("/register", protegerRegister, registerProfesor)
router.post("/login",    loginUser)

// NUEVO: logout limpia la cookie desde el servidor
router.post("/logout", verificarToken, logoutUser)

export default router
