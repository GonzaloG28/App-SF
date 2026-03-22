import express from "express"
import { verificarRol } from "../middleware/roleMiddleware.js"
import { verificarToken } from "../middleware/authMiddleware.js"
import {
  crearPrueba,
  rankingIndividual,
  obtenerPruebasDisponibles,
  listarPruebasPorCompetencia,
  eliminarPrueba
} from "../controllers/prueba.controller.js"

const router = express.Router()

// Solo profesor crea prueba
router.post("/:competenciaId", verificarToken, verificarRol("profesor"), crearPrueba)

// Ranking — accesible para profesor y nadador
router.get("/ranking/:nadadorId", verificarToken, rankingIndividual)

// Pruebas disponibles para filtros
router.get("/disponibles/:nadadorId", verificarToken, obtenerPruebasDisponibles)

// Listar pruebas de una competencia
router.get("/:competenciaId", verificarToken, listarPruebasPorCompetencia)

// Solo profesor elimina
router.delete("/:id", verificarToken, verificarRol("profesor"), eliminarPrueba)

export default router