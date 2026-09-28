import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '127.0.0.1',
  DATABASE_TYPE: process.env.DATABASE_TYPE || 'sqlite',
  DB_FILE: process.env.DB_FILE || path.resolve(__dirname, '../../salesmind.db'),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  JWT_SECRET: process.env.JWT_SECRET || 'salesmind-dev-jwt-secret-key-39281',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
