import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import multerStorageCloudinary from 'multer-storage-cloudinary';
import envs from '../utils/envs.utils.js';

const { CloudinaryStorage } = multerStorageCloudinary;

// Configuración de credenciales
cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  // SOLUCIÓN AL ERROR 'uploader': 
  // La librería espera un objeto que tenga la propiedad .v2
  cloudinary: { v2: cloudinary }, 
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: 'club-natacion/entrenamientos',
      // 'raw' es indispensable para que Cloudinary acepte PDFs sin errores
      resource_type: isPDF ? 'raw' : 'image', 
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      // Si es PDF, forzamos la extensión
      format: isPDF ? 'pdf' : undefined, 
    };
  },
});

export const upload = multer({ storage });