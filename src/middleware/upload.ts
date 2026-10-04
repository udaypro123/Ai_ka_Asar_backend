import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/appError';

const storage = multer.memoryStorage();

const allowedTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes[extension] === file.mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and DOCX files with matching file types are allowed', 400, 'INVALID_FILE_TYPE'));
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
