import multer from 'multer';
import admin from 'firebase-admin';
import envs from '../utils/envs.utils.js';

// --- CONFIGURACIÓN DE FIREBASE ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: envs.FIREBASE_PROJECT_ID,
      clientEmail: envs.FIREBASE_CLIENT_EMAIL,
      // Esta línea es vital para que Render lea bien los saltos de línea de la clave
      privateKey: envs.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: envs.FIREBASE_STORAGE_BUCKET
  });
}

console.log("Intentando conectar al bucket:", envs.FIREBASE_STORAGE_BUCKET);
const bucket = admin.storage().bucket(envs.FIREBASE_STORAGE_BUCKET);

// --- CONFIGURACIÓN DE MULTER (MEMORIA) ---
// No guardamos en disco para evitar errores de permisos en Render
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

// --- FUNCIÓN HELPER PARA SUBIR ---
export const uploadToFirebase = async (file) => {
  if (!file) return null;

  const fileName = `entrenamientos/${Date.now()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    metadata: { contentType: file.mimetype }
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => reject(error));
    stream.on('finish', async () => {
      // Hace el archivo público para que el link funcione en el frontend
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });
    stream.end(file.buffer);
  });
};