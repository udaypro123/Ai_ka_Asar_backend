import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';

const requiredSecret = (name: string): string => {
  const value = process.env[name];
  if (isTest && !value) return `test-only-${name.toLowerCase()}-secret`;
  if (!value || value.length < 32 || /replace[-_ ]?with|change[-_ ]?me|example/i.test(value)) {
    throw new Error(`${name} must be configured with at least 32 characters`);
  }
  return value;
};

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:8081')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
if (!corsOrigins.includes(frontendUrl)) corsOrigins.push(frontendUrl);

if (nodeEnv === 'production' && !process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN must be configured in production');
}
if (nodeEnv === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL must be configured in production');
}
if (
  nodeEnv === 'production' &&
  (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com')
) {
  throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured in production');
}

const cookieSameSite = process.env.AUTH_COOKIE_SAME_SITE || 'lax';
if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
  throw new Error('AUTH_COOKIE_SAME_SITE must be lax, strict, or none');
}
if (cookieSameSite === 'none' && nodeEnv !== 'production') {
  throw new Error('AUTH_COOKIE_SAME_SITE=none requires secure production cookies');
}

const legacyCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_API_KEY ||
  process.env.CLOUDINARY_API_SECRET
);
const storageProvider = (
  process.env.STORAGE_PROVIDER || (legacyCloudinaryConfigured ? 'cloudinary' : 'local')
).toLowerCase();
if (!['local', 'cloudinary'].includes(storageProvider)) {
  throw new Error('STORAGE_PROVIDER must be local or cloudinary');
}

export const env = {
  NODE_ENV: nodeEnv,
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  isTest,
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || (isTest ? 'mongodb://localhost:27017/aimarg_test' : ''),
  JWT_ACCESS_SECRET: requiredSecret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requiredSecret('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  GOOGLE_CLIENT_IDS: (process.env.GOOGLE_CLIENT_IDS || '')
    .split(',')
    .map((clientId) => clientId.trim())
    .filter(Boolean),
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.example.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  STORAGE_PROVIDER: storageProvider as 'local' | 'cloudinary',
  STORAGE_ACCOUNT: process.env.STORAGE_ACCOUNT || process.env.CLOUDINARY_CLOUD_NAME || '',
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY || process.env.CLOUDINARY_API_KEY || '',
  STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY || process.env.CLOUDINARY_API_SECRET || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@aimarg.com',
  FRONTEND_URL: frontendUrl,
  CORS_ORIGIN: corsOrigins,
  AUTH_COOKIE_SAME_SITE: cookieSameSite as 'lax' | 'strict' | 'none',
  HOST: process.env.HOST || '127.0.0.1',
  TRUST_PROXY_HOPS: Math.max(0, parseInt(process.env.TRUST_PROXY_HOPS || '0', 10) || 0),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  APP_NAME: process.env.APP_NAME || 'AIMarg',
  API_VERSION: process.env.API_VERSION || 'v1',
};

export const isDevelopment = env.isDevelopment;
export const isProduction = env.isProduction;
export { isTest };
