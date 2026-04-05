import { Convocatoria } from "../models/Convocatoria.js"
import Nadador from "../models/Nadadores.js"
import { crearNotificacion } from "./notificacion.controller.js"
import User from "../models/User.js"


export const crearConvocatoria = async (req, res) => {
  try {
    const { nombre, descripcion, lugar, fechaInicio, fechaFin, nadadores } = req.body;

    if (!nombre || !lugar || !fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const nueva = await Convocatoria.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || "",
      lugar: lugar.trim(),
      fechaInicio,
      fechaFin,
      nadadores: nadadores || [],
      creadoPor: req.user._id
    });

    // 🟢 OPTIMIZACIÓN: Notificaciones masivas eficientes
    const enviarNotificaciones = async () => {
      try {
        const idsNadadores = nadadores || [];
        if (idsNadadores.length === 0) return;

        // Traemos todos los usuarios asociados a esos nadadores de UNA SOLA VEZ
        const datosNadadores = await Nadador.find({ _id: { $in: idsNadadores } })
          .populate("user", "_id nombre")
          .select("user")
          .lean();

        const promesasNotificaciones = [];

        // Notificaciones a nadadores
        datosNadadores.forEach(n => {
          if (n.user?._id) {
            promesasNotificaciones.push(crearNotificacion({
             destinatario: n.user._id,
             tipo: "convocatoria_publicada",
             titulo: "Fuiste convocado",
             mensaje: `Convocatoria para "${nombre}" en ${lugar}`,
             metadata: { entidadId: nueva._id }
           }));
          }
        });

        // Notificaciones a admins (Traer solo IDs)
        const admins = await User.find({ rol: "admin" }).select("_id").lean();
        admins.forEach(admin => {
           promesasNotificaciones.push(crearNotificacion({
             destinatario: admin._id,
             tipo: "convocatoria_admin",
             titulo: "Nueva convocatoria",
             mensaje: `${req.user.nombre} publicó "${nombre}"`,
             metadata: { entidadId: nueva._id }
           }));
        });

        // Ejecutar todo en lotes para no saturar el event loop
        await Promise.allSettled(promesasNotificaciones);
      } catch (err) {
        console.error("[CONVOCATORIA_NOTIF_ERROR]:", err);
      }
    };

    enviarNotificaciones(); // Se ejecuta de fondo

    return res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ message: "Error al crear convocatoria" });
  }
};

// Lista convocatorias — solo las que no han terminado (fechaFin >= hoy)
export const getConvocatorias = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 🟢 RAM: .lean() y select para enviar solo lo que el listado necesita
    const convocatorias = await Convocatoria.find({ fechaFin: { $gte: hoy } })
      .populate("creadoPor", "nombre")
      .select("nombre lugar fechaInicio fechaFin creadoPor nadadores") 
      .sort({ fechaInicio: 1 })
      .lean();

    res.json(convocatorias);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// Detalle con nadadores + estado de pago
export const getConvocatoriaDetalle = async (req, res) => {
  try {
    // 🟢 RAM: El deep populate con .lean() ahorra mucha memoria en objetos anidados
    const convocatoria = await Convocatoria.findById(req.params.id)
      .populate("creadoPor", "nombre")
      .populate({
        path: "nadadores",
        populate: { path: "user", select: "nombre correo" },
        select: "user apellido rama pagoAlDia" // Solo lo necesario del nadador
      })
      .lean();

    if (!convocatoria) return res.status(404).json({ message: "No encontrada" });
    res.json(convocatoria);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// Convocatorias de un nadador específico (para su calendario)
export const getConvocatoriasNadador = async (req, res) => {
  try {
    const nadadorId = req.params.id
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const convocatorias = await Convocatoria.find({
      nadadores: nadadorId,
      fechaFin:  { $gte: hoy }
    }).sort({ fechaInicio: 1 })

    res.json(convocatorias)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error", ...(isDev && { error: error.message }) })
  }
}

// Convocatorias del nadador autenticado
export const getMisConvocatorias = async (req, res) => {
  try {
    const nadador = await Nadador.findOne({ user: req.user._id })
    if (!nadador) return res.status(404).json({ message: "Perfil no encontrado" })

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const convocatorias = await Convocatoria.find({
      nadadores: nadador._id,
      fechaFin:  { $gte: hoy }
    }).sort({ fechaInicio: 1 })

    res.json(convocatorias)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error", ...(isDev && { error: error.message }) })
  }
}

export const actualizarConvocatoria = async (req, res) => {
  try {
    const campos = ["nombre","descripcion","lugar","fechaInicio","fechaFin","nadadores","activa"]
    const datos  = {}
    campos.forEach(c => { if (req.body[c] !== undefined) datos[c] = req.body[c] })
    const actualizada = await Convocatoria.findByIdAndUpdate(req.params.id, datos, { new: true })
    if (!actualizada) return res.status(404).json({ message: "Convocatoria no encontrada" })
    res.json(actualizada)
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al actualizar", ...(isDev && { error: error.message }) })
  }
}

export const eliminarConvocatoria = async (req, res) => {
  try {
    await Convocatoria.findByIdAndDelete(req.params.id)
    res.json({ message: "Convocatoria eliminada" })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al eliminar", ...(isDev && { error: error.message }) })
  }
}

// Limpiar convocatorias pasadas (puede llamarse con un cron job o manualmente)
export const limpiarConvocatoriasPasadas = async (req, res) => {
  try {
    const hoy    = new Date()
    const result = await Convocatoria.deleteMany({ fechaFin: { $lt: hoy } })
    res.json({ message: `${result.deletedCount} convocatorias pasadas eliminadas` })
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al limpiar", ...(isDev && { error: error.message }) })
  }
}
