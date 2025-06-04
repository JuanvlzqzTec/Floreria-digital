// === cliente_tienda/src/services/api.ts - CORREGIDO ===
import axios from 'axios';
import { auth } from '@/config/firebase';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // <-- Debe incluir /api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token de autenticación (opcional por ahora)
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error obteniendo token:', error);
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API:', error.response || error);
    
    if (error.response?.status === 401) {
      // Solo redirigir si realmente necesitamos autenticación
      // Por ahora comentado para pruebas
      // window.location.href = '/login';
    }
    
    // Mostrar mensaje de error más específico
    if (error.code === 'ERR_NETWORK') {
      alert('Error de conexión con el servidor. Verifica que el backend esté funcionando.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// === ALTERNATIVA: Si tienes un .env en cliente_tienda ===
// Verifica que cliente_tienda/.env tenga:
// VITE_API_URL=http://localhost:3000/api

// Y entonces usa:
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });