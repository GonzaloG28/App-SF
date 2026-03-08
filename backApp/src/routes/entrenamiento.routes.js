import express from "express";
import { crearEntrenamiento, getMisEntrenamientos, completarEntrenamiento, getReporteProfesor,eliminarEntrenamiento } from "../controllers/entrenamiento.controller.js";
import { verificarRol } from "../middleware/roleMiddleware.js";
import { verificarToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js"; // Ajusta la ruta a tu archivo

const router = express.Router();

// POST /api/entrenamiento/enviar
// 1. Verifica login
// 2. Verifica rol Profesor
// 3. Procesa el archivo (Multer)
// 4. Ejecuta el controlador
router.post(
    '/enviar', 
    verificarToken, 
    verificarRol("profesor"), 
    (req, res, next) => {
        console.log("1. 🚀 Iniciando subida del archivo a Cloudinary...");
        next();
    },
    upload.single('archivo'), 
    (req, res, next) => {
        console.log("2. ✅ Archivo procesado por Multer:", req.file);
        next();
    },
    crearEntrenamiento
);

router.get(
  "/reporte-profesor", 
  verificarToken, 
  verificarRol("profesor"),
  getReporteProfesor
);

// GET /api/entrenamiento/mis-entrenamientos
// Solo los nadadores pueden consultar esta ruta
router.get(
    '/mis-entrenamientos', 
    verificarToken, 
    verificarRol("nadador"), 
    getMisEntrenamientos
);

router.patch(
    '/:id/completar', 
    verificarToken, 
    verificarRol("nadador"), 
    completarEntrenamiento
);

router.delete("/:id", verificarToken, eliminarEntrenamiento);

export default router;