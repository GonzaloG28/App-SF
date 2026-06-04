import express      from "express"
import jwt from "jsonwebtoken"
import http         from "http"         // <-- NUEVO: Servidor HTTP base
import { Server }   from "socket.io"    // <-- NUEVO: Socket.io
import cors         from "cors"
import helmet       from "helmet"
import rateLimit    from "express-rate-limit"
import cookieParser from "cookie-parser"
import envs         from "./utils/envs.utils.js"
import connectDB    from "./config/db.js"

// Rutas
import nadadorRoutes       from "./routes/nadador.routes.js"
import authRoutes          from "./routes/auth.routes.js"
import userRoutes          from "./routes/user.routes.js"
import competenciaRoutes   from "./routes/competencia.routes.js"
import pruebaRoutes        from "./routes/prueba.routes.js"
import entrenamientoRoutes from "./routes/entrenamiento.routes.js"
import notificacionRoutes  from "./routes/notificacion.routes.js"
import adminRoutes         from "./routes/admin.routes.js"
import mensajeRoutes       from "./routes/mensaje.routes.js"
import { convocatoriaRoutes } from "./routes/convocatoria.routes.js"
import finanzasRoutes from "./routes/finanzas.routes.js"

const app = express()
const server = http.createServer(app) // <-- NUEVO: Express ahora corre sobre este servidor

connectDB()

app.set("trust proxy", 1)

// ── 1. SEGURIDAD: helmet ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}))

// ── 2. CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://app-sf-drab.vercel.app",
  "https://app-nsf.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || envs.NODE_ENV === "development") {
      return callback(null, true)
    }
    callback(new Error("Bloqueado por CORS"))
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Admin-Token"],
  optionsSuccessStatus: 200,
  maxAge: 600
}
app.use(cors(corsOptions))

// ── NUEVO: CONFIGURACIÓN WEBSOCKETS (Socket.io) ──────────────────────
const io = new Server(server, { cors: corsOptions });

// ── NUEVO: MIDDLEWARE DE SEGURIDAD PARA WEBSOCKETS ──────────────────
// Esto ahorra RAM al rechazar conexiones falsas antes de que ocupen memoria
io.use((socket, next) => {
  const token = socket.handshake.auth.token; // El token que enviamos desde el Front
  if (!token) return next(new Error("No autorizado"));

  try {
    const decoded = jwt.verify(token, envs.JWT_SECRET);
    socket.user = decoded; // Guardamos los datos del usuario en el objeto socket
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});

// Diccionario en memoria
const usuariosConectados = {}

io.on("connection", (socket) => {
  const userId = socket.user?.id || socket.user?._id;
  
  if (userId) {
    // Guardamos el ID del socket. 
    // Si el usuario ya estaba, esto actualiza a la conexión más reciente.
    usuariosConectados[userId] = socket.id;
    console.log(`[SOCKET] Conectado: ${userId}`);
  }

  socket.on("disconnect", () => {
    // Solo borramos si el socket que se cierra es el que tenemos registrado
    if (usuariosConectados[userId] === socket.id) {
      delete usuariosConectados[userId];
    }
    console.log(`[SOCKET] Desconectado: ${userId}`);
  });
});

// Compartimos io y la lista de conectados con toda la app
app.set("io", io)
app.set("usuariosConectados", usuariosConectados)
// ─────────────────────────────────────────────────────────────────────

// ── 3. PARSERS ───────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ limit: "1mb", extended: true }))
app.use(cookieParser())

// ── 4. SANITIZACIÓN MANUAL ──────────────────────────────────────────
app.use((req, _res, next) => {
  const sanitizar = (obj) => {
    if (!obj || typeof obj !== "object") return
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key]
      } else {
        sanitizar(obj[key])
      }
    }
  }
  sanitizar(req.body)
  sanitizar(req.query)
  next()
})

// ── 5. RATE LIMITING ─────────────────────────────────────────────────
const generalLimit = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            600,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { message: "Demasiadas solicitudes, intenta más tarde" }
})

const loginLimit = rateLimit({
  windowMs:       60 * 1000,
  max:            150,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { message: "Demasiados intentos de login, espera un minuto" }
})

app.use("/api/", generalLimit)
app.use("/api/auth/login", loginLimit)

// ── 6. RUTAS ─────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes)
app.use("/api/nadadores",     nadadorRoutes)
app.use("/api/competencias",  competenciaRoutes)
app.use("/api/pruebas",       pruebaRoutes)
app.use("/api/users",         userRoutes)
app.use("/api/entrenamiento", entrenamientoRoutes)
app.use("/api/notificaciones", notificacionRoutes)
app.use("/api/admin",         adminRoutes)
app.use("/api/finanzas", finanzasRoutes)
app.use("/api/convocatorias", convocatoriaRoutes)
app.use("/api/mensajes",      mensajeRoutes)

app.get("/", (_req, res) => res.json({ status: "ok", env: envs.NODE_ENV }))
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }))

// ── 7. ERROR HANDLER GLOBAL ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err.message === "Bloqueado por CORS") {
    return res.status(403).json({ message: "Acceso no autorizado" })
  }
  console.error(`[ERROR ${new Date().toISOString()}] ${req.method} ${req.path}: ${err.message}`)
  const isDev = envs.NODE_ENV === "development"
  res.status(err.status || 500).json({
    message: isDev ? err.message : "Error interno del servidor",
    ...(isDev && { stack: err.stack })
  })
})

const PORT = envs.PORT || 5000

// <-- NUEVO: Arrancamos el 'server' (que tiene HTTP + Sockets), no 'app'
server.listen(PORT, "0.0.0.0", () =>
  console.log(`[SERVER] Puerto ${PORT} | Entorno: ${envs.NODE_ENV} | WebSockets Activos`)
)