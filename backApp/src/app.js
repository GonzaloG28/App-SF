import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"  // NUEVO

import envs from "./utils/envs.utils.js"
import connectDB from "./config/db.js"

import nadadorRoutes      from "./routes/nadador.routes.js"
import authRoutes         from "./routes/auth.routes.js"
import userRoutes         from "./routes/user.routes.js"
import competenciaRoutes  from "./routes/competencia.routes.js"
import pruebaRoutes       from "./routes/prueba.routes.js"
import entrenamientoRoutes from "./routes/entrenamiento.routes.js"

const app = express()
connectDB()

// Helmet — headers de seguridad HTTP
app.use(helmet())

// CORS — debe ir ANTES de cookie-parser para que el preflight funcione
const allowedOrigins = [
  "https://app-sf-drab.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error("Bloqueado por CORS: Origen no permitido"))
  },
  // FIX CRÍTICO para cookies: credentials debe ser true.
  // Sin esto el navegador no envía ni recibe cookies cross-origin.
  credentials: true,
  methods:      ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Admin-Token"]
}))

// cookie-parser — necesario para que req.cookies funcione en authMiddleware
app.use(cookieParser())

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes, intenta más tarde." }
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de acceso. Espera 15 minutos." }
})

app.use("/api/", apiLimiter)
app.use("/api/auth/login", loginLimiter)

// Parseo
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Rutas
app.use("/api/auth",          authRoutes)
app.use("/api/nadadores",     nadadorRoutes)
app.use("/api/competencias",  competenciaRoutes)
app.use("/api/pruebas",       pruebaRoutes)
app.use("/api/users",         userRoutes)
app.use("/api/entrenamiento", entrenamientoRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API Club Natacion - Cloud Ready" })
})

// Manejo de errores global
app.use((err, req, res, next) => {
  if (err.message === "Bloqueado por CORS: Origen no permitido") {
    return res.status(403).json({ message: err.message })
  }
  const isDev = process.env.NODE_ENV === "development"
  res.status(500).json({
    message: "Algo salió mal en el servidor",
    ...(isDev && { error: err.message })
  })
})

const PORT = envs.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
