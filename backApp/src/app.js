import express      from "express"
import cors         from "cors"
import helmet       from "helmet"
import rateLimit    from "express-rate-limit"
import cookieParser from "cookie-parser"
import envs         from "./utils/envs.utils.js"
import connectDB    from "./config/db.js"

import nadadorRoutes      from "./routes/nadador.routes.js"
import authRoutes         from "./routes/auth.routes.js"
import userRoutes         from "./routes/user.routes.js"
import competenciaRoutes  from "./routes/competencia.routes.js"
import pruebaRoutes       from "./routes/prueba.routes.js"
import entrenamientoRoutes from "./routes/entrenamiento.routes.js"
import notificacionRoutes from "./routes/notificacion.routes.js"
import adminRoutes        from "./routes/admin.routes.js"
import { formativoRoutes }    from "./routes/formativo.routes.js"
import { convocatoriaRoutes } from "./routes/convocatoria.routes.js"

const app = express()
connectDB()

app.set("trust proxy", 1)
app.use(helmet())

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
    callback(new Error("Bloqueado por CORS"))
  },
  credentials: true,
  methods:      ["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With","X-Admin-Token"]
}))

app.use(cookieParser())

app.use("/api/", rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true, legacyHeaders: false }))
app.use("/api/auth/login", rateLimit({ windowMs: 60*1000, max: 20, standardHeaders: true, legacyHeaders: false }))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

app.use("/api/auth",          authRoutes)
app.use("/api/nadadores",     nadadorRoutes)
app.use("/api/competencias",  competenciaRoutes)
app.use("/api/pruebas",       pruebaRoutes)
app.use("/api/users",         userRoutes)
app.use("/api/entrenamiento", entrenamientoRoutes)
app.use("/api/notificaciones",notificacionRoutes)
app.use("/api/admin",         adminRoutes)
app.use("/api/formativos",    formativoRoutes)
app.use("/api/convocatorias", convocatoriaRoutes)

app.get("/", (req, res) => res.json({ status: "ok", message: "API Club Natacion" }))

app.use((err, req, res, next) => {
  if (err.message === "Bloqueado por CORS") return res.status(403).json({ message: err.message })
  const isDev = process.env.NODE_ENV === "development"
  res.status(500).json({ message: "Error en el servidor", ...(isDev && { error: err.message }) })
})

const PORT = envs.PORT || 5000
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor en puerto ${PORT}`))