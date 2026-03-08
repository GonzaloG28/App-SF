import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import multerStorageCloudinary from 'multer-storage-cloudinary';
import envs from '../utils/envs.utils.js';

// --- EXTRACCIÓN MANUAL DEL CONSTRUCTOR ---
// En ESM, a veces la clase viene en .CloudinaryStorage, otras en .default
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || 
                          multerStorageCloudinary.default?.CloudinaryStorage || 
                          multerStorageCloudinary;

cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: 'club-natacion/entrenamientos',
      // 'raw' es vital para PDFs, 'image' para el resto
      resource_type: isPDF ? 'raw' : 'image',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      format: isPDF ? 'pdf' : undefined,
    };
  },
});

export const upload = multer({ storage });