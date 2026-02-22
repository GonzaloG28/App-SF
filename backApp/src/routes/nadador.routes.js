import express from "express"
import { verificarToken } from "../middleware/authMiddleware.js"
import { verificarRol } from "../middleware/roleMiddleware.js"
import { crearNadador, obtenerNadadorPorId, obtenerNadadores, eliminarNadador, actualizarNadadorProfesor, actualizarMiPerfil } from "../controllers/nadador.controller.js"

const router = express.Router()

router.post("/", verificarToken, verificarRol("profesor"), crearNadador);
router.get("/",verificarToken, verificarRol("profesor"),  obtenerNadadores)
router.get("/:id",verificarToken, verificarRol("profesor"), obtenerNadadorPorId)
router.delete("/:id",verificarToken, verificarRol("profesor"), eliminarNadador)

router.put("/:id", verificarToken, verificarRol("profesor"), actualizarNadadorProfesor);

router.put("/perfil", verificarToken, actualizarMiPerfil)

export default router