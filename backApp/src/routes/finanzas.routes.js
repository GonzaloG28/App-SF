import express from "express"
import { verificarToken } from "../middleware/authMiddleware.js"
import { verificarRol }   from "../middleware/roleMiddleware.js"
import {
  getConfig, updateConfig,
  getMovimientos, crearMovimiento, editarMovimiento, eliminarMovimiento,
  getEstadoCuentaNadador
} from "../controllers/finanzas.controller.js"

const router = express.Router()

router.use(verificarToken)
router.use(verificarRol("admin"))

// Config del club
router.get("/config",  getConfig)
router.put("/config",  updateConfig)

// Movimientos
router.get("/movimientos",     getMovimientos)
router.post("/movimientos",    crearMovimiento)
router.put("/movimientos/:id", editarMovimiento)
router.delete("/movimientos/:id", eliminarMovimiento)

// Estado de cuenta por nadador
router.get("/nadador/:nadadorId", getEstadoCuentaNadador)

export default router