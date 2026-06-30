import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary-v2';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tripconnect',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit' }], // cap size server-side
  },
});

// Limits: max 5 files, 5MB each — prevents storage/bandwidth abuse via uploads.
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
});

export default upload;