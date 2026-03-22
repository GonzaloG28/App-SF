import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import envs from "./utils/envs.utils.js";
import connectDB from "./config/db.js";

import nadadorRoutes from "./routes/nadador.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import competenciaRoutes from "./routes/competencia.routes.js";
import pruebaRoutes from "./routes/prueba.routes.js";
import entrenamientoRoutes from "./routes/entrenamiento.routes.js";

const app = express();

connectDB();

// FIX #7: Helmet añade ~15 headers de seguridad HTTP automáticamente
// (X-Frame-Options, X-XSS-Protection, Strict-Transport-Security, etc.)
app.use(helmet());

// --- CORS ---
const allowedOrigins = [
  "https://app-sf-drab.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",      
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Bloqueado por CORS: Origen no permitido"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// FIX #3: Rate limiting general para toda la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ventana de 15 minutos
  max: 100,                  // máximo 100 requests por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes, intenta más tarde." }
});

// FIX #3: Rate limiting más estricto solo para login (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 intentos de login por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de acceso. Espera 15 minutos." }
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login", loginLimiter);

// --- PARSEO ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --- RUTAS ---
app.use("/api/auth",          authRoutes);
app.use("/api/nadadores",     nadadorRoutes);
app.use("/api/competencias",  competenciaRoutes);
app.use("/api/pruebas",       pruebaRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/entrenamiento", entrenamientoRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API Club Natacion - Cloud Ready" });
});

// --- MANEJO DE ERRORES GLOBAL ---
app.use((err, req, res, next) => {
  if (err.message === "Bloqueado por CORS: Origen no permitido") {
    return res.status(403).json({ message: err.message });
  }
  // FIX #15: No exponer error.message en producción
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    message: "Algo salió mal en el servidor",
    ...(isDev && { error: err.message })
  });
});

const PORT = envs.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
