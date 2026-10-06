import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import path from 'path';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export type StorageProvider = 'local' | 'cloudinary';

export interface StoredFile {
  provider: StorageProvider;
  key: string;
}

export const isStorageProvider = (value: string): value is StorageProvider =>
  value === 'local' || value === 'cloudinary';

const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'resumes');

const getSafeLocalPath = (key: string): string => {
  const filePath = path.resolve(uploadDirectory, path.basename(key));
  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    throw new AppError('Stored file key is invalid', 400, 'INVALID_STORAGE_KEY');
  }
  return filePath;
};

const configureCloudinary = () => {
  if (!env.STORAGE_ACCOUNT || !env.STORAGE_ACCESS_KEY || !env.STORAGE_SECRET_KEY) {
    throw new AppError('Cloudinary storage credentials are not configured', 503, 'STORAGE_NOT_CONFIGURED');
  }
  cloudinary.config({
    cloud_name: env.STORAGE_ACCOUNT,
    api_key: env.STORAGE_ACCESS_KEY,
    api_secret: env.STORAGE_SECRET_KEY,
    secure: true,
  });
};

export const getConfiguredStorageProvider = (): StorageProvider => env.STORAGE_PROVIDER;

export const uploadFile = async (
  buffer: Buffer,
  userId: string,
  originalName: string
): Promise<StoredFile> => {
  const extension = path.extname(originalName).toLowerCase();
  const filename = `resume-${randomUUID()}${extension}`;

  if (env.STORAGE_PROVIDER === 'local') {
    await fs.mkdir(uploadDirectory, { recursive: true });
    await fs.writeFile(getSafeLocalPath(filename), buffer, { flag: 'wx' });
    return { provider: 'local', key: filename };
  }

  if (env.STORAGE_PROVIDER === 'cloudinary') {
    configureCloudinary();
    const publicId = `resume-${userId}-${randomUUID()}${extension}`;
    const result = await new Promise<{ public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'aimarg/resumes',
          public_id: publicId,
          resource_type: 'raw',
          type: 'authenticated',
          access_mode: 'authenticated',
        },
        (error, uploaded) => {
          if (error) {
            reject(error);
            return;
          }
          if (!uploaded) {
            reject(new Error('Cloudinary returned no upload result'));
            return;
          }
          resolve(uploaded);
        }
      );
      stream.end(buffer);
    });
    return { provider: 'cloudinary', key: result.public_id };
  }

  throw new AppError('Configured storage provider is not supported', 500, 'UNSUPPORTED_STORAGE_PROVIDER');
};

export const deleteStoredFile = async ({ provider, key }: StoredFile): Promise<void> => {
  if (provider === 'local') {
    await fs.rm(getSafeLocalPath(key), { force: true });
    return;
  }

  if (provider === 'cloudinary') {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(key, {
      resource_type: 'raw',
      type: 'authenticated',
    });
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary could not delete stored file: ${result.result}`);
    }
    return;
  }

  throw new AppError('Stored file provider is not supported', 500, 'UNSUPPORTED_STORAGE_PROVIDER');
};

export const createStoredFileDownloadUrl = async (
  { provider, key }: StoredFile,
  originalName: string
): Promise<string> => {
  if (provider === 'cloudinary') {
    configureCloudinary();
    const format = path.extname(originalName).slice(1).toLowerCase();
    if (format !== 'pdf' && format !== 'docx') {
      throw new AppError('Resume format is invalid', 404, 'RESUME_NOT_FOUND');
    }
    return cloudinary.utils.private_download_url(key, format, {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 60,
      attachment: true,
    });
  }

  throw new AppError('Local files are downloaded through the API', 500, 'INVALID_STORAGE_OPERATION');
};

export const createLocalResumeDownloadToken = (userId: string): string => {
  return jwt.sign({ purpose: 'resume-download' }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: '60s',
  });
};

export const verifyLocalResumeDownloadToken = (userId: string, token: string): boolean => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return typeof payload !== 'string' &&
      payload.sub === userId &&
      payload.purpose === 'resume-download';
  } catch {
    return false;
  }
};

export const getLocalStoredFilePath = (key: string): string => getSafeLocalPath(key);
