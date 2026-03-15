import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  mongoDbName: process.env.MONGO_DB_NAME || 'gamecheck',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};
