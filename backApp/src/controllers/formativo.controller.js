import { NadadorFormativo } from "../models/NadadorFormativo.js"
import { Nadador }          from "../models/Nadadores.js"
import { User }             from "../models/User.js"
import bcrypt               from "bcrypt"
import mongoose             from "mongoose"

export const crearFormativo = async (req, res) => {
  try {
    const { nombre, apellido, rut, fechaNacimiento, apoderado, telefono, peso, altura, notas } = req.body

    if (!nombre || !apellido || !rut || !fechaNacimiento || !apoderado || !telefono) {
      return res.status(400).json({ message: "Faltan campos requeridos" })
    }

    const existe = await NadadorFormativo.findOne({ rut })
    if (existe) return res.status(400).json({ message: "Ya existe un nadador formativo con ese RUT" })

    const nuevo = await NadadorFormativo.create({
      nombre, apellido, rut, fechaNacimiento, apoderado, telefono,
      peso: peso || 0, altura: altura || 0, notas: notas || "",
      profesor: req.user._id
    })

    res.status(201).json(nuevo)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al crear nadador formativo", ...(isDev && { error: error.message }) })
  }
}

export const getFormativos = async (req, res) => {
  try {
    const { buscar } = req.query
    let query = {}
    if (buscar) query.$or = [
      { nombre:   { $regex: buscar, $options: "i" } },
      { apellido: { $regex: buscar, $options: "i" } }
    ]

    const formativos = await NadadorFormativo.find(query)
      .populate("profesor", "nombre")
      .sort({ apellido: 1 })
    res.json(formativos)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener formativos", ...(isDev && { error: error.message }) })
  }
}

export const getFormativoById = async (req, res) => {
  try {
    const formativo = await NadadorFormativo.findById(req.params.id).populate("profesor", "nombre")
    if (!formativo) return res.status(404).json({ message: "Nadador formativo no encontrado" })
    res.json(formativo)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error", ...(isDev && { error: error.message }) })
  }
}

export const actualizarFormativo = async (req, res) => {
  try {
    const campos = ["nombre","apellido","apoderado","telefono","peso","altura","notas","fechaNacimiento"]
    const datos  = {}
    campos.forEach(c => { if (req.body[c] !== undefined) datos[c] = req.body[c] })
    await NadadorFormativo.findByIdAndUpdate(req.params.id, datos, { new: true })
    res.json({ message: "Actualizado correctamente" })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al actualizar", ...(isDev && { error: error.message }) })
  }
}

export const eliminarFormativo = async (req, res) => {
  try {
    await NadadorFormativo.findByIdAndDelete(req.params.id)
    res.json({ message: "Nadador formativo eliminado" })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al eliminar", ...(isDev && { error: error.message }) })
  }
}

// Promover formativo → nadador competitivo (crea User + Nadador, borra Formativo)
export const promoverFormativo = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { id } = req.params
    const { correo } = req.body

    if (!correo) {
      await session.abortTransaction(); session.endSession()
      return res.status(400).json({ message: "Se requiere un correo para crear la cuenta" })
    }

    const formativo = await NadadorFormativo.findById(id)
    if (!formativo) {
      await session.abortTransaction(); session.endSession()
      return res.status(404).json({ message: "Nadador formativo no encontrado" })
    }

    const existeUser = await User.findOne({ correo }).session(session)
    if (existeUser) {
      await session.abortTransaction(); session.endSession()
      return res.status(400).json({ message: "Ya existe un usuario con ese correo" })
    }

    // Contraseña inicial = RUT
    const salt         = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(formativo.rut, salt)

    const nuevoUser = await User.create([{
      nombre: formativo.nombre, correo,
      password: passwordHash, rol: "nadador", debeCambiarPassword: true
    }], { session })

    await Nadador.create([{
      user:            nuevoUser[0]._id,
      apellido:        formativo.apellido,
      fechaNacimiento: formativo.fechaNacimiento,
      peso:            formativo.peso,
      altura:          formativo.altura,
      rut:             formativo.rut,
      profesor:        formativo.profesor
    }], { session })

    await NadadorFormativo.findByIdAndDelete(id).session(session)

    await session.commitTransaction(); session.endSession()
    res.json({ message: "Nadador promovido a rama competitiva correctamente" })
  } catch (error) {
    await session.abortTransaction(); session.endSession()
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al promover", ...(isDev && { error: error.message }) })
  }
}