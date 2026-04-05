import Mensaje from "../models/Mensaje.js"
import User    from "../models/User.js"
import Nadador from "../models/Nadadores.js"
import xss from "xss";
import { crearNotificacion } from "./notificacion.controller.js"

// Reglas de mensajería: quién puede hablar con quién
const puedeEnviar = (rolEmisor, rolReceptor) => {
  const permitidos = {
    nadador:  ["profesor", "admin"],
    profesor: ["nadador", "admin"],
    admin:    ["nadador", "profesor", "admin"]  // admin puede con todos
  }
  return permitidos[rolEmisor]?.includes(rolReceptor) ?? false
}

// POST /api/mensajes — enviar mensaje
export const enviarMensaje = async (req, res) => {
  try {
    const { receptorId, contenido } = req.body;

    // 🟢 SEGURIDAD: Sanitizar contenido para evitar XSS
    const contenidoLimpio = xss(contenido?.trim());
    if (!receptorId || !contenidoLimpio) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const receptor = await User.findById(receptorId).select("rol nombre").lean();
    if (!receptor) return res.status(404).json({ message: "Receptor no encontrado" });

    if (!puedeEnviar(req.user.rol, receptor.rol)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // 🟢 RAM: Al crear, no guardamos el objeto completo en memoria, solo lo necesario
    const mensaje = await Mensaje.create({
      emisor: req.user._id,
      receptor: receptorId,
      contenido: contenidoLimpio
    });

    // 🟢 OPTIMIZACIÓN SOCKET: En lugar de volver a consultar a la DB con populate,
    // montamos el objeto básico manualmente si es posible, o usamos .lean()
    const mensajePopulado = {
      ...mensaje.toObject(),
      emisor: { _id: req.user._id, nombre: req.user.nombre, rol: req.user.rol },
      receptor: { _id: receptor._id, nombre: receptor.nombre, rol: receptor.rol }
    };

    const io = req.app.get("io");
    const usuariosConectados = req.app.get("usuariosConectados");
    const receptorSocketId = usuariosConectados[receptorId];

    if (receptorSocketId) {
      io.to(receptorSocketId).emit("nuevo_mensaje", mensajePopulado);
    }

    // Notificación en segundo plano (sin await para no bloquear la respuesta)
    crearNotificacion({
      destinatario: receptorId,
      tipo: "mensaje_recibido",
      titulo: "Nuevo mensaje",
      mensaje: `${req.user.nombre}: ${contenidoLimpio.slice(0, 50)}...`,
      metadata: { entidad: mensaje._id }
    }).catch(err => console.error("Error notificación:", err));

    res.status(201).json(mensajePopulado);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// GET /api/mensajes/conversacion/:userId — historial con un usuario
export const getConversacion = async (req, res) => {
  try {
    const { userId } = req.params;
    const miId = req.user._id;
    // Recibimos página de la query, por defecto 1
    const page = parseInt(req.query.page) || 1;
    const limit = 30; // 30 mensajes por carga es ideal para móviles
    const skip = (page - 1) * limit;

    const mensajes = await Mensaje.find({
      $or: [
        { emisor: miId, receptor: userId },
        { emisor: userId, receptor: miId }
      ]
    })
      .sort({ createdAt: -1 }) // Traemos los últimos primero
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() es OBLIGATORIO aquí para ahorrar RAM

    // Invertimos para que el front los vea en orden cronológico
    const mensajesOrdenados = mensajes.reverse();

    // Actualizar leídos (Solo si hay mensajes nuevos para no saturar la DB)
    Mensaje.updateMany(
      { emisor: userId, receptor: miId, leido: false },
      { leido: true }
    ).exec(); // .exec() permite que corra en "background"

    res.json(mensajesOrdenados);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// GET /api/mensajes/contactos — lista de personas con quienes puedo hablar
export const getContactos = async (req, res) => {
  try {
    const { rol, _id } = req.user
    let rolesPermitidos = (rol === "nadador") ? ["profesor", "admin"] : ["nadador", "profesor", "admin"];

    // 1. Traer todos los contactos de un golpe
    const contactos = await User.find({
      rol: { $in: rolesPermitidos },
      _id: { $ne: _id }
    }).select("nombre correo rol").lean();

    const contactoIds = contactos.map(c => c._id);

    // 2. Traer todos los apellidos de nadadores en UNA sola consulta
    const nadadores = await Nadador.find({ user: { $in: contactoIds } }).select("user apellido").lean();
    const apellidosMap = {};
    nadadores.forEach(n => { apellidosMap[n.user.toString()] = n.apellido });

    // 3. Traer conteo de no leídos de UNA sola vez usando agregación (MUCHO más rápido)
    const conteoNoLeidos = await Mensaje.aggregate([
      { $match: { receptor: _id, leido: false, emisor: { $in: contactoIds } } },
      { $group: { _id: "$emisor", total: { $sum: 1 } } }
    ]);
    const noLeidosMap = {};
    conteoNoLeidos.forEach(item => { noLeidosMap[item._id.toString()] = item.total });

    // 4. Montar el resultado final
    // Nota: El "ultimoMensaje" sigue siendo costoso por contacto, 
    // pero al menos ya quitamos las otras 2 consultas por cada uno.
    const contactosConDatos = await Promise.all(contactos.map(async (c) => {
      const ultimoMensaje = await Mensaje.findOne({
        $or: [ { emisor: _id, receptor: c._id }, { emisor: c._id, receptor: _id } ]
      }).sort({ createdAt: -1 }).select("contenido createdAt").lean();

      return {
        ...c,
        apellido: apellidosMap[c._id.toString()] || "",
        noLeidos: noLeidosMap[c._id.toString()] || 0,
        ultimoMensaje
      }
    }));

    res.json(contactosConDatos);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
}

// GET /api/mensajes/no-leidos — total de mensajes no leídos (para badge)
export const getNoLeidos = async (req, res) => {
  try {
    const cantidad = await Mensaje.countDocuments({
      receptor: req.user._id,
      leido:    false
    })
    res.json({ cantidad })
  } catch (error) {
    res.status(500).json({ message: "Error", cantidad: 0 })
  }
}