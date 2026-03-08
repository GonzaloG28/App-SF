import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import envs from "./utils/envs.utils.js";
import connectDB from "./config/db.js";

import nadadorRoutes from "./routes/nadador.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import competenciaRoutes from "./routes/competencia.routes.js";
import pruebaRoutes from "./routes/prueba.routes.js";
import entrenamientoRoutes from "./routes/entrenamiento.routes.js";

const app = express();

// Conexión a DB
connectDB();

// --- CONFIGURACIÓN DE CORS ---
const allowedOrigins = [
  'https://app-sf-drab.vercel.app', 
  'http://localhost:5173',
  'http://127.0.0.1:5173' // Importante para navegadores que usan IP en vez de localhost
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log para debuggear en Render si alguien es bloqueado
      console.log("CORS Bloqueó a:", origin);
      callback(new Error('Bloqueado por CORS: Origen no permitido'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Responder a peticiones OPTIONS de forma global
app.options('*', cors());

// --- MIDDLEWARES DE PARSEO ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Necesario para procesar FormData pesados

// --- RUTAS ---
app.use("/api/auth", authRoutes);
app.use("/api/nadadores", nadadorRoutes);
app.use("/api/competencias", competenciaRoutes);
app.use("/api/pruebas", pruebaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/entrenamiento", entrenamientoRoutes);

// Health Check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "API Club Natacion - Cloud Ready" });
});

// --- MANEJO DE ERRORES ---
app.use((err, req, res, next) => {
  // Si el error es de CORS, lo manejamos específicamente
  if (err.message === 'Bloqueado por CORS: Origen no permitido') {
    return res.status(403).json({ message: err.message });
  }
  
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor', error: err.message });
});

const PORT = envs.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});