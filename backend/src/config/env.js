import dotenv from 'dotenv';
dotenv.config();

// Fail fast: if a required secret is missing, crash on boot instead of failing
// silently later mid-request (e.g. signing a JWT with `undefined` as the secret).
const required = [
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

export const port = process.env.PORT || 5000;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
export const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
export const mongoUri = process.env.MONGO_URI;

export const accessToken = {
  secret: process.env.ACCESS_TOKEN_SECRET,
  expiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
};
export const refreshToken = {
  secret: process.env.REFRESH_TOKEN_SECRET,
  expiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
};

export const google = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
};

export const razorpay = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
};

export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

export const mistral = {
  apiKey: process.env.MISTRAL_API_KEY,
  model: process.env.MISTRAL_MODEL || 'mistral-large-latest',
};

export const brevo = {
  apiKey: process.env.BREVO_API_KEY,
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'no-reply@tripconnect.com',
  senderName: process.env.BREVO_SENDER_NAME || 'TripConnect',
};

export const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT) || 12;

export default {
  port,
  nodeEnv,
  apiBaseUrl,
  clientUrl,
  mongoUri,
  accessToken,
  refreshToken,
  google,
  razorpay,
  cloudinary,
  mistral,
  brevo,
  commissionPercent,
};