// === api_tienda/src/config/cors.ts - CORREGIDO ===
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:5173',
    'http://127.0.0.1',
    'http://127.0.0.1:80',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};