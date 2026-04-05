// config/db.js
import mongoose from "mongoose"
import envs from "../utils/envs.utils.js"

const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10, // Limita a 10 conexiones simultáneas para no saturar el plan gratuito de Atlas
            serverSelectionTimeoutMS: 5000, // No esperar más de 5s si la DB no responde
            socketTimeoutMS: 45000, // Cierra conexiones inactivas para liberar RAM
        };

        const conn = await mongoose.connect(envs.MONGO_URI, options);
        
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
        
    } catch (error) {
        console.error(`Error crítico: ${error.message}`);
        // En Render, es mejor dejar que el servicio intente reiniciarse solo
        process.exit(1);
    }
}

export default connectDB;