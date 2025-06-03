<template>
  <MainLayout>
    <div class="page-container">
      <div class="page-header">
        <h2>Gestión de Personal</h2>
        <button @click="openModal()" class="btn btn-primary">
          <PlusIcon class="w-5 h-5" />
          Agregar Personal
        </button>
      </div>
      
      <div class="filters">
        <select v-model="filtroEstatus" @change="loadPersonal" class="form-input">
          <option value="">Todos</option>
          <option value="1">Vigente</option>
          <option value="2">Baja</option>
        </select>
      </div>
      
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="persona in personal" :key="persona.id">
              <td>{{ persona.id }}</td>
              <td>{{ persona.nombre_completo }}</td>
              <td>{{ persona.direccion || '-' }}</td>
              <td>{{ persona.telefono || '-' }}</td>
              <td>
                <span class="badge" :class="persona.estatus === 1 ? 'badge-success' : 'badge-danger'">
                  {{ persona.estatus === 1 ? 'Vigente' : 'Baja' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button @click="verPedidos(persona)" class="btn-icon" title="Ver pedidos">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button @click="openModal(persona)" class="btn-icon" title="Editar">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button @click="deletePersonal(persona)" class="btn-icon btn-icon-danger" title="Dar de baja">
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
            <h3>{{ isEditing ? 'Editar Personal' : 'Agregar Personal' }}</h3>
            <button @click="closeModal" class="close-btn">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="savePersonal" class="modal-body">
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
            
            <div class="form-group">
              <label class="form-label">Estatus</label>
              <select v-model="form.estatus" class="form-input">
                <option value="1">Vigente</option>
                <option value="2">Baja</option>
              </select>
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
      
      <!-- Modal de pedidos -->
      <div v-if="showPedidosModal" class="modal-overlay" @click.self="closePedidosModal">
        <div class="modal modal-large">
          <div class="modal-header">
            <h3>Pedidos de {{ selectedPersonal?.nombre_completo }}</h3>
            <button @click="closePedidosModal" class="close-btn">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="modal-body">
            <div v-if="pedidos.length === 0" class="empty-state">
              <p>No hay pedidos asignados a este personal</p>
            </div>
            
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>Arreglo</th>
                    <th>Fecha Entrega</th>
                    <th>Estado</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in pedidos" :key="pedido.folio">
                    <td>{{ pedido.folio }}</td>
                    <td>{{ pedido.cliente_nombre }}</td>
                    <td>{{ pedido.arreglo_descripcion }}</td>
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
  EyeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const personal = ref([]);
const filtroEstatus = ref('');
const showModal = ref(false);
const showPedidosModal = ref(false);
const isEditing = ref(false);
const selectedPersonal = ref(null);
const pedidos = ref([]);

const form = reactive({
  id: null,
  nombre_completo: '',
  direccion: '',
  telefono: '',
  estatus: '1'
});

const errors = ref<any>({});

const personalSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  direccion: z.string().optional(),
  telefono: z.string().regex(/^[0-9-]+$/, 'El teléfono solo puede contener números y guiones').optional(),
  estatus: z.string()
});

const loadPersonal = async () => {
  try {
    const response = await api.get('/personal');
    personal.value = filtroEstatus.value 
      ? response.data.filter((p: any) => p.estatus === Number(filtroEstatus.value))
      : response.data;
  } catch (error) {
    console.error('Error al cargar personal:', error);
  }
};

const openModal = (persona: any = null) => {
  if (persona) {
    isEditing.value = true;
    form.id = persona.id;
    form.nombre_completo = persona.nombre_completo;
    form.direccion = persona.direccion || '';
    form.telefono = persona.telefono || '';
    form.estatus = String(persona.estatus);
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
  form.id = null;
  form.nombre_completo = '';
  form.direccion = '';
  form.telefono = '';
  form.estatus = '1';
};

const savePersonal = async () => {
  try {
    errors.value = {};
    const validatedData = personalSchema.parse(form);
    
    if (isEditing.value) {
      await api.put(`/personal/${form.id}`, validatedData);
    } else {
      await api.post('/personal', validatedData);
    }
    
    closeModal();
    loadPersonal();
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        errors.value[err.path[0]] = err.message;
      });
    }
  }
};

const deletePersonal = async (persona: any) => {
  if (confirm(`¿Estás seguro de dar de baja a ${persona.nombre_completo}?`)) {
    try {
      await api.delete(`/personal/${persona.id}`);
      loadPersonal();
    } catch (error) {
      console.error('Error al dar de baja personal:', error);
    }
  }
};

const verPedidos = async (persona: any) => {
  selectedPersonal.value = persona;
  try {
    const response = await api.get(`/personal/${persona.id}/pedidos`);
    pedidos.value = response.data;
    showPedidosModal.value = true;
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
  }
};

const closePedidosModal = () => {
  showPedidosModal.value = false;
  pedidos.value = [];
  selectedPersonal.value = null;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX');
};

onMounted(() => {
  loadPersonal();
});
</script>

<style scoped>
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

.filters {
  margin-bottom: 1.5rem;
}

.filters select {
  width: 200px;
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

.modal-large {
  max-width: 800px;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.badge-danger {
  background-color: #fee2e2;
  color: #dc2626;
}
</style>
