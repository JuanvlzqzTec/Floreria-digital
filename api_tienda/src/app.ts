import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { corsOptions } from './config/cors';
import { errorHandler } from './middlewares/errorHandler';
import pool from './config/database';

import personalRoutes from './routes/personal.routes';
import clientesRoutes from './routes/clientes.routes';
import pedidosRoutes from './routes/pedidos.routes';
import arreglosRoutes from './routes/arreglos.routes';
import reportesRoutes from './routes/reportes.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Florería Digital funcionando' });
});

app.use('/api/personal', personalRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/arreglos', arreglosRoutes);
app.use('/api/reportes', reportesRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Verificar conexión a base de datos e iniciar servidor
const startServer = async () => {
  try {
    await pool.getConnection();
    console.log('✅ Conexión a base de datos establecida');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

startServer();