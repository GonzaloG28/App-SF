import express from "express";
import { crearCompetencia, listarCompetenciasPorNadador } from "../controllers/competencia.controller.js";

import { verificarRol } from "../middleware/roleMiddleware.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Solo profesor crea competencia
router.post("/:nadadorId", verificarToken, verificarRol("profesor"), crearCompetencia);

// Profesor o nadador puede ver
router.get("/:nadadorId", verificarToken, listarCompetenciasPorNadador);

export default router;