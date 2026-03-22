import express from "express"
import { verificarToken }  from "../middleware/authMiddleware.js"
import { verificarRol }    from "../middleware/roleMiddleware.js"
import {
  getStats, getNadadoresAdmin,
  togglePagoNadador, togglePagoFormativo, registerAdmin
} from "../controllers/admin.controller.js"

const router = express.Router()

// Todas las rutas de admin requieren rol "admin"
router.use(verificarToken, verificarRol("admin"))

router.get  ("/stats",               getStats)
router.get  ("/nadadores",           getNadadoresAdmin)
router.patch("/pago/:id",            togglePagoNadador)
router.patch("/pago-formativo/:id",  togglePagoFormativo)

// Crear admin (protegido por ADMIN_SECRET en producción — mismo patrón que /register)
router.post("/register", (req, res, next) => {
  if (process.env.NODE_ENV !== "development") {
    const token = req.headers["x-admin-token"]
    if (!token || token !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Acceso denegado" })
    }
  }
  next()
}, registerAdmin)

export default router