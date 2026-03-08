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
  params: {
    folder: 'club-natacion/entrenamientos',
    // La magia está aquí: 'auto' permite PDFs, PNGs, JPGs sin que se cuelgue
    resource_type: 'auto', 
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
  },
});

export const upload = multer({ storage });