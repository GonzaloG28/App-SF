import bcrypt from "bcrypt"
import mongoose from "mongoose"
import User from "../models/User.js"
import Nadador from "../models/Nadadores.js"

export const crearNadador = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { nombre, apellido, correo, fechaNacimiento, peso, altura, rut, pruebasEspecialidad } = req.body

    // FIX #8: Validación básica de inputs
    if (!nombre || !apellido || !correo || !fechaNacimiento || !rut) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "Faltan campos requeridos" })
    }

    const existeUsuario = await User.findOne({ correo }).session(session)
    if (existeUsuario) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "Ya existe un usuario con ese correo" })
    }

    // La contraseña inicial es el RUT — el nadador deberá cambiarla al primer login
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(rut, salt)

    const nuevoUser = await User.create([{
      nombre,
      correo,
      password: passwordHash,
      rol: "nadador",
      debeCambiarPassword: true
    }], { session })

    await Nadador.create([{
      user: nuevoUser[0]._id,
      apellido,
      fechaNacimiento,
      peso,
      altura,
      rut,
      pruebasEspecialidad,
      // Guardamos quién creó al nadador para poder verificar propiedad
      profesor: req.user._id
    }], { session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({ message: "Nadador creado correctamente" })

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({
      message: "Error al crear nadador",
      ...(isDev && { error: error.message })
    })
  }
}

export const obtenerMiPerfil = async (req, res) => {
  try {
    const nadador = await Nadador.findOne({ user: req.user._id })
      .populate("user", "nombre correo rol debeCambiarPassword")

    if (!nadador) {
      return res.status(404).json({ message: "Perfil no encontrado" })
    }

    res.status(200).json(nadador)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener perfil", ...(isDev && { error: error.message }) })
  }
}

export const actualizarNadadorProfesor = async (req, res) => {
  try {
    const { id } = req.params

    const nadador = await Nadador.findById(id)
    if (!nadador) {
      return res.status(404).json({ message: "Nadador no encontrado" })
    }

    // Campos permitidos en Nadador
    const camposPermitidosNadador = ["fechaNacimiento", "peso", "altura", "rut", "pruebasEspecialidad"]

    // FIX #14: "apellido" pertenece a Nadador, no a User → movido al array correcto
    const camposPermitidosNadadorExtra = ["apellido"]

    // Campos permitidos en User (solo nombre y correo — apellido no existe en User)
    const camposPermitidosUser = ["nombre", "correo"]

    const datosNadador = {}
    ;[...camposPermitidosNadador, ...camposPermitidosNadadorExtra].forEach(campo => {
      if (req.body[campo] !== undefined) datosNadador[campo] = req.body[campo]
    })

    const datosUser = {}
    camposPermitidosUser.forEach(campo => {
      if (req.body[campo] !== undefined) datosUser[campo] = req.body[campo]
    })

    if (Object.keys(datosNadador).length > 0) {
      await Nadador.findByIdAndUpdate(id, datosNadador, { new: true })
    }
    if (Object.keys(datosUser).length > 0) {
      await User.findByIdAndUpdate(nadador.user, datosUser)
    }

    res.json({ message: "Nadador actualizado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al actualizar", ...(isDev && { error: error.message }) })
  }
}

export const actualizarMiPerfil = async (req, res) => {
  try {
    const userId = req.user._id

    const nadador = await Nadador.findOne({ user: userId })
    if (!nadador) {
      return res.status(404).json({ message: "Perfil no encontrado" })
    }

    const camposPermitidos = ["correo", "peso", "altura"]

    const datosUser = {}
    const datosNadador = {}

    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        if (campo === "correo") datosUser.correo = req.body.correo
        else datosNadador[campo] = req.body[campo]
      }
    })

    if (Object.keys(datosNadador).length > 0) {
      await Nadador.findByIdAndUpdate(nadador._id, datosNadador)
    }
    if (Object.keys(datosUser).length > 0) {
      await User.findByIdAndUpdate(userId, datosUser)
    }

    res.json({ message: "Perfil actualizado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al actualizar perfil", ...(isDev && { error: error.message }) })
  }
}

export const obtenerNadadores = async (req, res) => {
  try {
    const { categoria, nombre } = req.query

    const nadadores = await Nadador.find()
      .populate("user", "nombre apellido correo rol")

    const filtrados = nadadores.filter(n => {
      const coincideCategoria = categoria ? n.categoria === categoria : true
      const coincideNombre = nombre
        ? n.user.nombre.toLowerCase().includes(nombre.toLowerCase())
        : true
      return coincideCategoria && coincideNombre
    })

    res.status(200).json(filtrados)

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error con el servidor", ...(isDev && { error: error.message }) })
  }
}

export const obtenerNadadorPorId = async (req, res) => {
  try {
    const nadador = await Nadador.findById(req.params.id)
      .populate("user", "nombre correo rol")
    if (!nadador) {
      return res.status(404).json({ message: "Nadador no encontrado" })
    }
    res.status(200).json(nadador)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error con el servidor", ...(isDev && { error: error.message }) })
  }
}

export const eliminarNadador = async (req, res) => {
  try {
    const { id } = req.params
    const profesorId = req.user._id

    const nadador = await Nadador.findById(id)
    if (!nadador) {
      return res.status(404).json({ message: "Nadador no encontrado" })
    }

    // FIX #6: Verificar que el profesor que elimina sea el responsable del nadador.
    // Sin esto, cualquier profesor autenticado podía eliminar nadadores de otros profesores.
    if (nadador.profesor && nadador.profesor.toString() !== profesorId.toString()) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este nadador" })
    }

    await Nadador.findByIdAndDelete(id)
    await User.findByIdAndDelete(nadador.user)

    res.status(200).json({ message: "Nadador eliminado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al eliminar nadador", ...(isDev && { error: error.message }) })
  }
}
