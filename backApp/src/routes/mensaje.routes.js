import { Router }        from "express"
import { verificarToken } from "../middleware/authMiddleware.js"
import {
  enviarMensaje, getConversacion,
  getContactos, getNoLeidos
} from "../controllers/mensaje.controller.js"

const router = Router()

router.use(verificarToken)

router.get ("/contactos",              getContactos)
router.get ("/no-leidos",              getNoLeidos)
router.get ("/conversacion/:userId",   getConversacion)
router.post("/",                       enviarMensaje)

export default router