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
app.use(cors({
    origin: ["https://app-nsf.vercel.app/", "http://localhost:5173"], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}))
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
