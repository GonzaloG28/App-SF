import Entrenamiento from "../models/Entrenamiento.js"
import Nadador from "../models/Nadadores.js"
import { uploadToCloudinary } from "../middleware/multerMiddleware.js"
import { v2 as cloudinary } from "cloudinary"
import { crearNotificacion } from "./notificacion.controller.js"

//crea el entrenamiento(cloudinary para archivos)
export const crearEntrenamiento = async (req, res) => {
  let archivoPublicId = null; // Lo declaramos fuera para poder borrarlo si falla la DB
  try {
    const { titulo, tipo, contenido, notas, destinatarios } = req.body;

    let archivoUrl = null;
    if (req.file) {
      const resultado = await uploadToCloudinary(req.file);
      archivoUrl = resultado.url;
      archivoPublicId = resultado.publicId;
    }

    const listaDestinatarios = typeof destinatarios === "string" 
      ? JSON.parse(destinatarios) 
      : destinatarios;

    const nuevoEntrenamiento = await Entrenamiento.create({
      titulo: titulo.trim(),
      tipo,
      contenido,
      notasProfesor: notas,
      destinatarios: listaDestinatarios,
      profesor: req.user._id,
      archivoUrl,
      archivoPublicId
    });

    // 🟢 OPTIMIZACIÓN: Notificaciones en segundo plano con consulta masiva
    const dispararNotificaciones = async () => {
      const nadadores = await Nadador.find({ _id: { $in: listaDestinatarios } })
        .select("user")
        .lean();

      const promesas = nadadores.map(n => 
        crearNotificacion({
          destinatario: n.user,
          tipo: "entrenamiento_asignado",
          titulo: "Nuevo entrenamiento",
          mensaje: `Plan: "${titulo}"`,
          metadata: { entidad: nuevoEntrenamiento._id }
        })
      );
      await Promise.allSettled(promesas);
    };

    dispararNotificaciones(); // No bloqueamos el 'res.json'

    res.status(201).json({ message: "Entrenamiento enviado" });

  } catch (error) {
    // 🟢 SEGURIDAD: Si la DB falla pero el archivo se subió, lo borramos de Cloudinary
    if (archivoPublicId) {
      cloudinary.uploader.destroy(archivoPublicId).catch(err => console.error("Error limpieza:", err));
    }
    res.status(500).json({ message: "Error al crear" });
  }
}

//filtra entrenamientos por nadador
export const getMisEntrenamientos = async (req, res) => {
  try {
    // 🟢 RAM: .select() para no traer datos innecesarios del perfil
    const miPerfil = await Nadador.findOne({ user: req.user._id }).select("_id").lean();
    if (!miPerfil) return res.status(404).json({ message: "No encontrado" });

    // 🟢 VELOCIDAD: Filtramos directamente y usamos .lean()
    const entrenamientos = await Entrenamiento.find({ destinatarios: miPerfil._id })
      .select("-notasProfesor -__v") // El alumno no necesita ver las notas privadas del profesor
      .sort({ createdAt: -1 })
      .lean();

    // 🟢 PERFORMANCE: Transformación ligera
    const data = entrenamientos.map(ent => ({
      ...ent,
      completado: ent.completadoPor?.some(c => c.nadador.toString() === miPerfil._id.toString())
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

//marca completado en perfil profesor
export const completarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params
    const miPerfil = await Nadador.findOne({ user: req.user._id })

    if (!miPerfil) {
      return res.status(404).json({ message: "Perfil de nadador no encontrado" })
    }

    const yaCompletado = await Entrenamiento.findOne({
      _id: id,
      "completadoPor.nadador": miPerfil._id
    })

    if (yaCompletado) {
      return res.status(400).json({ message: "Ya habías marcado este entrenamiento como completado" })
    }

    const entrenamiento = await Entrenamiento.findByIdAndUpdate(
      id,
      { $push: { completadoPor: { nadador: miPerfil._id, fechaCompletado: new Date() } } },
      { new: true }
    )

    // NOTIFICACIÓN AL PROFESOR: avisarle que un nadador completó el entrenamiento
    await crearNotificacion({
      destinatario: entrenamiento.profesor, // User._id del profesor
      tipo:         "entrenamiento_completado",
      titulo:       "Entrenamiento completado",
      mensaje:      `${miPerfil.apellido || "Un atleta"} completó "${entrenamiento.titulo}"`,
      metadata: {
        fecha:         new Date(),
        entidad:       entrenamiento.titulo,
        nadadorNombre: miPerfil.apellido || ""
      }
    })

    res.json({ message: "¡Entrenamiento completado! Buen trabajo." })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al marcar como completado", ...(isDev && { error: error.message }) })
  }
}

export const getReporteProfesor = async (req, res) => {
  try {
    // 🟢 RAM: Solo traemos reportes de los últimos 3 meses para no saturar la memoria
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const entrenamientos = await Entrenamiento.find({ 
      profesor: req.user._id,
      createdAt: { $gte: tresMesesAtras } 
    })
      .populate({
        path: "completadoPor.nadador",
        select: "apellido",
        populate: { path: "user", select: "nombre" }
      })
      .sort({ createdAt: -1 })
      .lean();

    // 🟢 OPTIMIZACIÓN: Construimos el reporte solo con los datos necesarios
    const reporte = entrenamientos.map(ent => ({
        _id: ent._id,
        titulo: ent.titulo,
        // 🚀 LA LÍNEA QUE FALTABA:
        fecha: ent.fecha || ent.createdAt, 
        estadisticas: {
          completados: ent.completadoPor?.length || 0,
          total: ent.destinatarios?.length || 0
        },
        detalles: ent.completadoPor?.map(c => ({
          nombre: `${c.nadador?.user?.nombre || "Atleta"} ${c.nadador?.apellido || ""}`,
          fecha: c.fechaCompletado
        }))
      }));

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

export const eliminarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params
    const profesorId = req.user._id

    const entrenamiento = await Entrenamiento.findOne({ _id: id, profesor: profesorId })
    if (!entrenamiento) {
      return res.status(404).json({ message: "Entrenamiento no encontrado o no tienes permiso" })
    }

    if (entrenamiento.archivoPublicId) {
      try {
        await cloudinary.uploader.destroy(entrenamiento.archivoPublicId)
      } catch (cloudError) {
        console.error("Error al borrar en Cloudinary:", cloudError.message)
      }
    }

    await Entrenamiento.findByIdAndDelete(id)
    res.json({ message: "Entrenamiento eliminado correctamente" })

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development"
    res.status(500).json({ message: "Error al eliminar el entrenamiento", ...(isDev && { error: error.message }) })
  }
}
