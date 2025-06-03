<template>
  <MainLayout>
    <div class="page-container">
      <div class="page-header">
        <h2>Arreglos Florales</h2>
        <button @click="openModal()" class="btn btn-primary">
          <PlusIcon class="w-5 h-5" />
          Agregar Arreglo
        </button>
      </div>
      
      <div class="filters-container">
        <div class="filter-group">
          <label>Tipo de arreglo:</label>
          <select v-model="filtroTipo" @change="loadArreglos" class="form-input">
            <option value="">Todos</option>
            <option value="1">Ramo</option>
            <option value="2">Centro de mesa</option>
            <option value="3">Corona</option>
            <option value="4">Mixto</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Estatus:</label>
          <select v-model="filtroEstatus" @change="loadArreglos" class="form-input">
            <option value="">Todos</option>
            <option value="1">Vigente</option>
            <option value="2">No vigente</option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="arreglo in arreglos" :key="arreglo.id_arreglo">
              <td>{{ arreglo.id_arreglo }}</td>
              <td>{{ arreglo.descripcion }}</td>
              <td>
                <span class="badge badge-info">
                  {{ getTipoLabel(arreglo.tipo_arreglo) }}
                </span>
              </td>
              <td>
                <span class="badge" :class="arreglo.estatus === 1 ? 'badge-success' : 'badge-danger'">
                  {{ arreglo.estatus === 1 ? 'Vigente' : 'No vigente' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button @click="openModal(arreglo)" class="btn-icon" title="Editar">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button @click="deleteArreglo(arreglo)" class="btn-icon btn-icon-danger" title="Dar de baja">
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
            <h3>{{ isEditing ? 'Editar Arreglo' : 'Agregar Arreglo' }}</h3>
            <button @click="closeModal" class="close-btn">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveArreglo" class="modal-body">
            <div class="form-group">
              <label class="form-label">Descripción *</label>
              <input
                v-model="form.descripcion"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.descripcion }"
                required
              />
              <p v-if="errors.descripcion" class="form-error">{{ errors.descripcion }}</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Tipo de Arreglo *</label>
              <select
                v-model="form.tipo_arreglo"
                class="form-input"
                :class="{ 'input-error': errors.tipo_arreglo }"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="1">Ramo</option>
                <option value="2">Centro de mesa</option>
                <option value="3">Corona</option>
                <option value="4">Mixto</option>
              </select>
              <p v-if="errors.tipo_arreglo" class="form-error">{{ errors.tipo_arreglo }}</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Estatus</label>
              <select v-model="form.estatus" class="form-input">
                <option value="1">Vigente</option>
                <option value="2">No vigente</option>
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

const arreglos = ref([]);
const filtroTipo = ref('');
const filtroEstatus = ref('');
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive({
  id_arreglo: null,
  descripcion: '',
  tipo_arreglo: '',
  estatus: '1'
});

const errors = ref<any>({});

const arregloSchema = z.object({
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  tipo_arreglo: z.string().min(1, 'Debe seleccionar un tipo'),
  estatus: z.string()
});

const tipoLabels: Record<number, string> = {
  1: 'Ramo',
  2: 'Centro de mesa',
  3: 'Corona',
  4: 'Mixto'
};

const getTipoLabel = (tipo: number) => tipoLabels[tipo] || 'Desconocido';

const loadArreglos = async () => {
  try {
    const params = new URLSearchParams();
    if (filtroTipo.value) params.append('tipo', filtroTipo.value);
    if (filtroEstatus.value) params.append('estatus', filtroEstatus.value);
    
    const response = await api.get(`/arreglos?${params}`);
    arreglos.value = response.data;
  } catch (error) {
    console.error('Error al cargar arreglos:', error);
  }
};

const openModal = (arreglo: any = null) => {
  if (arreglo) {
    isEditing.value = true;
    form.id_arreglo = arreglo.id_arreglo;
    form.descripcion = arreglo.descripcion;
    form.tipo_arreglo = String(arreglo.tipo_arreglo);
    form.estatus = String(arreglo.estatus);
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
  form.id_arreglo = null;
  form.descripcion = '';
  form.tipo_arreglo = '';
  form.estatus = '1';
};

const saveArreglo = async () => {
  try {
    errors.value = {};
    const validatedData = arregloSchema.parse(form);
    
    const dataToSend = {
      ...validatedData,
      tipo_arreglo: Number(validatedData.tipo_arreglo),
      estatus: Number(validatedData.estatus)
    };
    
    if (isEditing.value) {
      await api.put(`/arreglos/${form.id_arreglo}`, dataToSend);
    } else {
      await api.post('/arreglos', dataToSend);
    }
    
    closeModal();
    loadArreglos();
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        errors.value[err.path[0]] = err.message;
      });
    }
  }
};

const deleteArreglo = async (arreglo: any) => {
  if (confirm(`¿Estás seguro de dar de baja "${arreglo.descripcion}"?`)) {
    try {
      await api.delete(`/arreglos/${arreglo.id_arreglo}`);
      loadArreglos();
    } catch (error) {
      console.error('Error al dar de baja arreglo:', error);
    }
  }
};

onMounted(() => {
  loadArreglos();
});
</script>

<style scoped>
.badge-info {
  background-color: #dbeafe;
  color: #1e40af;
}
</style>