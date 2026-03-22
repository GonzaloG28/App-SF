import express from "express"
import { verificarToken } from "../middleware/authMiddleware.js"
import { verificarRol }   from "../middleware/roleMiddleware.js"
import {
  crearConvocatoria, getConvocatorias, getConvocatoriaDetalle,
  getConvocatoriasNadador, getMisConvocatorias,
  actualizarConvocatoria, eliminarConvocatoria, limpiarConvocatoriasPasadas
} from "../controllers/convocatoria.controller.js"

const router3 = express.Router()

// Nadador: sus convocatorias
router3.get("/mis-convocatorias",     verificarToken, verificarRol("nadador"),          getMisConvocatorias)

// Listar y crear (profesor y admin)
router3.get ("/",                     verificarToken,                                   getConvocatorias)
router3.post("/",                     verificarToken, verificarRol("profesor","admin"), crearConvocatoria)

// Por nadador (para calendario del profesor)
router3.get ("/nadador/:id",          verificarToken,                                   getConvocatoriasNadador)

// Detalle, editar, eliminar
router3.get ("/:id",                  verificarToken,                                   getConvocatoriaDetalle)
router3.put ("/:id",                  verificarToken, verificarRol("profesor","admin"), actualizarConvocatoria)
router3.delete("/:id",               verificarToken, verificarRol("profesor","admin"), eliminarConvocatoria)

// Limpieza manual (admin)
router3.delete("/limpiar/pasadas",    verificarToken, verificarRol("admin"),            limpiarConvocatoriasPasadas)

export { router3 as convocatoriaRoutes }