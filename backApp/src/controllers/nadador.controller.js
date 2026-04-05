import bcrypt from "bcrypt"
import mongoose from "mongoose"
import User from "../models/User.js"
import Nadador from "../models/Nadadores.js"
import { crearNotificacion } from "./notificacion.controller.js"
import { enviarNotificacionEmail } from "../utils/mailer.utils.js"


const calcularEdad = (fecha) => {
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

// Crear perfil nadador 
export const crearNadador = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      nombre, apellido, correo, fechaNacimiento, peso, altura, rut, 
      pruebasEspecialidad, rama, nombreApoderado, correoApoderado, telefonoApoderado 
    } = req.body;

    // 1. Validaciones de negocio (Igual que antes)
    if (!nombre || !apellido || !correo || !fechaNacimiento || !rut) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const edad = calcularEdad(fechaNacimiento);
    if (edad < 18 && !correoApoderado) {
      return res.status(400).json({ message: "El correo del apoderado es obligatorio para menores" });
    }

    const existeUsuario = await User.findOne({ correo }).session(session).select('_id').lean();
    if (existeUsuario) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // 2. Creación de datos
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rut, salt);

    const [nuevoUser] = await User.create([{
      nombre, correo, password: passwordHash,
      rol: "nadador", debeCambiarPassword: true
    }], { session });

    const [nuevoNadador] = await Nadador.create([{
      user: nuevoUser._id,
      apellido, fechaNacimiento, peso, altura, rut,
      pruebasEspecialidad, profesor: req.user.id,
      rama: rama || "competitivo",
      nombreApoderado, correoApoderado, telefonoApoderado
    }], { session });

    // 🟢 EL COMMIT: Aquí aseguramos los datos en la DB
    await session.commitTransaction();
    session.endSession(); // Cerramos la sesión aquí mismo

    // 3. RESPUESTA INMEDIATA AL CLIENTE
    // Enviamos el 201 ahora. Lo que pase después (correos/notifs) no debe hacer esperar al usuario.
    res.status(201).json({ 
      message: "Nadador y usuario creados correctamente",
      id: nuevoNadador._id 
    });

    // 4. 🟢 AISLAMIENTO TOTAL: Notificaciones y Correos (Fuera del flujo principal)
    // Usamos una función autoejecutable o simplemente no usamos 'await' para no bloquear
    (async () => {
      try {
        // Notificaciones a admins (Cambiamos el for por un Promise.all para más velocidad)
        const admins = await User.find({ rol: "admin" }).select("_id").lean();
        const promesasNotif = admins.map(admin =>
         crearNotificacion({
           destinatario: admin._id,
           tipo: "nadador_creado",
           titulo: "Nuevo nadador",
           mensaje: `${nombre} ${apellido} registrado.`,
           metadata: { entidadId: nuevoNadador._id },
           req   // ← pasar req como campo del objeto, no como primer argumento
         })
       );
        
        await Promise.allSettled([
          ...promesasNotif,
          enviarNotificacionEmail(
            nuevoNadador._id,
            "Bienvenido al Club",
            `Hola ${nombre}, usa tu RUT como contraseña inicial.`
          )
        ]);
      } catch (postError) {
        console.error("[POST-CREATION ERROR]:", postError.message);
      }
    })();

  } catch (error) {
    // Solo entramos aquí si falló la creación de User o Nadador ANTES del commit
    if (session.inAtomicitySession()) {
      await session.abortTransaction();
    }
    session.endSession();
    
    console.error("[CREAR_NADADOR_ERROR]:", error);
    res.status(500).json({ message: error.message || "Error al crear nadador" });
  }
};


// Obtener perfil nadador 

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

// Actualizar perfil nadador Profesor
export const actualizarNadadorProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Buscamos datos actuales (necesitamos el user ID)
    const nadadorActual = await Nadador.findById(id).select("user correoApoderado").lean();
    if (!nadadorActual) return res.status(404).json({ message: "Nadador no encontrado" });

    const { nombre, correo, fechaNacimiento, ...datosNadador } = req.body;

    // 2. Validación de minoría de edad
    if (fechaNacimiento) {
      const nuevaEdad = calcularEdad(fechaNacimiento);
      const tieneCorreoApoderado = req.body.correoApoderado || nadadorActual.correoApoderado;
      
      if (nuevaEdad < 18 && !tieneCorreoApoderado) {
        return res.status(400).json({ message: "Es menor de edad, requiere correo de apoderado" });
      }
      datosNadador.fechaNacimiento = fechaNacimiento;
    }

    // 3. ACTUALIZACIÓN EN DB (Operación Crítica)
    // Usamos Promise.all para que sea atómico en tiempo de ejecución
    await Promise.all([
      Nadador.findByIdAndUpdate(id, { $set: datosNadador }),
      User.findByIdAndUpdate(nadadorActual.user, { 
        $set: { 
          ...(nombre && { nombre }), // Solo actualiza si vienen en el body
          ...(correo && { correo }) 
        } 
      })
    ]);

    // 🟢 RESPUESTA INMEDIATA: Liberamos al profesor para que siga trabajando
    res.json({ message: "Perfil actualizado correctamente" });

    // 4. 🟢 PROCESOS EN SEGUNDO PLANO (Aislados)
    // No usamos 'await' para la respuesta final, permitiendo que corran solos
    (async () => {
      try {
        // Notificación interna (Socket + DB)
        await crearNotificacion({
         destinatario: nadadorActual.user,
         tipo: "perfil_actualizado",
         titulo: "Perfil actualizado",
         mensaje: "Tu profesor ha realizado cambios en tus datos.",
         metadata: { entidadId: id },
         req   // ← campo dentro del objeto
       });

        // Email de aviso
        await enviarNotificacionEmail(
          id,
          "Actualización de Perfil",
          "Se han realizado cambios en los datos de tu perfil por parte de tu profesor."
        );
      } catch (postError) {
        // Si el email falla, solo lo logueamos, el cliente ni se entera
        console.error("[UPDATE_NOTIF_ERROR]:", postError.message);
      }
    })();

  } catch (error) {
    console.error("[ACTUALIZAR_NADADOR_ERROR]:", error);
    // Solo enviamos 500 si la base de datos falló
    if (!res.headersSent) {
      res.status(500).json({ message: "Error al actualizar los datos" });
    }
  }
}

// Actualizar perfil nadador Nadador
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

        datosUser.correo = req.body.correo
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
    const { categoria, nombre, rama } = req.query;

    const nadadores = await Nadador.find()
      .populate("user", "nombre correo")
      .lean(); 

    const filtrados = nadadores.filter(n => {
      
      const edad = calcularEdad(n.fechaNacimiento);
      let catN = "Mayores";
      if (edad < 13) catN = "Infantil";
      else if (edad <= 14) catN = "JA";
      else if (edad <= 17) catN = "JB";

      const coincideCategoria = categoria ? catN === categoria : true;
      const coincideRama = rama ? n.rama === rama : true;
      const busqueda = nombre ? nombre.toLowerCase() : "";
      const nombreCompleto = `${n.user?.nombre} ${n.apellido}`.toLowerCase();
      const coincideNombre = nombre ? nombreCompleto.includes(busqueda) : true;

      return coincideCategoria && coincideNombre && coincideRama;
    });

    res.status(200).json(filtrados);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener lista" });
  }
};



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
