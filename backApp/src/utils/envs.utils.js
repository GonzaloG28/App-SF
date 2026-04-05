import dotenv from "dotenv"

dotenv.config()

// Función auxiliar para asegurar que la variable existe
const getEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        // Esto detendrá el servidor de inmediato si falta una variable crítica
        throw new Error(`Falta la variable de entorno crítica: ${key}`);
    }
    return value;
};

export default {
    MONGO_URI: getEnv("MONGO_URI"),
    PORT: process.env.PORT || 3000, // Valor por defecto por si acaso
    JWT_SECRET: getEnv("JWT_SECRET"),
    ADMIN_SECRET: getEnv("ADMIN_SECRET"),
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
    NODE_ENV: process.env.NODE_ENV || 'development',
    SMTP_HOST: getEnv("SMTP_HOST"),
    SMTP_PORT: getEnv("SMTP_PORT"),
    SMTP_USER: getEnv("SMTP_USER"),
    SMTP_PASS: getEnv("SMTP_PASS")
}