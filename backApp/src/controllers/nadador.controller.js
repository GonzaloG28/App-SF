import bcrypt from "bcrypt"
import mongoose from "mongoose"
import User from "../models/User.js"
import Nadador from "../models/Nadadores.js"

export const crearNadador = async (req, res) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const {
            nombre,
            apellido,
            correo,
            fechaNacimiento,
            peso,
            altura,
            rut,
            pruebasEspecialidad
        } = req.body;

        // Verificar si ya existe usuario con ese correo

        const existeUsuario = await User.findOne({ correo }).session(session)
            if (existeUsuario) {
                await session.abortTransaction()
                session.endSession()
                return res.status(400).json({
                    message: "Ya existe un usuario con ese correo"
                })
        }

        // Encriptar RUT como contraseña inicial
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(rut, salt);

        // Crear usuario nadador
        const nuevoUser = await User.create([{
            nombre,
            apellido,
            correo,
            password: passwordHash,
            rol: "nadador",
            debeCambiarPassword: true
        }], { session })

        await Nadador.create([{
            user: nuevoUser[0]._id,
            fechaNacimiento,
            peso,
            altura,
            rut,
            pruebasEspecialidad
        }], { session })

         await session.commitTransaction()
        session.endSession()

        res.status(201).json({ message: "Nadador creado correctamente",});

    } catch (error) {
        await session.abortTransaction()
        session.endSession()

        res.status(500).json({
        message: "Error al crear nadador",
        error: error.message
            });
    }
};

export const actualizarNadadorProfesor = async (req, res) => {
    try {
        const { id } = req.params;

        const nadador = await Nadador.findById(id);
        if (!nadador) {
            return res.status(404).json({ message: "Nadador no encontrado" });
        }

        // Campos permitidos en Nadador
        const camposPermitidosNadador = [
            "fechaNacimiento",
            "peso",
            "altura",
            "rut",
            "pruebasEspecialidad"
        ];

        // Campos permitidos en User
        const camposPermitidosUser = [
            "nombre",
            "apellido",
            "correo"
        ];

        // Construir objeto seguro para Nadador
        const datosNadador = {};
        camposPermitidosNadador.forEach(campo => {
            if (req.body[campo] !== undefined) {
                datosNadador[campo] = req.body[campo];
            }
        });

        // Construir objeto seguro para User
        const datosUser = {};
        camposPermitidosUser.forEach(campo => {
            if (req.body[campo] !== undefined) {
                datosUser[campo] = req.body[campo];
            }
        });

        // Actualizar si hay cambios
        if (Object.keys(datosNadador).length > 0) {
            await Nadador.findByIdAndUpdate(id, datosNadador, { new: true });
        }

        if (Object.keys(datosUser).length > 0) {
            await User.findByIdAndUpdate(nadador.user, datosUser);
        }

        res.json({ message: "Nadador actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ message: "Error al actualizar", error: error.message });
    }
};

export const actualizarMiPerfil = async (req, res) => {
    try {
        const userId = req.user._id;

        const nadador = await Nadador.findOne({ user: userId });
        if (!nadador) {
            return res.status(404).json({ message: "Perfil no encontrado" });
        }

        const camposPermitidos = ["correo", "peso", "altura"];

        const datosUser = {};
        const datosNadador = {};

        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                if (campo === "correo") {
                    datosUser.correo = req.body.correo;
                } else {
                    datosNadador[campo] = req.body[campo];
                }
            }
        });

        if (Object.keys(datosNadador).length > 0) {
            await Nadador.findByIdAndUpdate(nadador._id, datosNadador);
        }

        if (Object.keys(datosUser).length > 0) {
            await User.findByIdAndUpdate(userId, datosUser);
        }

        res.json({ message: "Perfil actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ message: "Error al actualizar perfil", error: error.message });
    }
};

export const obtenerNadadores = async (req, res) =>{
    try {
    const { categoria, nombre } = req.query

    const nadadores = await Nadador.find()
      .populate("user", "nombre apellido correo rol")

    const filtrados = nadadores.filter(n => {
      const coincideCategoria = categoria
        ? n.categoria === categoria
        : true

      const coincideNombre = nombre
        ? n.user.nombre.toLowerCase().includes(nombre.toLowerCase())
        : true

      return coincideCategoria && coincideNombre
    })

    res.status(200).json(filtrados)

  } catch (error) {
    res.status(500).json({
      message: "Error con el servidor",
      error: error.message
    })
  }
}


export const obtenerNadadorPorId = async (req, res) =>{
    try{
        const nadador = await Nadador.findById(req.params.id)
        .populate("user", "nombre correo rol")
        if(!nadador){
            return res.status(404).json({ message: "Nadador no encontrado"})
        }

        res.status(200).json(nadador)
    }catch(error){
        res.status(500).json({
            message: "Error con el servidor",
            error: error.message
        })
    }
}


export const eliminarNadador = async (req, res) => {
  try {
    const { id } = req.params

    const nadador = await Nadador.findById(id)

    if (!nadador) {
      return res.status(404).json({ message: "Nadador no encontrado" })
    }

    await Nadador.findByIdAndDelete(id)

    await User.findByIdAndDelete(nadador.user)

    res.status(200).json({ message: "Nadador eliminado correctamente" })

  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar nadador",
      error: error.message
    })
  }
}