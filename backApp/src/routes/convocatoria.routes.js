import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import { verificarRol } from "../middleware/roleMiddleware.js";
import {
  crearConvocatoria, getConvocatorias, getConvocatoriaDetalle,
  getConvocatoriasNadador, getMisConvocatorias,
  actualizarConvocatoria, eliminarConvocatoria, limpiarConvocatoriasPasadas
} from "../controllers/convocatoria.controller.js";

const router3 = express.Router();

router3.use(verificarToken);


router3.get("/mis-convocatorias", verificarRol("nadador"), getMisConvocatorias);


router3.delete("/limpiar/pasadas", verificarRol("admin"), limpiarConvocatoriasPasadas);


router3.get("/", getConvocatorias);
router3.post("/", verificarRol("profesor", "admin"), crearConvocatoria);


router3.get("/nadador/:id", verificarRol("profesor", "admin"), getConvocatoriasNadador);


router3.get("/:id", getConvocatoriaDetalle);
router3.put("/:id", verificarRol("profesor", "admin"), actualizarConvocatoria);
router3.delete("/:id", verificarRol("profesor", "admin"), eliminarConvocatoria);

export { router3 as convocatoriaRoutes };