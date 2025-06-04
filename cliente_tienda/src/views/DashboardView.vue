<template>
  <MainLayout>
    <div class="dashboard">
      <h2 class="page-title">Bienvenido a Florería Digital</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <UserGroupIcon class="w-8 h-8" />
          </div>
          <div class="stat-content">
            <h3>Personal Activo</h3>
            <p class="stat-value">{{ stats.personalActivo }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <UsersIcon class="w-8 h-8" />
          </div>
          <div class="stat-content">
            <h3>Total Clientes</h3>
            <p class="stat-value">{{ stats.totalClientes }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <ShoppingCartIcon class="w-8 h-8" />
          </div>
          <div class="stat-content">
            <h3>Pedidos Pendientes</h3>
            <p class="stat-value">{{ stats.pedidosPendientes }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <CurrencyDollarIcon class="w-8 h-8" />
          </div>
          <div class="stat-content">
            <h3>Ventas del Mes</h3>
            <p class="stat-value">${{ stats.ventasMes.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="recent-section">
        <h3>Pedidos Recientes</h3>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Fecha Entrega</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidosRecientes" :key="pedido.folio">
                <td>{{ pedido.folio }}</td>
                <td>{{ pedido.cliente_nombre }}</td>
                <td>{{ formatDate(pedido.fecha_entrega) }}</td>
                <td>
                  <span class="badge" :class="pedido.entregado === 1 ? 'badge-success' : 'badge-warning'">
                    {{ pedido.entregado === 1 ? 'Entregado' : 'Pendiente' }}
                  </span>
                </td>
                <td>${{ pedido.precio_sugerido }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MainLayout from '@/components/layouts/MainLayout.vue';
import api from '@/services/api'; // Asegúrate que este servicio esté correctamente configurado
import {
  UserGroupIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline';

// --- Definición de Interfaces ---
// (Puedes mover estas a un archivo src/types.ts e importarlas)

interface Pedido {
  folio: string | number; // O el tipo específico que use tu API
  cliente_nombre: string;
  fecha_entrega: string; // Asumiendo que es un string de fecha ISO o similar
  entregado: number;     // Ejemplo: 1 para Entregado, 2 para Pendiente
  precio_sugerido: number | string; // Puede ser string y necesitar parseFloat, o ser ya number
  fecha_pedido: string;  // Asumiendo que es un string de fecha ISO o similar
  pagado: number;        // Ejemplo: 1 para Pagado
  // ...otras propiedades del pedido
}

interface Stats {
  personalActivo: number;
  totalClientes: number;
  pedidosPendientes: number;
  ventasMes: number;
}

// --- Variables Reactivas Tipadas ---
const stats = ref<Stats>({
  personalActivo: 0,
  totalClientes: 0,
  pedidosPendientes: 0,
  ventasMes: 0
});

const pedidosRecientes = ref<Pedido[]>([]); // <--- CAMBIO AQUÍ: Tipado explícito

const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const loadDashboardData = async () => {
  try {
    console.log('Cargando datos del dashboard...');
    
    // Cargar estadísticas
    const [personal, clientes, pedidos] = await Promise.all([
      api.get('/personal'),
      api.get('/clientes'),
      api.get('/pedidos')
    ]);
    
    console.log('Personal data:', personal.data);
    console.log('Clientes data:', clientes.data);
    console.log('Pedidos data:', pedidos.data);
    
    // Asegurarnos de que tenemos arrays
    const personalData = Array.isArray(personal.data) ? personal.data : [];
    const clientesData = Array.isArray(clientes.data) ? clientes.data : [];
    const pedidosData = Array.isArray(pedidos.data) ? pedidos.data : [];
    
    stats.value.personalActivo = personalData.filter((p: any) => p.estatus === 1).length;
    stats.value.totalClientes = clientesData.length;
    stats.value.pedidosPendientes = pedidosData.filter((p: any) => p.entregado === 2).length;
    
    // Calcular ventas del mes
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();
    
    stats.value.ventasMes = pedidosData
      .filter((p: any) => {
        if (!p.fecha_pedido || p.pagado !== 1) return false;
        const fechaPedido = new Date(p.fecha_pedido);
        return fechaPedido.getMonth() === mesActual && 
               fechaPedido.getFullYear() === añoActual;
      })
      .reduce((sum: number, p: any) => {
        const precio = parseFloat(p.precio_sugerido) || 0;
        return sum + precio;
      }, 0);
    
    // Obtener pedidos recientes (los últimos 5)
    pedidosRecientes.value = pedidosData
      .sort((a: any, b: any) => {
        const fechaA = new Date(a.fecha_pedido).getTime();
        const fechaB = new Date(b.fecha_pedido).getTime();
        return fechaB - fechaA; // Orden descendente
      })
      .slice(0, 5);
    
    console.log('Stats finales:', stats.value);
    console.log('Pedidos recientes:', pedidosRecientes.value);
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px; /* Añadido padding */
}

.page-title {
  font-size: 1.875rem; /* ~30px */
  font-weight: 700;
  color: #1f2937; /* Tailwind gray-800 */
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem; /* 8px */
  padding: 1.5rem; /* 24px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0,0,0,0.06); /* Sombra sutil */
  display: flex;
  align-items: center;
  gap: 1rem; /* 16px */
}

.stat-icon {
  background-color: #eff6ff; /* Tailwind blue-50 */
  color: #3b82f6;       /* Tailwind blue-500 */
  padding: 1rem; /* 16px */
  border-radius: 0.5rem; /* 8px */
  display: inline-flex; /* Para centrar el icono si es SVG */
  align-items: center;
  justify-content: center;
}
.stat-icon .w-8 { /* Asegura tamaño de icono */
    width: 2rem; /* 32px */
    height: 2rem; /* 32px */
}


.stat-content h3 {
  font-size: 0.875rem; /* 14px */
  color: #6b7280;    /* Tailwind gray-500 */
  margin-top: 0; /* Quitamos margen por si acaso */
  margin-bottom: 0.25rem; /* 4px */
  font-weight: 500; /* Medium */
}

.stat-value {
  font-size: 1.875rem; /* 30px */
  font-weight: 700; /* Bold */
  color: #1f2937;    /* Tailwind gray-800 */
  line-height: 1.2;
}

.recent-section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0,0,0,0.06);
}

.recent-section h3 {
  font-size: 1.25rem; /* 20px */
  font-weight: 600; /* Semi-bold */
  color: #111827; /* Tailwind gray-900 */
  margin-top: 0;
  margin-bottom: 1rem; /* 16px */
}

.table-container { /* Estilos de tabla de ArreglosView para consistencia */
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem; /* 12px 16px */
  text-align: left;
  font-size: 0.875rem; /* 14px */
}
.table th {
  background-color: #f8fafc; /* Tailwind slate-50 */
  font-weight: 600;
  color: #475569; /* Tailwind slate-600 */
}
.table td {
    color: #334155; /* Tailwind slate-700 */
}

.badge {
  padding: 0.25rem 0.75rem; /* 4px 12px */
  border-radius: 9999px; /* Pill shape */
  font-size: 0.75rem;    /* 12px */
  font-weight: 500;      /* Medium */
  text-transform: capitalize;
}

.badge-success {
  background-color: #dcfce7; /* Tailwind green-100 */
  color: #15803d;       /* Tailwind green-700 */
}

.badge-warning {
  background-color: #fef3c7; /* Tailwind amber-100 */
  color: #b45309;       /* Tailwind amber-700 */
}
</style>