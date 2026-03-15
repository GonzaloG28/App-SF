import Entrenamiento from "../models/Entrenamiento.js";
import Nadador from "../models/Nadadores.js";
import { uploadToCloudinary } from "../middleware/multerMiddleware.js";
import admin from 'firebase-admin';

// CREAR Y ENVIAR ENTRENAMIENTO (Para el Profesor)
export const crearEntrenamiento = async (req, res) => {
  
  try {
    const { titulo, tipo, contenido, notas, destinatarios } = req.body;
    
    // 1. Inicializamos la URL como null
    let archivoUrl = null;

    // 2. Si hay un archivo, lo subimos a Firebase y esperamos la URL
    if (req.file) {
      console.log("Subiendo archivo a Firebase...");
      archivoUrl = await uploadToCloudinary(req.file);
    }

    // 3. Creamos el entrenamiento usando la nueva URL de Firebase
    const nuevoEntrenamiento = new Entrenamiento({
      titulo,
      tipo,
      contenido,
      notasProfesor: notas,
      // Manejamos si destinatarios llega como string (por FormData) o como objeto
      destinatarios: typeof destinatarios === 'string' ? JSON.parse(destinatarios) : destinatarios,
      profesor: req.user._id,
      archivoUrl: archivoUrl // URL generada por Firebase
    });

    await nuevoEntrenamiento.save();
    res.status(201).json({ 
      message: "Entrenamiento enviado correctamente",
      url: archivoUrl 
    });

  } catch (error) {
    console.error("Error en crearEntrenamiento:", error);
    res.status(500).json({ 
      message: "Error al crear entrenamiento", 
      error: error.message 
    });
  }
};

// OBTENER ENTRENAMIENTOS PARA UN NADADOR ESPECÍFICO
export const getMisEntrenamientos = async (req, res) => {
  try {
    // 1. Buscamos el perfil del nadador
    const miPerfil = await Nadador.findOne({ user: req.user._id });

    if (!miPerfil) {
      return res.status(404).json({ message: "Perfil de nadador no encontrado" });
    }

    // 2. PRIMERO buscamos los entrenamientos en la base de datos
    // Usamos .lean() para que nos devuelva objetos simples de JS y poder agregarles la propiedad .completado
    const entrenamientos = await Entrenamiento.find({ 
      destinatarios: miPerfil._id 
    }).sort({ fecha: -1 }).lean();

    // 3. AHORA SÍ usamos .map sobre la variable 'entrenamientos' (que es un Array)
    const entrenamientosConEstado = entrenamientos.map(ent => ({
      ...ent,
      completado: ent.completadoPor?.some(
        c => c.nadador?.toString() === miPerfil._id.toString()
      ) || false
    }));

    res.json(entrenamientosConEstado);
  } catch (error) {
    console.error("Error al obtener entrenamientos:", error);
    res.status(500).json({ 
      message: "Error al obtener entrenamientos", 
      error: error.message 
    });
  }
};

export const completarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params; 
    const miPerfil = await Nadador.findOne({ user: req.user._id });

    if (!miPerfil) {
      return res.status(404).json({ message: "Perfil de nadador no encontrado" });
    }

    // 1. Verificamos si ya lo completó para no resetear su hora
    const yaCompletado = await Entrenamiento.findOne({
      _id: id,
      "completadoPor.nadador": miPerfil._id
    });

    if (yaCompletado) {
      return res.status(400).json({ message: "Ya habías marcado este entrenamiento como completado" });
    }

    // 2. Usamos $push para añadir el objeto con el ID y la HORA ACTUAL
    await Entrenamiento.findByIdAndUpdate(id, {
      $push: { 
        completadoPor: { 
          nadador: miPerfil._id, 
          fechaCompletado: new Date() // <--- Esta es la clave
        } 
      }
    });

    res.json({ message: "¡Entrenamiento completado! Buen trabajo." });
  } catch (error) {
    console.error("Error al completar:", error);
    res.status(500).json({ message: "Error al marcar como completado" });
  }
};

export const getReporteProfesor = async (req, res) => {
  try {
    const profesorId = req.user._id || req.user.id;
    // Contamos nadadores usando el modelo correcto
    const totalAlumnos = await Nadador.countDocuments();

    const entrenamientos = await Entrenamiento.find({ profesor: profesorId })
      .populate({
        path: 'completadoPor.nadador',
        model: 'Nadador', // <--- Referencia explícita al modelo que me pasaste
        populate: {
          path: 'user',
          model: 'User', // <--- Referencia al modelo User
          select: 'nombre'
        }
      })
      .sort({ fecha: -1 })
      .lean();

    const reporte = entrenamientos.map(ent => ({
      _id: ent._id,
      titulo: ent.titulo,
      fecha: ent.fecha,
      completados: ent.completadoPor?.length || 0,
      totalAlumnos: totalAlumnos,
      detallesCompletados: ent.completadoPor?.map(c => ({
        // Agregamos el apellido también si quieres, ya que está en tu modelo
        nombre: c.nadador?.user?.nombre 
                ? `${c.nadador.user.nombre} ${c.nadador.apellido || ''}` 
                : "Atleta Desconocido", 
        hora: c.fechaCompletado
      })) || []
    }));

    res.json(reporte);
  } catch (error) {
    console.error("ERROR DETALLADO:", error);
    res.status(500).json({ message: "Error al obtener reporte" });
  }
};

// Asegúrate de tener esta importación al principio de tu archivo de controlador
import { v2 as cloudinary } from 'cloudinary';

export const eliminarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const profesorId = req.user._id || req.user.id;

    // 1. Buscamos el entrenamiento y verificamos propiedad
    const entrenamiento = await Entrenamiento.findOne({ _id: id, profesor: profesorId });

    if (!entrenamiento) {
      return res.status(404).json({ 
        message: "Entrenamiento no encontrado o no tienes permiso para eliminarlo" 
      });
    }

    // 2. Si el entrenamiento tiene un archivo adjunto, lo borramos de Cloudinary
    if (entrenamiento.archivoUrl) {
      try {
        // Las URLs de Cloudinary tienen este formato: 
        // https://res.cloudinary.com/demo/image/upload/v12345/entrenamientos/nombre_archivo.jpg
        
        // Extraemos el public_id:
        // 1. Obtenemos la última parte (nombre_archivo.jpg)
        const urlParts = entrenamiento.archivoUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1]; 
        
        // 2. Quitamos la extensión (.jpg, .pdf, etc) para tener solo el ID
        const publicId = lastPart.split('.')[0];
        
        // 3. El ID completo en Cloudinary incluye la carpeta: 'entrenamientos/ID'
        const fullPublicId = `entrenamientos/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId);
        console.log("✅ Archivo eliminado de Cloudinary:", fullPublicId);
      } catch (cloudError) {
        console.error("⚠️ Error al borrar en Cloudinary:", cloudError.message);
      }
    }

    // 3. Finalmente borramos de MongoDB
    await Entrenamiento.findByIdAndDelete(id);

    res.json({ message: "Entrenamiento y archivos eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar:", error);
    res.status(500).json({ message: "Error al eliminar el entrenamiento" });
  }
};