<template>
  <MainLayout>
    <div class="page-container">
      <div class="page-header">
        <h2>Gestión de Clientes</h2>
        <button @click="openModal()" class="btn btn-primary">
          <PlusIcon class="w-5 h-5" />
          Agregar Cliente
        </button>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientes" :key="cliente.id_cliente">
              <td>{{ cliente.id_cliente }}</td>
              <td>{{ cliente.nombre_completo }}</td>
              <td>{{ cliente.direccion || '-' }}</td>
              <td>{{ cliente.telefono || '-' }}</td>
              <td>
                <div class="actions">
                  <button @click="openModal(cliente)" class="btn-icon" title="Editar">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button @click="deleteCliente(cliente)" class="btn-icon btn-icon-danger" title="Eliminar">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Editar Cliente' : 'Agregar Cliente' }}</h3>
            <button @click="closeModal" class="close-btn">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveCliente" class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre Completo *</label>
              <input
                v-model="form.nombre_completo"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.nombre_completo }"
                required
              />
              <p v-if="errors.nombre_completo" class="form-error">{{ errors.nombre_completo }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">Dirección</label>
              <input
                v-model="form.direccion"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.direccion }"
              />
              <p v-if="errors.direccion" class="form-error">{{ errors.direccion }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input
                v-model="form.telefono"
                type="tel"
                class="form-input"
                :class="{ 'input-error': errors.telefono }"
              />
              <p v-if="errors.telefono" class="form-error">{{ errors.telefono }}</p>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import MainLayout from '@/components/layouts/MainLayout.vue';
import api from '@/services/api'; // Asegúrate que este servicio esté correctamente configurado
import { z } from 'zod';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

// --- Definición de la Interfaz para Cliente ---
// Puedes mover esto a un archivo separado (ej. src/types/Cliente.ts o src/types.ts) e importarlo
interface Cliente {
  id_cliente: number; // o string, según lo que devuelva tu API
  nombre_completo: string;
  direccion?: string | null; // La dirección puede ser opcional y/o nula
  telefono?: string | null;  // El teléfono puede ser opcional y/o nulo
}

// --- Definición de la Interfaz para el Formulario de Cliente ---
interface ClienteForm {
  id_cliente: number | null;
  nombre_completo: string;
  direccion: string; // En el form, los inputs son strings. Zod maneja la opcionalidad.
  telefono: string;  // En el form, los inputs son strings. Zod maneja la opcionalidad.
}

// --- Variables Reactivas Tipadas ---
const clientes = ref<Cliente[]>([]); // <--- CAMBIO AQUÍ: Tipado explícito
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive<ClienteForm>({ // <--- CAMBIO AQUÍ: Tipado explícito
  id_cliente: null,
  nombre_completo: '',
  direccion: '',
  telefono: ''
});

// El tipo para errors puede ser más específico si conoces las claves, pero Record<string, string> es un buen comienzo.
const errors = ref<Record<string, string>>({}); // <--- CAMBIO AQUÍ: Tipado más específico que 'any'

// Zod Schema para validación
const clienteSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  // Para Zod, si un campo es opcional y puede ser una cadena vacía que es válida (y se envía así),
  // puedes usar .optional().default('') o simplemente no marcarlo como requerido.
  // Si una cadena vacía no es permitida para campos opcionales que deben ser omitidos si están vacíos,
  // necesitarías transformar los datos antes de enviarlos o ajustar el schema.
  // Aquí asumimos que una cadena vacía está bien para campos opcionales si el usuario los deja vacíos.
  direccion: z.string().optional(), // Permite que sea undefined si no se provee
  telefono: z.string().regex(/^[0-9+-]*$/, 'El teléfono solo puede contener números, guiones o signo +').optional() // Ajustada regex
});


const loadClientes = async () => {
  try {
    // Asumimos que api.get devuelve { data: Cliente[] } o directamente Cliente[]
    // Si es { data: [...] }, usa: const response = await api.get<{ data: Cliente[] }>('/clientes');
    // y luego: clientes.value = response.data.data;
    const response = await api.get<Cliente[]>('/clientes'); // <--- CAMBIO AQUÍ: Tipado de la respuesta esperada
    clientes.value = response.data; // Asumiendo que la API devuelve el array directamente en response.data
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    // Manejar error, por ejemplo, mostrar notificación al usuario
  }
};

