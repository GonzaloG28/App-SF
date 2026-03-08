import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import multerStorageCloudinary from 'multer-storage-cloudinary';
import envs from '../utils/envs.utils.js';

// --- LÓGICA DE EXTRACCIÓN PARA NODE v24 ---
// Intentamos extraer la clase de las 3 formas posibles en las que puede venir
const CloudinaryStorage = 
  multerStorageCloudinary.CloudinaryStorage || 
  multerStorageCloudinary.default?.CloudinaryStorage || 
  multerStorageCloudinary;

cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET
});

// Usamos el objeto v2 de cloudinary para que la librería no se pierda
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, 
  params: {
    folder: 'club-natacion/entrenamientos',
    allowed_formats: ['jpg', 'png', 'pdf'],
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
  },
});

export const upload = multer({ storage });