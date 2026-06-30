import { v2 as cloudinary } from 'cloudinary';
import { cloudinary as cfg } from './env.js';

cloudinary.config({
  cloud_name: cfg.cloudName,
  api_key: cfg.apiKey,
  api_secret: cfg.apiSecret,
});

export default cloudinary;