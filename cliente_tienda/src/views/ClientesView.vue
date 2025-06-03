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
      
      <!-- Modal de formulario -->
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
import api from '@/services/api';
import { z } from 'zod';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const clientes = ref([]);
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive({
  id_cliente: null,
  nombre_completo: '',
  direccion: '',
  telefono: ''
});

const errors = ref<any>({});

const clienteSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  direccion: z.string().optional(),
  telefono: z.string().regex(/^[0-9-]+$/, 'El teléfono solo puede contener números y guiones').optional()
});

const loadClientes = async () => {
  try {
    const response = await api.get('/clientes');
    clientes.value = response.data;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
};

const openModal = (cliente: any = null) => {
  if (cliente) {
    isEditing.value = true;
    form.id_cliente = cliente.id_cliente;
    form.nombre_completo = cliente.nombre_completo;
    form.direccion = cliente.direccion || '';
    form.telefono = cliente.telefono || '';
  } else {
    isEditing.value = false;
    resetForm();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
  errors.value = {};
};

const resetForm = () => {
  form.id_cliente = null;
  form.nombre_completo = '';
  form.direccion = '';
  form.telefono = '';
};

const saveCliente = async () => {
  try {
    errors.value = {};
    const validatedData = clienteSchema.parse(form);
    
    if (isEditing.value) {
      await api.put(`/clientes/${form.id_cliente}`, validatedData);
    } else {
      await api.post('/clientes', validatedData);
    }
    
    closeModal();
    loadClientes();
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        errors.value[err.path[0]] = err.message;
      });
    }
  }
};

const deleteCliente = async (cliente: any) => {
  if (confirm(`¿Estás seguro de eliminar a ${cliente.nombre_completo}?`)) {
    try {
      await api.delete(`/clientes/${cliente.id_cliente}`);
      loadClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
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
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  border: none;
  background: #f3f4f6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
}

.btn-icon-danger:hover {
  background: #fee2e2;
  color: #dc2626;
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
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.input-error {
  border-color: #ef4444 !important;
}
</style>