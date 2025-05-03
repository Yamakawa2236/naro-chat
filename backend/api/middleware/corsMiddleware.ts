import cors from 'cors';
import { serverConfig } from '@config/serverConfig';

const corsOptions: cors.CorsOptions = {
  origin: serverConfig.clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

console.log(`CORS configured for origin: ${serverConfig.clientOrigin}`);

export const corsMiddleware = cors(corsOptions);