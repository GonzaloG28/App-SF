import bcrypt from "bcrypt"
import mongoose from "mongoose"
import User from "../models/User.js"
import Nadador from "../models/Nadadores.js"

export const crearNadador = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { nombre, apellido, correo, fechaNacimiento, peso, altura, rut, pruebasEspecialidad } = req.body

    if (!nombre || !apellido || !correo || !fechaNacimiento || !rut) {
      await session.abortTransaction(); session.endSession()
      return res.status(400).json({ message: "Faltan campos requeridos" })
    }

    const existeUsuario = await User.findOne({ correo }).session(session)
    if (existeUsuario) {
      await session.abortTransaction(); session.endSession()
      return res.status(400).json({ message: "Ya existe un usuario con ese correo" })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(rut, salt)

    const nuevoUser = await User.create([{
      nombre, correo, password: passwordHash,
      rol: "nadador", debeCambiarPassword: true
    }], { session })

    await Nadador.create([{
      user: nuevoUser[0]._id,
      apellido, fechaNacimiento, peso, altura, rut,
      pruebasEspecialidad, profesor: req.user._id,
      rama:    rama || "competitivo"
    }], { session })

    await session.commitTransaction(); session.endSession()
    const admins = await User.find({ rol: "admin" }).select("_id")
      for (const admin of admins) {
        await crearNotificacion({
          destinatario: admin._id,
          tipo:    "nadador_creado",
          titulo:  "Nuevo nadador registrado",
          mensaje: `${nombre} ${apellido} fue registrado como nadador ${rama === "formativo" ? "formativo" : "competitivo"}`,
          metadata: { nadadorNombre: `${nombre} ${apellido}` }
        })
      }
    res.status(201).json({ message: "Nadador creado correctamente" })

  } catch (error) {
    await session.abortTransaction(); session.endSession()
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al crear nadador", ...(isDev && { error: error.message }) })
  }
}

export const obtenerMiPerfil = async (req, res) => {
  try {
    const nadador = await Nadador.findOne({ user: req.user._id })
      // Incluir lastEmailChange para que el frontend calcule la cuenta regresiva
      .populate("user", "nombre correo rol debeCambiarPassword lastEmailChange")

    if (!nadador) return res.status(404).json({ message: "Perfil no encontrado" })
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
    if (!nadador) return res.status(404).json({ message: "Nadador no encontrado" })

    const camposNadador = ["fechaNacimiento", "peso", "altura", "rut", "pruebasEspecialidad", "apellido", "rama"]
    const camposUser    = ["nombre", "correo"]

    const datosNadador = {}
    camposNadador.forEach(campo => {
      if (req.body[campo] !== undefined && req.body[campo] !== "") {
        datosNadador[campo] = req.body[campo]
      }
    })

    const datosUser = {}
    camposUser.forEach(campo => {
      if (req.body[campo] !== undefined && req.body[campo] !== "") {
        datosUser[campo] = req.body[campo]
      }
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
    if (!nadador) return res.status(404).json({ message: "Perfil no encontrado" })

    const datosNadador = {}
    const datosUser    = {}

    // Peso y altura — sin restricción
    if (req.body.peso   !== undefined && req.body.peso   !== "") datosNadador.peso   = req.body.peso
    if (req.body.altura !== undefined && req.body.altura !== "") datosNadador.altura = req.body.altura

    // Correo — máximo 1 vez cada 14 días
    if (req.body.correo !== undefined && req.body.correo !== "") {
      const user = await User.findById(userId).select("lastEmailChange correo")

      // No cambiar si es el mismo correo
      if (req.body.correo !== user.correo) {
        const DIAS_LIMITE = 14
        const MS_LIMITE   = DIAS_LIMITE * 24 * 60 * 60 * 1000

        if (user.lastEmailChange) {
          const msPasados = Date.now() - new Date(user.lastEmailChange).getTime()
          if (msPasados < MS_LIMITE) {
            const diasRestantes = Math.ceil((MS_LIMITE - msPasados) / (24 * 60 * 60 * 1000))
            return res.status(429).json({
              message: `Solo puedes cambiar el correo 1 vez cada ${DIAS_LIMITE} días.`,
              diasRestantes,
              // Fecha exacta en que podrá cambiar de nuevo
              puedeDesde: new Date(new Date(user.lastEmailChange).getTime() + MS_LIMITE)
            })
          }
        }

        datosUser.correo          = req.body.correo
        datosUser.lastEmailChange = new Date()
      }
    }

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
    const nadadores = await Nadador.find().populate("user", "nombre apellido correo rol")
    const filtrados = nadadores.filter(n => {
      const coincideCategoria = categoria ? n.categoria === categoria : true
      const coincideNombre    = nombre    ? n.user.nombre.toLowerCase().includes(nombre.toLowerCase()) : true
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
    const nadador = await Nadador.findById(req.params.id).populate("user", "nombre correo rol")
    if (!nadador) return res.status(404).json({ message: "Nadador no encontrado" })
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
    if (!nadador) return res.status(404).json({ message: "Nadador no encontrado" })

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
