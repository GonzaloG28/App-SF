import express from "express";
import { 
  crearEntrenamiento, 
  getMisEntrenamientos, 
  completarEntrenamiento, 
  getReporteProfesor, 
  eliminarEntrenamiento 
} from "../controllers/entrenamiento.controller.js";
import { verificarRol } from "../middleware/roleMiddleware.js";
import { verificarToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();

router.use(verificarToken);

router.post(
    '/enviar', 
    verificarRol("profesor", "admin"), 
    upload.single('archivo'), 
    crearEntrenamiento
);

// Ver quién ha completado qué
router.get(
  "/reporte-profesor", 
  verificarRol("profesor", "admin"),
  getReporteProfesor
);

router.delete(
  "/:id", 
  verificarRol("profesor", "admin"), 
  eliminarEntrenamiento
);


router.get(
    '/mis-entrenamientos', 
    verificarRol("nadador"), 
    getMisEntrenamientos
);

// Marcar como hecho
router.patch(
    '/:id/completar', 
    verificarRol("nadador"), 
    completarEntrenamiento
);

export default router;