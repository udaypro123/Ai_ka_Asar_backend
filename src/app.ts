import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { env } from './config/env';
import { errorHandler } from './utils/appError';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import professionRoutes from './routes/profession.route';
import skillRoutes from './routes/skill.route';
import impactRoutes from './routes/impact.route';
import careerRoutes from './routes/career.route';
import notificationRoutes from './routes/notification.route';

const app: Application = express();

app.use(helmet());
const corsOptions = {
  origin: env.isDevelopment ? true : env.CORS_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());
app.use(mongoSanitize());
app.use(hpp());

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
});
app.use('/api/', limiter);

if (env.isDevelopment) {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'AI Ka Asar API is healthy', data: { status: 'ok' } });
});

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/professions`, professionRoutes);
app.use(`/api/${env.API_VERSION}/skills`, skillRoutes);
app.use(`/api/${env.API_VERSION}/impact`, impactRoutes);
app.use(`/api/${env.API_VERSION}/career`, careerRoutes);
app.use(`/api/${env.API_VERSION}/notifications`, notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

export default app;
