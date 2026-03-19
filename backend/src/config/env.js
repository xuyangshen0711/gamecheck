import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  mongoDbName: process.env.MONGO_DB_NAME || 'gamecheck',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  sessionSecret: process.env.SESSION_SECRET || 'gamecheck-dev-session-secret',
};
