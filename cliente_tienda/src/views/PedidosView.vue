<template>
  <MainLayout>
    <div class="page-container">
      <div class="page-header">
        <h2>Gestión de Pedidos</h2>
        <button @click="openModal()" class="btn btn-primary">
          <PlusIcon class="w-5 h-5" />
          Nuevo Pedido
        </button>
      </div>
      
      <div class="filters-container">
        <div class="filter-group">
          <label>Estado de entrega:</label>
          <select v-model="filters.entregado" @change="loadPedidos" class="form-input">
            <option value="">Todos</option>
            <option value="1">Entregados</option>
            <option value="2">Pendientes</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Estado de pago:</label>
          <select v-model="filters.pagado" @change="loadPedidos" class="form-input">
            <option value="">Todos</option>
            <option value="1">Pagados</option>
            <option value="2">Por pagar</option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Arreglo</th>
              <th>Fecha Pedido</th>
              <th>Fecha Entrega</th>
              <th>Personal</th>
              <th>Precio</th>
              <th>Entregado</th>
              <th>Pagado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidos" :key="pedido.folio">
              <td>{{ pedido.folio }}</td>
              <td>{{ pedido.cliente_nombre }}</td>
              <td>{{ pedido.arreglo_descripcion }}</td>
              <td>{{ formatDate(pedido.fecha_pedido) }}</td>
              <td>{{ formatDate(pedido.fecha_entrega) }}</td>
              <td>{{ pedido.personal_nombre || '-' }}</td>
              <td>${{ pedido.precio_sugerido }}</td>
              <td>
                <span class="badge" :class="pedido.entregado === 1 ? 'badge-success' : 'badge-warning'">
                  {{ pedido.entregado === 1 ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="pedido.pagado === 1 ? 'badge-success' : 'badge-danger'">
                  {{ pedido.pagado === 1 ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button @click="openModal(pedido)" class="btn-icon" title="Editar">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Modal de formulario -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal modal-large">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Editar Pedido' : 'Nuevo Pedido' }}</h3>
            <button @click="closeModal" class="close-btn">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="savePedido" class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Cliente *</label>
                <select
                  v-model="form.id_cliente"
                  class="form-input"
                  :class="{ 'input-error': errors.id_cliente }"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  <option v-for="cliente in clientes" :key="cliente.id_cliente" :value="cliente.id_cliente">
                    {{ cliente.nombre_completo }}
                  </option>
                </select>
                <p v-if="errors.id_cliente" class="form-error">{{ errors.id_cliente }}</p>
              </div>
              
              <div class="form-group">
                <label class="form-label">Arreglo Floral *</label>
                <select
                  v-model="form.id_arreglo"
                  class="form-input"
                  :class="{ 'input-error': errors.id_arreglo }"
                  required
                >
                  <option value="">Seleccionar arreglo</option>
                  <option v-for="arreglo in arreglos" :key="arreglo.id_arreglo" :value="arreglo.id_arreglo">
                    {{ arreglo.descripcion }}
                  </option>
                </select>
                <p v-if="errors.id_arreglo" class="form-error">{{ errors.id_arreglo }}</p>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Descripción del Pedido</label>
              <textarea
                v-model="form.descripcion"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Fecha de Entrega *</label>
                <input
                  v-model="form.fecha_entrega"
                  type="datetime-local"
                  class="form-input"
                  :class="{ 'input-error': errors.fecha_entrega }"
                  required
                />
                <p v-if="errors.fecha_entrega" class="form-error">{{ errors.fecha_entrega }}</p>
              </div>
              
              <div class="form-group">
                <label class="form-label">Precio Sugerido *</label>
                <input
                  v-model="form.precio_sugerido"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input"
                  :class="{ 'input-error': errors.precio_sugerido }"
                  required
                />
                <p v-if="errors.precio_sugerido" class="form-error">{{ errors.precio_sugerido }}</p>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Dirección de Entrega *</label>
              <input
                v-model="form.direccion_entrega"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.direccion_entrega }"
                required
              />
              <p v-if="errors.direccion_entrega" class="form-error">{{ errors.direccion_entrega }}</p>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Personal Asignado</label>
                <select v-model="form.id_personal" class="form-input">
                  <option value="">Sin asignar</option>
                  <option v-for="persona in personal" :key="persona.id" :value="persona.id">
                    {{ persona.nombre_completo }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Estado de Entrega</label>
                <select v-model="form.entregado" class="form-input">
                  <option value="2">Pendiente</option>
                  <option value="1">Entregado</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Estado de Pago</label>
                <select v-model="form.pagado" class="form-input">
                  <option value="2">Por pagar</option>
                  <option value="1">Pagado</option>
                </select>
              </div>
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
  XMarkIcon
} from '@heroicons/vue/24/outline';

const pedidos = ref([]);
const clientes = ref([]);
const arreglos = ref([]);
const personal = ref([]);
const showModal = ref(false);
const isEditing = ref(false);

const filters = reactive({
  entregado: '',
  pagado: ''
});

const form = reactive({
  folio: '',
  id_cliente: '',
  id_arreglo: '',
  descripcion: '',
  fecha_entrega: '',
  direccion_entrega: '',
  precio_sugerido: '',
  id_personal: '',
  entregado: '2',
  pagado: '2'
});

const errors = ref<any>({});

const pedidoSchema = z.object({
  id_cliente: z.string().min(1, 'Debe seleccionar un cliente'),
  id_arreglo: z.string().min(1, 'Debe seleccionar un arreglo'),
  descripcion: z.string().optional(),
  fecha_entrega: z.string().min(1, 'La fecha de entrega es requerida'),
  direccion_entrega: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  precio_sugerido: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido'),
  id_personal: z.string().optional(),
  entregado: z.string(),
  pagado: z.string()
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX');
};

const formatDateForInput = (date: string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const loadPedidos = async () => {
  try {
    const params = new URLSearchParams();
    if (filters.entregado) params.append('entregado', filters.entregado);
    if (filters.pagado) params.append('pagado', filters.pagado);
    
    const response = await api.get(`/pedidos?${params}`);
    pedidos.value = response.data;
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
  }
};

const loadSelects = async () => {
  try {
    const [clientesRes, arreglosRes, personalRes] = await Promise.all([
      api.get('/clientes'),
      api.get('/arreglos'),
      api.get('/personal')
    ]);
    
    clientes.value = clientesRes.data;
    arreglos.value = arreglosRes.data.filter((a: any) => a.estatus === 1);
    personal.value = personalRes.data.filter((p: any) => p.estatus === 1);
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
};

const openModal = (pedido: any = null) => {
  if (pedido) {
    isEditing.value = true;
    form.folio = pedido.folio;
    form.id_cliente = String(pedido.id_cliente);
    form.id_arreglo = String(pedido.id_arreglo);
    form.descripcion = pedido.descripcion || '';
    form.fecha_entrega = formatDateForInput(pedido.fecha_entrega);
    form.direccion_entrega = pedido.direccion_entrega;
    form.precio_sugerido = String(pedido.precio_sugerido);
    form.id_personal = pedido.id_personal ? String(pedido.id_personal) : '';
    form.entregado = String(pedido.entregado);
    form.pagado = String(pedido.pagado);
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
  form.folio = '';
  form.id_cliente = '';
  form.id_arreglo = '';
  form.descripcion = '';
  form.fecha_entrega = '';
  form.direccion_entrega = '';
  form.precio_sugerido = '';
  form.id_personal = '';
  form.entregado = '2';
  form.pagado = '2';
};

const savePedido = async () => {
  try {
    errors.value = {};
    const validatedData = pedidoSchema.parse(form);
    
    const dataToSend = {
      ...validatedData,
      id_cliente: Number(validatedData.id_cliente),
      id_arreglo: Number(validatedData.id_arreglo),
      precio_sugerido: Number(validatedData.precio_sugerido),
      id_personal: validatedData.id_personal ? Number(validatedData.id_personal) : null,
      entregado: Number(validatedData.entregado),
      pagado: Number(validatedData.pagado)
    };
    
    if (isEditing.value) {
      await api.put(`/pedidos/${form.folio}`, dataToSend);
    } else {
      await api.post('/pedidos', dataToSend);
    }
    
    closeModal();
    loadPedidos();
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        errors.value[err.path[0]] = err.message;
      });
    }
  }
};

onMounted(() => {
  loadPedidos();
  loadSelects();
});
</script>

<style scoped>
.filters-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
}

.filter-group select {
  width: 150px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.modal-large {
  max-width: 700px;
}
</style>