import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '@/config/firebase';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/personal',
    name: 'Personal',
    component: () => import('@/views/PersonalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('@/views/ClientesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: () => import('@/views/PedidosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/arreglos',
    name: 'Arreglos',
    component: () => import('@/views/ArreglosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('@/views/ReportesView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth && !auth.currentUser) {
    next('/login');
  } else if (!requiresAuth && auth.currentUser && to.path === '/login') {
    next('/');
  } else {
    next();
  }
});

export default router;