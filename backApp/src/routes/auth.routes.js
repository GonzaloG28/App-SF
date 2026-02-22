import { Router } from "express";
import { registerProfesor, loginUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerProfesor);
router.post("/login", loginUser);

export default router;