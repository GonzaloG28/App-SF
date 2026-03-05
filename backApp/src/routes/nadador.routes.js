import express from "express"
import { verificarToken } from "../middleware/authMiddleware.js"
import { verificarRol } from "../middleware/roleMiddleware.js"
import { crearNadador, obtenerNadadorPorId, obtenerNadadores, eliminarNadador, actualizarNadadorProfesor, actualizarMiPerfil, obtenerMiPerfil } from "../controllers/nadador.controller.js"

const router = express.Router()

// 1. RUTAS ESPECÍFICAS (Siempre van primero)
// Estas deben ir arriba para que Express no las confunda con un ":id"
router.get("/perfil", verificarToken, verificarRol("nadador"), obtenerMiPerfil);
router.put("/perfil", verificarToken, verificarRol("nadador"), actualizarMiPerfil);

// 2. RUTAS DINÁMICAS Y DE ADMINISTRACIÓN (Van después)
router.post("/", verificarToken, verificarRol("profesor"), crearNadador);
router.get("/", verificarToken, verificarRol("profesor"), obtenerNadadores);

// Express solo llegará a estas si la URL no era "/perfil"
router.get("/:id", verificarToken, verificarRol("profesor"), obtenerNadadorPorId);
router.delete("/:id", verificarToken, verificarRol("profesor"), eliminarNadador);
router.put("/:id", verificarToken, verificarRol("profesor"), actualizarNadadorProfesor);

export default router