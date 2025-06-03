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
import api from '@/services/api';
import {
  UserGroupIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline';

const stats = ref({
  personalActivo: 0,
  totalClientes: 0,
  pedidosPendientes: 0,
  ventasMes: 0
});

const pedidosRecientes = ref([]);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX');
};

const loadDashboardData = async () => {
  try {
    // Cargar estadísticas
    const [personal, clientes, pedidos] = await Promise.all([
      api.get('/personal'),
      api.get('/clientes'),
      api.get('/pedidos')
    ]);
    
    stats.value.personalActivo = personal.data.filter((p: any) => p.estatus === 1).length;
    stats.value.totalClientes = clientes.data.length;
    stats.value.pedidosPendientes = pedidos.data.filter((p: any) => p.entregado === 2).length;
    
    // Calcular ventas del mes
    const mesActual = new Date().getMonth();
    stats.value.ventasMes = pedidos.data
      .filter((p: any) => {
        const fechaPedido = new Date(p.fecha_pedido);
        return fechaPedido.getMonth() === mesActual && p.pagado === 1;
      })
      .reduce((sum: number, p: any) => sum + parseFloat(p.precio_sugerido), 0);
    
    // Obtener pedidos recientes
    pedidosRecientes.value = pedidos.data.slice(0, 5);
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
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
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
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  background: #eff6ff;
  color: #3b82f6;
  padding: 1rem;
  border-radius: 0.5rem;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.recent-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}
</style>