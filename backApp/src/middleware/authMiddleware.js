import jwt from "jsonwebtoken"
import env from "../utils/envs.utils.js"
import User from "../models/User.js"

// authMiddleware.js
export const verificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Acceso denegado" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) return res.status(401).json({ message: "Usuario no válido" });

        // IMPORTANTE: Asegúrate de que el rol se guarde aquí
        req.user = {
            _id: user._id,
            rol: user.rol, // <--- ESTO DEBE SER "nadador"
            correo: user.correo
        };      
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }
}
