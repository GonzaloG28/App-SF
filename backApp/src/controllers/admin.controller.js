import Nadador from "../models/Nadadores.js"
import { Convocatoria } from "../models/Convocatoria.js"
import User from "../models/User.js"
import bcrypt from "bcrypt"
import Finanzas   from "../models/Finanzas.model.js"
import { crearMovimientoMensualidad } from "./finanzas.controller.js"
import { enviarNotificacionEmail } from "../utils/mailer.utils.js" // Para avisar del pago




const calcularCategoria = (fechaNacimiento) => {
  if (!fechaNacimiento) return "S/C"
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad  = hoy.getFullYear() - nac.getFullYear()
  const mes = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  if (edad < 13) return "Infantil"
  if (edad <= 14) return "JA"
  if (edad <= 17) return "JB"
  return "Mayores"
}

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad  = hoy.getFullYear() - nac.getFullYear()
  const mes = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}
// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    // Usamos countDocuments con lean() implícito (muy rápido)
    const [
      totalCompetitivos, pagadosCompetitivos,
      totalFormativos, pagadosFormativos,
      totalConvocatorias
    ] = await Promise.all([
      Nadador.countDocuments({ rama: "competitivo" }),
      Nadador.countDocuments({ pagoAlDia: true, rama: "competitivo" }),
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
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
}

// GET /api/admin/nadadores
export const getNadadoresAdmin = async (req, res) => {
  try {
    const { tipo = "competitivo", buscar, pago } = req.query;

    // 🟢 MEJORA: Construimos la query dinámicamente para filtrar en la DB, no en RAM
    let query = { rama: tipo };
    
    if (pago === "si") query.pagoAlDia = true;
    if (pago === "no") query.pagoAlDia = false;

    // 🟢 SEGURIDAD Y VELOCIDAD: Filtro de búsqueda directamente en MongoDB usando Regex
    if (buscar) {
      const regex = new RegExp(buscar, 'i'); // 'i' para que no importe mayúsculas/minúsculas
      query.$or = [
        { apellido: regex },
        { rut: regex }
        // Para buscar por nombre de usuario (que está en otra colección), 
        // lo ideal es buscar primero el ID del usuario o usar un Aggregate.
      ];
    }

    const nadadores = await Nadador.find(query)
          .populate("user", "nombre correo")
          .populate("profesor", "nombre")
          .sort({ apellido: 1 })
          .limit(100)
          .lean()
    
        // FIX: lean() no ejecuta virtuals → calculamos categoria y edad manualmente
        const conCategoria = nadadores.map(n => ({
          ...n,
          edad:      calcularEdad(n.fechaNacimiento),
          categoria: calcularCategoria(n.fechaNacimiento)
        }))
    
        res.json(conCategoria)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener lista" });
  }
}

// PATCH /api/admin/pago/:id
export const togglePagoNadador = async (req, res) => {
  try {
    const { id } = req.params

    const nadador = await Nadador.findById(id)
      .populate("user", "nombre correo")
      .select("pagoAlDia user rama apellido")
      .lean()

    if (!nadador) return res.status(404).json({ message: "No encontrado" })

    const nuevoEstado = !nadador.pagoAlDia

    await Nadador.findByIdAndUpdate(id, {
      pagoAlDia:       nuevoEstado,
      fechaUltimoPago: nuevoEstado ? new Date() : undefined
    })

    // ── INTEGRACIÓN FINANCIERA ──────────────────────────────────────────
    // Si se confirma el pago → crear movimiento de ingreso automáticamente
    if (nuevoEstado) {
      const config = await Finanzas.getConfig()
      const monto  = nadador.rama === "formativo"
        ? config.precioFormativo
        : config.precioCompetitivo

      const nombre = `${nadador.user?.nombre || ""} ${nadador.apellido || ""}`.trim()

      // Solo crear movimiento si el precio está configurado (> 0)
      if (monto > 0) {
        crearMovimientoMensualidad({
          nadadorId:    id,
          nombreNadador: nombre,
          monto,
          adminId:      req.user._id
        }).catch(err => console.error("[FINANZAS_MOV_ERROR]:", err.message))
      }

      // Email en background
      enviarNotificacionEmail(
        id,
        "Confirmación de Pago",
        `Hola ${nadador.user?.nombre}, hemos recibido tu pago mensual.`
      ).catch(e => console.error("Error envío correo:", e))
    }

    res.json({ message: "Estado actualizado", pagoAlDia: nuevoEstado })
  } catch (error) {
    res.status(500).json({ message: "Error" })
  }
}


// POST /api/admin/register
export const registerAdmin = async (req, res) => {
  try {
    const { nombre, correo, password, adminSecret } = req.body;
    
    // 🟢 SEGURIDAD: Solo si conoces una "llave maestra" puedes crear admins
    // Esto evita que alguien que descubra tu ruta cree cuentas de admin
    if (adminSecret !== envs.ADMIN_SECRET) {
      return res.status(401).json({ message: "No tienes permiso para crear administradores" });
    }

    const existe = await User.findOne({ correo }).select("_id").lean();
    if (existe) return res.status(400).json({ message: "Correo ya existe" });

    const salt = await bcrypt.genSalt(12); // 🟢 12 ráfagas es más seguro que 10
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({ 
      nombre, 
      correo: correo.toLowerCase().trim(), 
      password: passwordHash, 
      rol: "admin" 
    });

    res.status(201).json({ message: "Admin creado" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
}