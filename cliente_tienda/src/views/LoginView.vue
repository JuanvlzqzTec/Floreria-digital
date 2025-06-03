<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Florería Digital</h1>
        <p>Ingresa a tu cuenta</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            placeholder="correo@ejemplo.com"
            required
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            placeholder="••••••••"
            required
          />
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>
        
        <div v-if="authStore.error" class="alert alert-error">
          {{ authStore.error }}
        </div>
        
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>
      
      <div class="login-footer">
        <p>¿No tienes cuenta? <a href="#" @click.prevent="isRegistering = !isRegistering">{{ isRegistering ? 'Iniciar sesión' : 'Registrarse' }}</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { z } from 'zod';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const isRegistering = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const errors = ref<{ email?: string; password?: string }>({});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const handleSubmit = async () => {
  try {
    errors.value = {};
    loading.value = true;
    
    // Validar formulario
    const validatedData = loginSchema.parse(form);
    
    if (isRegistering.value) {
      await authStore.register(validatedData.email, validatedData.password);
    } else {
      await authStore.login(validatedData.email, validatedData.password);
    }
    
    router.push('/');
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        if (err.path[0] === 'email') errors.value.email = err.message;
        if (err.path[0] === 'password') errors.value.password = err.message;
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #6b7280;
}

.login-form {
  margin-bottom: 1.5rem;
}

.input-error {
  border-color: #ef4444 !important;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.w-full {
  width: 100%;
}

.login-footer {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.login-footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>