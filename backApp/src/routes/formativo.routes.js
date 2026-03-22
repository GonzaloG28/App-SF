import express from "express"
import { verificarToken } from "../middleware/authMiddleware.js"
import { verificarRol }   from "../middleware/roleMiddleware.js"
import {
  crearFormativo, getFormativos, getFormativoById,
  actualizarFormativo, eliminarFormativo, promoverFormativo
} from "../controllers/formativo.controller.js"

const router2 = express.Router()

// Profesor y admin pueden gestionar formativos
router2.get   ("/",            verificarToken, verificarRol("profesor","admin"), getFormativos)
router2.post  ("/",            verificarToken, verificarRol("profesor","admin"), crearFormativo)
router2.get   ("/:id",         verificarToken, verificarRol("profesor","admin"), getFormativoById)
router2.put   ("/:id",         verificarToken, verificarRol("profesor","admin"), actualizarFormativo)
router2.delete("/:id",         verificarToken, verificarRol("profesor","admin"), eliminarFormativo)
router2.post  ("/:id/promover",verificarToken, verificarRol("profesor"),         promoverFormativo)

export { router2 as formativoRoutes }