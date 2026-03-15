import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import envs from '../utils/envs.utils.js';

// --- CONFIGURACIÓN DE CLOUDINARY ---
cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET
});

// Multer en memoria (igual que antes)
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// --- FUNCIÓN PARA SUBIR A CLOUDINARY ---
export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'entrenamientos', // Se creará esta carpeta en tu panel de Cloudinary
        resource_type: 'auto',    // Detecta automáticamente si es PDF o Imagen
      },
      (error, result) => {
        if (error) {
          console.error("Error en Cloudinary:", error);
          return reject(error);
        }
        // Retornamos la URL segura (https)
        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};