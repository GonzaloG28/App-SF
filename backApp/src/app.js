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


// Configuración para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express()
// conexion mongo
connectDB()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//middlewares globales
const allowedOrigins = [
  'https://app-sf-drab.vercel.app', // Tu URL de Vercel que aparece en el error
  'http://localhost:5173'           // Para que puedas seguir probando localmente
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como herramientas de mobile o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS: Origen no permitido'));
    }
  },
  credentials: true, // Importante si manejas cookies o tokens en el header
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json())

//rutas oficiales
app.use("/api/auth", authRoutes)
app.use("/api/nadadores", nadadorRoutes)
app.use("/api/competencias", competenciaRoutes);
app.use("/api/pruebas", pruebaRoutes);
app.use("/api/users", userRoutes)
app.use("/api/entrenamiento", entrenamientoRoutes)

//ruta de prueba
app.get("/", (req, res) => {
    res.json({message: "API Club Natacion funcionando"})
})



//levantar servidor
const PORT = envs.PORT || 5000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})
