import express from "express"
import cors from "cors"
import path from "path";
import { fileURLToPath } from "url";

import envs from "./utils/envs.utils.js"
import connectDB from "./config/db.js"

import nadadorRoutes from "./routes/nadador.routes.js"
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"
import competenciaRoutes from "./routes/competencia.routes.js";
import pruebaRoutes from "./routes/prueba.routes.js";
import entrenamientoRoutes from "./routes/entrenamiento.routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

// Conexión a DB
connectDB()

// Servir archivos estáticos (IMPORTANTE: Verifica que la carpeta 'uploads' exista en Render)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares globales
const allowedOrigins = [
  'https://app-sf-drab.vercel.app', 
  'http://localhost:5173',
  'http://localhost:3000' // Opcional: por si pruebas otros puertos
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman o Insomnia)
    if (!origin) return callback(null, true);
    
    // Verificamos si el origen está en la lista o si termina en vercel.app (para subdominios de rama)
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS: Origen no permitido'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // PATCH incluido para completar entrenamiento
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json())

// Rutas oficiales
app.use("/api/auth", authRoutes)
app.use("/api/nadadores", nadadorRoutes)
app.use("/api/competencias", competenciaRoutes);
app.use("/api/pruebas", pruebaRoutes);
app.use("/api/users", userRoutes)
app.use("/api/entrenamiento", entrenamientoRoutes)

// Ruta de prueba/salud (Health Check)
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "API Club Natacion funcionando" })
})

// Manejo de errores global (Evita que el servidor se caiga por un error no capturado)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

const PORT = envs.PORT || 5000
app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' ayuda a la visibilidad en ciertos entornos PaaS
    console.log(`Servidor corriendo en puerto ${PORT}`)
})
