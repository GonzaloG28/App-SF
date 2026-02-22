import express from "express"
import cors from "cors"
import envs from "./utils/envs.utils.js"
import connectDB from "./config/db.js"

import nadadorRoutes from "./routes/nadador.routes.js"
import authRoutes from "./routes/auth.routes.js";


const app = express()
// conexion mongo
connectDB()

//middlewares globales
app.use(cors())
app.use(express.json())

//rutas oficiales
app.use("/api/auth", authRoutes)
app.use("/api/nadadores", nadadorRoutes)

//ruta de prueba
app.get("/", (req, res) => {
    res.json({message: "API Club Natacion funcionando"})
})



//levantar servidor
const PORT = envs.PORT || 5000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})
