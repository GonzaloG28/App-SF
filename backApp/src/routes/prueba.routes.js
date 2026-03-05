import express from "express";
import { crearPrueba, listarPruebasPorCompetencia, obtenerPruebasDisponibles, rankingIndividual, eliminarPrueba } from "../controllers/prueba.controller.js";

import { verificarRol } from "../middleware/roleMiddleware.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Solo profesor crea prueba
router.post(
  "/:competenciaId",
  verificarToken,
  verificarRol("profesor"),
  crearPrueba
);

router.get(
  "/ranking/:nadadorId",
  verificarToken,
  rankingIndividual
);

router.get(
  "/disponibles/:nadadorId",
  verificarToken,
  obtenerPruebasDisponibles
);

router.get(
  "/:competenciaId", verificarToken,
  listarPruebasPorCompetencia
);

router.delete("/:id",verificarToken, verificarRol("profesor"), eliminarPrueba);


export default router;