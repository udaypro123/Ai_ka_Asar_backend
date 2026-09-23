import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(env.PORT, env.HOST, () => {
      console.log(`${env.APP_NAME} server running in ${env.NODE_ENV} mode on http://${env.HOST}:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
