import nodemailer from 'nodemailer';
import { env } from '../config/env';

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  if (!env.SMTP_USER || !env.SMTP_PASS || env.SMTP_HOST === 'smtp.example.com') {
    throw new Error('SMTP is not configured');
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  const resetUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/auth/reset-password#token=${encodeURIComponent(token)}`;

  await transport.sendMail({
    from: env.FROM_EMAIL,
    to: email,
    subject: 'Reset your AIMarg password',
    text: `Use this link to reset your password within 10 minutes: ${resetUrl}`,
    html: `<p>Use this link to reset your AIMarg password. It expires in 10 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });
};
