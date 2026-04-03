import Nadador from "../models/Nadadores.js"
import { NadadorFormativo } from "../models/NadadorFormativo.js"
import { Convocatoria } from "../models/Convocatoria.js"
import User from "../models/User.js"
import bcrypt               from "bcrypt"

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const [
      totalCompetitivos, pagadosCompetitivos,
      totalFormativos, pagadosFormativos,
      totalConvocatorias
    ] = await Promise.all([
      Nadador.countDocuments({ $or: [{ rama: "competitivo" }, { rama: { $exists: false } }] }),
      Nadador.countDocuments({ pagoAlDia: true, $or: [{ rama: "competitivo" }, { rama: { $exists: false } }] }),
      Nadador.countDocuments({ rama: "formativo" }),
      Nadador.countDocuments({ rama: "formativo", pagoAlDia: true }),
      Convocatoria.countDocuments({ fechaFin: { $gte: new Date() } })
    ]);

    res.json({
      competitivos: { total: totalCompetitivos, pagados: pagadosCompetitivos, impagos: totalCompetitivos - pagadosCompetitivos },
      formativos: { total: totalFormativos, pagados: pagadosFormativos, impagos: totalFormativos - pagadosFormativos },
      convocatoriasActivas: totalConvocatorias,
      totalMiembros: totalCompetitivos + totalFormativos
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener estadísticas", ...(isDev && { error: error.message }) })
  }
}

// GET /api/admin/nadadores — todos los nadadores con estado de pago
export const getNadadoresAdmin = async (req, res) => {
  try {
    const { tipo = "competitivo", buscar, pago } = req.query;

    // Filtro base unificado
    let query = {
      ...(tipo === "formativo" 
        ? { rama: "formativo" } 
        : { $or: [{ rama: "competitivo" }, { rama: { $exists: false } }] }
      )
    };

    if (pago === "si") query.pagoAlDia = true;
    if (pago === "no") query.pagoAlDia = false;

    // NO usar .lean() para que 'categoria' (Virtual) se incluya en la respuesta
    const nadadores = await Nadador.find(query)
      .populate("user", "nombre correo")
      .populate("profesor", "nombre")
      .sort({ apellido: 1 });

    let filtrados = nadadores;
    if (buscar) {
      const b = buscar.toLowerCase();
      filtrados = nadadores.filter(n => {
        const nombreUser = n.user?.nombre?.toLowerCase() || n.nombre?.toLowerCase() || "";
        const apellido = n.apellido?.toLowerCase() || "";
        return nombreUser.includes(b) || apellido.includes(b);
      });
    }

    // Convertimos a JSON manualmente manteniendo los virtuals
    res.json(filtrados.map(n => n.toJSON({ virtuals: true })));
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al obtener nadadores", ...(isDev && { error: error.message }) })
  }
}

// PATCH /api/admin/pago/:id — toggle pago de un nadador competitivo
export const togglePagoNadador = async (req, res) => {
  try {
    const { id }   = req.params
    const nadador  = await Nadador.findById(id)
    if (!nadador) return res.status(404).json({ message: "Nadador no encontrado" })

    const nuevoPago = !nadador.pagoAlDia
    await Nadador.findByIdAndUpdate(id, {
      pagoAlDia:       nuevoPago,
      fechaUltimoPago: nuevoPago ? new Date() : nadador.fechaUltimoPago
    })

    res.json({
      message:    nuevoPago ? "Pago confirmado" : "Pago marcado como pendiente",
      pagoAlDia:  nuevoPago
    })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al actualizar pago", ...(isDev && { error: error.message }) })
  }
}

// PATCH /api/admin/pago-formativo/:id — toggle pago de un nadador formativo
export const togglePagoFormativo = async (req, res) => {
  try {
    const { id }    = req.params
    const formativo = await NadadorFormativo.findById(id)
    if (!formativo) return res.status(404).json({ message: "Nadador formativo no encontrado" })

    const nuevoPago = !formativo.pagoAlDia
    await NadadorFormativo.findByIdAndUpdate(id, {
      pagoAlDia:       nuevoPago,
      fechaUltimoPago: nuevoPago ? new Date() : formativo.fechaUltimoPago
    })

    res.json({ message: nuevoPago ? "Pago confirmado" : "Pago pendiente", pagoAlDia: nuevoPago })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al actualizar pago", ...(isDev && { error: error.message }) })
  }
}

// POST /api/admin/register — crear cuenta de admin
export const registerAdmin = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body
    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }
    const existe = await User.findOne({ correo })
    if (existe) return res.status(400).json({ message: "Ya existe un usuario con ese correo" })

    const salt         = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    await User.create({ nombre, correo, password: passwordHash, rol: "admin" })
    res.status(201).json({ message: "Administrador creado correctamente" })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al crear admin", ...(isDev && { error: error.message }) })
  }
}
