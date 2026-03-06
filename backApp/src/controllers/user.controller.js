import bcrypt from "bcrypt"
import User from "../models/User.js"
import envs from "../utils/envs.utils.js"
import jwt from "jsonwebtoken"

export const registerProfesor = async (req, res) =>{
    try{
        const {nombre, correo, password} = req.body

        const existeUsuario = await User.findOne({correo})
        if (existeUsuario){
            return res.status(400).json({message: "El usuario ya existe"})
        }

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        const nuevoUsuario = new User({
            nombre,
            correo,
            password: passwordHash,
            rol: "profesor"
        })

        await nuevoUsuario.save()

        res.status(201).json({
            message: "Profesor creado correctamente"
        })

    } catch (error){
        res.status(500).json({message: "Error con el servidor", message: error.message})
    }
}

export const loginUser = async (req, res) => {
    try{
        const { correo, password } = req.body

        const user = await User.findOne({ correo })
        if(!user) {
            return res.status(400).json({ message: "Correo incorrecto" })
        }

        const passwordValida = await bcrypt.compare(password, user.password)
        if(!passwordValida) {
            return res.status(400).json({ message: "Contraseña incorrecta"})
        }

        const token = jwt.sign(
            { 
                id: user._id,
                rol: user.rol
            }, 
            envs.JWT_SECRET, 
            { expiresIn: "1d" }
        )

        res.json({
            message: "Login exitoso",
            token,
            correo: user.correo,
            nombre: user.nombre,
            rol: user.rol,
            debeCambiarPassword: user.debeCambiarPassword
        })

    } catch (error) {
        res.status(500).json({message: "Error en el servidor", error: error.message})
    }
}

export const cambiarPassword = async (req, res) => {
    try {
        const { passwordNueva } = req.body;
        const userId = req.user._id; 

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordNueva, salt);

        await User.findByIdAndUpdate(userId, {
            password: passwordHash,
            debeCambiarPassword: false
        });

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar la contraseña", error: error.message });
    }
};