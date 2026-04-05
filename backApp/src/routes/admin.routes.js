import express from "express"
import { verificarToken }  from "../middleware/authMiddleware.js"
import { verificarRol }    from "../middleware/roleMiddleware.js"
import {
  getStats, getNadadoresAdmin,
  togglePagoNadador, registerAdmin
} from "../controllers/admin.controller.js"

const router = express.Router()

// Todas las rutas de admin requieren rol "admin"
router.post("/register", (req, res, next) => {
  const adminToken = req.headers["x-admin-token"];
  const secret = process.env.ADMIN_SECRET;

  // En producción, si no hay secret o no coincide, bloqueamos.
  if (process.env.NODE_ENV === "production") {
    if (!adminToken || adminToken !== secret) {
      return res.status(403).json({ message: "No autorizado para crear administradores" });
    }
  }
  next();
}, registerAdmin);


router.use(verificarToken, verificarRol("admin"));

router.get("/stats", getStats);
router.get("/nadadores", getNadadoresAdmin);
router.patch("/pago/:id", togglePagoNadador);

export default router;