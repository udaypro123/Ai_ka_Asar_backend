import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

const ensureConfigured = () => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured', 503, 'CLOUDINARY_NOT_CONFIGURED');
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

export const uploadResume = (
  buffer: Buffer,
  userId: string,
  originalName: string
): Promise<UploadApiResponse> => {
  ensureConfigured();
  const extension = path.extname(originalName).toLowerCase();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'aimarg/resumes',
        public_id: `resume-${userId}-${randomUUID()}${extension}`,
        resource_type: 'raw',
        type: 'authenticated',
        access_mode: 'authenticated',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary returned no upload result'));
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const deleteResume = async (publicId: string): Promise<void> => {
  ensureConfigured();
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    type: 'authenticated',
  });
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary could not delete resume asset: ${result.result}`);
  }
};

export const createResumeDownloadUrl = (publicId: string, originalName: string): string => {
  ensureConfigured();
  const format = path.extname(originalName).slice(1).toLowerCase();
  if (format !== 'pdf' && format !== 'docx') {
    throw new AppError('Resume format is invalid', 404, 'RESUME_NOT_FOUND');
  }
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + 60,
    attachment: true,
  });
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
