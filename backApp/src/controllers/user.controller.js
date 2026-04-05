import bcrypt from "bcrypt"
import User from "../models/User.js"
import envs from "../utils/envs.utils.js"
import jwt from "jsonwebtoken"

const cookieOptions = {
    httpOnly: true,
    secure:   true, 
    sameSite: "none",
    maxAge:   8 * 60 * 60 * 1000 
}

const handleError = (res, error, message = "Error en el servidor") => {
    console.error(`[AUTH ERROR]: ${error.message}`);
    const isDev = envs.NODE_ENV === "development";
    return res.status(500).json({ message, ...(isDev && { error: error.message }) });
}

export const registerProfesor = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password || password.length < 8) {
            return res.status(400).json({ message: "Datos inválidos o contraseña muy corta" });
        }

        const existeUsuario = await User.findOne({ correo }).select('_id').lean();
        if (existeUsuario) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({
            nombre, 
            correo, 
            password: passwordHash, 
            rol: "profesor"
        });
        
        await nuevoUsuario.save();
        res.status(201).json({ message: "Profesor creado correctamente" });

    } catch (error) {
        handleError(res, error);
    }
}

export const loginUser = async (req, res) => {
    try {
        let { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ message: "Correo y contraseña requeridos" });
        }

        // 🟢 NORMALIZACIÓN: Evita fallos por mayúsculas o espacios accidentales
        const correoNormalizado = correo.toLowerCase().trim();

        // 🟢 RAM: .lean() es perfecto aquí. Solo traemos lo mínimo necesario.
        const user = await User.findOne({ correo: correoNormalizado })
            .select('+password nombre correo rol debeCambiarPassword')
            .lean();
        
        if (!user) {
            // Usamos el mismo mensaje genérico por seguridad
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        // 🟢 CPU: Bcrypt es costoso. Render tiene CPU limitado. 
        // 8h de token es un buen balance para no re-loguear todo el día.
        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        // 🟢 JWT: Incluimos solo lo esencial para el middleware de auth
        const token = jwt.sign(
            { id: user._id, rol: user.rol },
            envs.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.cookie("token", token, cookieOptions);

        res.json({
            message: "Login exitoso",
            user: {
                id: user._id,
                correo: user.correo,
                nombre: user.nombre,
                rol: user.rol,
                debeCambiarPassword: user.debeCambiarPassword || false
            }
        });

    } catch (error) {
        // Asegúrate de que handleError no exponga el stack trace en producción
        handleError(res, error);
    }
}

export const cambiarPassword = async (req, res) => {
    try {
        const { passwordNueva } = req.body;
        const userId = req.user.id;

        if (!passwordNueva || passwordNueva.length < 8) {
            return res.status(400).json({ message: "Contraseña inválida" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordNueva, salt);

        const update = await User.findByIdAndUpdate(userId, {
            password: passwordHash,
            debeCambiarPassword: false
        });

        if (!update) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
        handleError(res, error, "Error al cambiar la contraseña");
    }
}

export const logoutUser = async (req, res) => {
    res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
    res.json({ message: "Sesión cerrada" });
}

export const getMe = async (req, res) => {
  res.json({
    id:     req.user._id || req.user.id,
    nombre: req.user.nombre,  
    correo: req.user.correo,
    rol:    req.user.rol
  })
}