const openModal = (clienteToEdit: Cliente | null = null) => { // <--- CAMBIO AQUÍ: Tipado del parámetro
  errors.value = {}; // Limpiar errores al abrir
  if (clienteToEdit) {
    isEditing.value = true;
    form.id_cliente = clienteToEdit.id_cliente;
    form.nombre_completo = clienteToEdit.nombre_completo;
    form.direccion = clienteToEdit.direccion || ''; // Asignar '' si es null o undefined
    form.telefono = clienteToEdit.telefono || '';   // Asignar '' si es null o undefined
  } else {
    isEditing.value = false;
    resetForm();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // resetForm() se llama al abrir para "nuevo", así que no es estrictamente necesario aquí.
  // Pero limpiar errores sí es buena idea.
  errors.value = {};
};

const resetForm = () => {
  form.id_cliente = null;
  form.nombre_completo = '';
  form.direccion = '';
  form.telefono = '';
  // errors.value = {}; // También se puede limpiar aquí si se prefiere
};

const saveCliente = async () => {
  try {
    errors.value = {}; // Limpiar errores previos

    // Crear un objeto para validar que solo contenga los campos que Zod espera
    // y maneje los campos opcionales correctamente (si están vacíos y son opcionales).
    const dataToValidate: Partial<ClienteForm> = {
        nombre_completo: form.nombre_completo,
    };
    if (form.direccion) dataToValidate.direccion = form.direccion;
    if (form.telefono) dataToValidate.telefono = form.telefono;


    const validatedData = clienteSchema.parse(dataToValidate);

    // Preparar los datos a enviar, asegurando que los campos opcionales vacíos
    // se envíen como el backend los espere (ej. null, undefined, o no se envíen)
    // Zod con .optional() resultará en 'undefined' si el campo no está.
    // Si el backend espera 'null' para opcionales vacíos y Zod da 'undefined',
    // podrías necesitar un mapeo adicional. Por ahora, enviamos lo que Zod valida.

    const dataToSend = { ...validatedData }; // validatedData ya tiene la forma correcta para enviar si Zod está bien configurado

    if (isEditing.value && form.id_cliente !== null) {
      await api.put(`/clientes/${form.id_cliente}`, dataToSend);
    } else {
      await api.post('/clientes', dataToSend);
    }

    closeModal();
    resetForm(); // Limpiar el formulario después de guardar exitosamente
    loadClientes(); // Recargar la lista
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      errors.value = newErrors;
    } else {
      console.error('Error al guardar cliente:', error);
      // Mostrar error genérico al usuario
    }
  }
};

const deleteCliente = async (clienteToDelete: Cliente) => { // <--- CAMBIO AQUÍ: Tipado del parámetro
  if (confirm(`¿Estás seguro de eliminar a ${clienteToDelete.nombre_completo}?`)) {
    try {
      await api.delete(`/clientes/${clienteToDelete.id_cliente}`);
      loadClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      // Mostrar error al usuario
    }
  }
};

onMounted(() => {
  loadClientes();
});
</script>

<style scoped>
/* Estilos compartidos con PersonalView */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px; /* Añadido padding para consistencia con ArreglosView */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 1.875rem; /* ~30px */
  font-weight: 700;
  color: #1f2937; /* Tailwind gray-800 */
}

.btn { /* Estilo base para botones si no lo tienes global */
  padding: 0.5rem 1rem; /* 8px 16px */
  border: none;
  border-radius: 0.375rem; /* 6px */
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-primary { /* Reutilizado de ArreglosView */
  background-color: #3b82f6; /* Tailwind blue-500 */
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem; /* 6px */
}
.btn-primary:hover {
  background-color: #2563eb; /* Tailwind blue-600 */
}
.btn-secondary { /* Reutilizado de ArreglosView */
  background-color: #e5e7eb; /* Tailwind gray-200 */
  color: #374151;       /* Tailwind gray-700 */
}
.btn-secondary:hover {
  background-color: #d1d5db; /* Tailwind gray-300 */
}


.table-container { /* Añadido de ArreglosView */
  overflow-x: auto;
}
.table { /* Añadido de ArreglosView */
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem; /* Espacio debajo de la tabla */
}
.table th, .table td { /* Añadido de ArreglosView */
  border: 1px solid #e2e8f0; /* Tailwind slate-200 */
  padding: 0.75rem; /* 12px */
  text-align: left;
}
.table th { /* Añadido de ArreglosView */
  background-color: #f1f5f9; /* Tailwind slate-100 */
}


.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  border: none;
  background: transparent; /* #f3f4f6; */
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280; /* Tailwind gray-500 */
}

.btn-icon:hover {
  /* background: #e5e7eb; */
  color: #1f2937; /* Tailwind gray-800 */
}

.btn-icon-danger { /* Ajuste para que el color inicial sea el de peligro */
    color: #ef4444; /* Tailwind red-500 */
}
.btn-icon-danger:hover {
  /* background: #fee2e2; */
  color: #b91c1c; /* Tailwind red-700 */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); /* Mejorada sombra */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem; /* Ajustado padding */
  border-bottom: 1px solid #e5e7eb; /* Tailwind gray-200 */
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827; /* Tailwind gray-900 */
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280; /* Tailwind gray-500 */
}
.close-btn:hover {
    color: #111827; /* Tailwind gray-900 */
}

.modal-body {
  padding: 1.5rem;
}

.modal-body .form-group { /* Añadido de ArreglosView */
  margin-bottom: 1rem; /* 16px */
}
.form-label { /* Añadido de ArreglosView */
  display: block;
  margin-bottom: 0.375rem; /* 6px */
  font-weight: 500; /* semi-bold */
  color: #374151; /* Tailwind gray-700 */
}
.form-input { /* Añadido de ArreglosView */
  width: 100%;
  padding: 0.625rem 0.75rem; /* 10px 12px */
  border: 1px solid #d1d5db; /* Tailwind gray-300 */
  border-radius: 0.375rem; /* 6px */
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-input:focus { /* Añadido para mejor UX */
    border-color: #3b82f6; /* Tailwind blue-500 */
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}


.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem; /* 12px */
  padding: 1.25rem 1.5rem; /* Ajustado padding */
  border-top: 1px solid #e5e7eb; /* Tailwind gray-200 */
  background-color: #f9fafb; /* Tailwind gray-50 */
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.input-error {
  border-color: #ef4444 !important; /* Tailwind red-500 */
}
.form-error { /* Añadido de ArreglosView */
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem; /* 4px */
}
</style>