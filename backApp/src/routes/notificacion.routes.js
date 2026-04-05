import express from "express"
import { getNotificaciones, marcarLeidas } from "../controllers/notificacion.controller.js"
import { verificarToken } from "../middleware/authMiddleware.js"

const router = express.Router()

// Polling — el frontend consulta esto cada 30 segundos
router.get("/", verificarToken, getNotificaciones)

// Se llama al abrir el panel de notificaciones
router.patch("/marcar-leidas", verificarToken, marcarLeidas)

export default router