import express from "express";
import { cambiarPassword } from "../controllers/user.controller.js"; // Ajusta la ruta a tu controlador
import { verificarToken } from "../middleware/authMiddleware.js";
import { verificarRol } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Aquí es donde permites que AMBOS roles cambien su clave
router.put("/cambiar-password", verificarToken, verificarRol("nadador", "profesor"), cambiarPassword);

export default router;