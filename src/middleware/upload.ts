import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { AppError } from '../utils/appError';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDirectory = path.join(process.cwd(), 'uploads');
    fs.mkdir(uploadDirectory, { recursive: true }, (error) => cb(error, uploadDirectory));
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${randomUUID()}${extension}`);
  },
});

const allowedTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const fileFilter = (_req: any, file: any, cb: any) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes[extension] === file.mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and Word documents with matching file types are allowed', 400, 'INVALID_FILE_TYPE'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});
