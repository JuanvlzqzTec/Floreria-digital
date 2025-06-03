<template>
  <div class="dashboard-grid">
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <h2>Florería Digital</h2>
        <button @click="toggleSidebar" class="menu-toggle desktop-hidden">
          <XMarkIcon v-if="sidebarOpen" class="w-6 h-6" />
          <Bars3Icon v-else class="w-6 h-6" />
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" @click="closeSidebar">
          <HomeIcon class="w-5 h-5" />
          <span>Dashboard</span>
        </router-link>
        
        <router-link to="/personal" class="nav-item" @click="closeSidebar">
          <UserGroupIcon class="w-5 h-5" />
          <span>Personal</span>
        </router-link>
        
        <router-link to="/clientes" class="nav-item" @click="closeSidebar">
          <UsersIcon class="w-5 h-5" />
          <span>Clientes</span>
        </router-link>
        
        <router-link to="/pedidos" class="nav-item" @click="closeSidebar">
          <ShoppingCartIcon class="w-5 h-5" />
          <span>Pedidos</span>
        </router-link>
        
        <router-link to="/arreglos" class="nav-item" @click="closeSidebar">
          <SparklesIcon class="w-5 h-5" />
          <span>Arreglos Florales</span>
        </router-link>
        
        <router-link to="/reportes" class="nav-item" @click="closeSidebar">
          <ChartBarIcon class="w-5 h-5" />
          <span>Reportes</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <p>{{ authStore.user?.email }}</p>
        </div>
        <button @click="logout" class="btn btn-secondary w-full">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    
    <div class="main-container">
      <header class="main-header">
        <button @click="toggleSidebar" class="menu-toggle mobile-only">
          <Bars3Icon class="w-6 h-6" />
        </button>
        <h1>{{ pageTitle }}</h1>
      </header>
      
      <main class="main-content">
        <slot />
      </main>
    </div>
    
    <div v-if="sidebarOpen" @click="closeSidebar" class="sidebar-overlay mobile-only"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const sidebarOpen = ref(false);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/personal': 'Gestión de Personal',
    '/clientes': 'Gestión de Clientes',
    '/pedidos': 'Gestión de Pedidos',
    '/arreglos': 'Arreglos Florales',
    '/reportes': 'Reportes'
  };
  return titles[route.path] || 'Florería Digital';
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const logout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background-color: #1f2937;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #374151;
  color: white;
}

.nav-item.router-link-active {
  background-color: #3b82f6;
  color: white;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #374151;
}

.user-info {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.main-header {
  background-color: white;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
}

.desktop-hidden {
  display: none;
}

.mobile-only {
  display: none;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 250px;
    z-index: 50;
    transform: translateX(-100%);
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .desktop-hidden {
    display: block;
  }
  
  .mobile-only {
    display: block;
  }
  
  .sidebar-overlay {
    display: block;
  }
}
</style>