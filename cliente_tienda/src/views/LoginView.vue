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
const isRegistering = ref(false); // Para alternar entre login y registro

const form = reactive({
  email: '',
  password: ''
});

const errors = ref<{ email?: string; password?: string }>({});

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const handleSubmit = async () => {
  try {
    errors.value = {}; // Limpiar errores previos
    loading.value = true;

    // Validar formulario
    const validatedData = loginSchema.parse(form);

    if (isRegistering.value) {
      await authStore.register(validatedData.email, validatedData.password);
      // Podrías querer redirigir a login o mostrar un mensaje de éxito aquí
      // Por ahora, asumimos que register también redirige o maneja el estado
      // Si register no loguea automáticamente:
      // isRegistering.value = false; // Volver a modo login
      // alert('¡Registro exitoso! Por favor, inicia sesión.');
    } else {
      await authStore.login(validatedData.email, validatedData.password);
    }

    // Si el login/registro fue exitoso y el store actualiza currentUser,
    // el guard de navegación en router/index.ts debería redirigir a '/'
    router.push('/');

  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        if (err.path[0] === 'email') errors.value.email = err.message;
        if (err.path[0] === 'password') errors.value.password = err.message;
      });
    } else if (authStore.error) {
      // El error ya debería estar en authStore.error y se mostrará en el template
      // No es necesario hacer nada más aquí a menos que quieras un log adicional
      console.error("Error de autenticación:", authStore.error);
    } else {
      // Otros errores inesperados
      errors.value.email = 'Ocurrió un error inesperado. Intenta de nuevo.';
      console.error("Error inesperado en handleSubmit:", error);
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
  padding: 1rem; /* Espacio por si el card es muy grande en pantallas pequeñas */
  box-sizing: border-box;
}

.login-card {
  background: white;
  border-radius: 1rem; /* 16px */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* Sombra más suave */
  width: 100%;
  max-width: 400px; /* Ancho máximo del formulario */
  padding: 2.5rem; /* Aumentamos un poco el padding interno */
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem; /* Más espacio después del header */
}

.login-header h1 {
  font-size: 1.875rem; /* ~30px, ajustado para balance */
  font-weight: 700;
  color: #1f2937; /* Tailwind gray-800 */
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #4b5563; /* Tailwind gray-600 */
  font-size: 1rem; /* 16px */
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem; /* 20px */
}

.form-label {
  display: block;
  margin-bottom: 0.5rem; /* 8px */
  font-weight: 500; /* medium */
  color: #374151; /* Tailwind gray-700 */
  font-size: 0.875rem; /* 14px */
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem; /* 12px 16px */
  border: 1px solid #d1d5db; /* Tailwind gray-300 */
  border-radius: 0.5rem;    /* 8px, más redondeado */
  box-sizing: border-box;
  font-size: 1rem; /* 16px */
  color: #1f2937; /* Tailwind gray-800 */
  background-color: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input::placeholder {
  color: #9ca3af; /* Tailwind gray-400 */
}

.form-input:focus {
  border-color: #4f46e5; /* Indigo-600, un púrpura del degradado */
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3); /* Sombra de foco índigo */
}

.input-error {
  border-color: #ef4444 !important; /* Rojo para error */
}
.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3); /* Sombra de foco roja */
}

.form-error {
  color: #ef4444; /* Tailwind red-500 */
  font-size: 0.875rem; /* 14px */
  margin-top: 0.25rem; /* 4px */
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem; /* 6px */
  margin-bottom: 1.25rem; /* 20px */
  font-size: 0.875rem;
}

.alert-error {
  background-color: #fee2e2; /* Tailwind red-100 */
  color: #b91c1c;       /* Tailwind red-700, más oscuro para contraste */
  border: 1px solid #fca5a5; /* Tailwind red-300 */
}

.btn { /* Estilo base para botones */
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
  text-align: center;
  line-height: 1.25; /* Para asegurar que el texto no se corte */
}

.btn-primary {
  background-color: #6366f1; /* Indigo-500, color principal del tema */
  color: white;
}

.btn-primary:hover {
  background-color: #4f46e5; /* Indigo-600 */
}

.btn-primary:disabled {
  background-color: #a5b4fc; /* Indigo-300 */
  opacity: 0.7;
  cursor: not-allowed;
}

.w-full {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 2rem; /* Más espacio arriba del footer */
}

.login-footer p {
  color: #4b5563; /* Tailwind gray-600 */
  font-size: 0.875rem; /* 14px */
}

.login-footer a {
  color: #4f46e5; /* Indigo-600, coherente con el botón primario */
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>