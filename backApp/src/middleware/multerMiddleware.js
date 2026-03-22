import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import envs from "../utils/envs.utils.js"

cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key:    envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET
})

const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
})

// FIX #9: Retornamos tanto secure_url como public_id.
// Antes solo se retornaba la URL y luego se intentaba reconstruir el public_id
// desde la URL de forma frágil (se rompía si Cloudinary cambiaba el formato).
// Ahora guardamos el public_id directamente al subir y lo usamos para borrar.
export const uploadToCloudinary = async (file) => {
  if (!file) return null

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "entrenamientos",
        resource_type: "auto"
      },
      (error, result) => {
        if (error) {
          console.error("Error en Cloudinary:", error)
          return reject(error)
        }
        // Retornamos objeto con ambos campos en lugar de solo la URL
        resolve({
          url: result.secure_url,
          publicId: result.public_id  // ← guardamos esto en MongoDB
        })
      }
    )
    uploadStream.end(file.buffer)
  })
}
