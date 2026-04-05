import nodemailer from "nodemailer";
import Nadador from "../models/Nadadores.js";
import envs from "./envs.utils.js";
import xss from "xss"; // 🟢 NUEVO: Para evitar inyecciones de código

// 🟢 MEJORA: Activamos el Pool de conexiones para ahorrar RAM y CPU
const transporter = nodemailer.createTransport({
  pool: true,              // Usa un pool de conexiones en lugar de crear una nueva cada vez
  maxConnections: 5,       // Límite de conexiones simultáneas
  maxMessages: 100,        // Máximo de mensajes por conexión antes de renovarla
  host: envs.SMTP_HOST,
  port: envs.SMTP_PORT,
  secure: true, 
  auth: {
    user: envs.SMTP_USER,
    pass: envs.SMTP_PASS,
  },
});

/**
 * Envia un correo automático al nadador y a su apoderado si es menor de edad.
 * @param {String} nadadorId - ID del documento Nadador
 * @param {String} asunto - Título del correo
 * @param {String} mensajeHtml - Cuerpo del mensaje en HTML
 */
export const enviarNotificacionEmail = async (nadadorId, asunto, mensajeHtml) => {
  try {
    // Tu query está perfecta. .lean() y selección específica ahorran mucha RAM.
    const nadador = await Nadador.findById(nadadorId)
      .populate("user", "correo nombre")
      .lean();

    if (!nadador || !nadador.user) return;

    // 🟢 SEGURIDAD: Limpiamos el HTML para evitar ataques de inyección (Phishing/XSS)
    const mensajeLimpio = xss(mensajeHtml);

    const destinatarios = [nadador.user.correo];
    if (nadador.correoApoderado) {
      destinatarios.push(nadador.correoApoderado);
    }

    const mailOptions = {
      from: `"Club de Natación" <${envs.SMTP_USER}>`,
      to: nadador.user.correo, // El correo principal
      // 🟢 MEJORA: Ponemos al apoderado en copia para mantener la estructura profesional
      ...(nadador.correoApoderado && { cc: nadador.correoApoderado }), 
      subject: xss(asunto), // También limpiamos el asunto por si acaso
      html: `
        <div style="font-family: sans-serif; border: 1px solid #e4e4e4; padding: 20px; border-radius: 10px;">
          <h2 style="color: #0056b3;">Hola, ${nadador.user.nombre}</h2>
          <p style="font-size: 16px; color: #333;">${mensajeLimpio}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <footer style="font-size: 12px; color: #777;">
            Este es un correo automático del sistema de gestión deportiva. 
            ${nadador.correoApoderado ? `<br>Copia enviada al apoderado registrado.` : ""}
          </footer>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL SENT]: ${asunto} a ${destinatarios.join(", ")}`);
    return info;

  } catch (error) {
    console.error("[MAIL ERROR]:", error);
  }
};