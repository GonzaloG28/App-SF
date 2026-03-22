import { Router } from "express"
import { registerProfesor, loginUser, logoutUser, getMe } from "../controllers/user.controller.js"
import { verificarToken } from "../middleware/authMiddleware.js"

const router = Router()

const protegerRegister = (req, res, next) => {
  if (process.env.NODE_ENV === "development") return next()
  const adminToken = req.headers["x-admin-token"]
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Acceso denegado" })
  }
  next()
}

router.get ("/me",       verificarToken, getMe)
router.post("/register", protegerRegister, registerProfesor)
router.post("/login",    loginUser)
router.post("/logout",   verificarToken, logoutUser)

export default router
