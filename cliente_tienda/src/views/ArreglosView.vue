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
import api from '@/services/api'; // Asegúrate que este servicio esté correctamente configurado
import { z } from 'zod';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

// --- Definición de la Interfaz para Arreglo ---
// Puedes mover esto a un archivo separado (ej. src/types/Arreglo.ts) e importarlo
interface Arreglo {
  id_arreglo: number; // o string, según lo que devuelva tu API
  descripcion: string;
  tipo_arreglo: number; // El API probablemente devuelve un número para el tipo
  estatus: number;      // El API probablemente devuelve un número para el estatus (1 para Vigente, 2 para No Vigente)
}

// --- Definición de la Interfaz para el Formulario ---
interface ArregloForm {
  id_arreglo: number | null;
  descripcion: string;
  tipo_arreglo: string; // En el form, los valores del select son strings
  estatus: string;      // En el form, los valores del select son strings
}

// --- Variables Reactivas Tipadas ---
const arreglos = ref<Arreglo[]>([]); // <--- CAMBIO AQUÍ: Tipado explícito
const filtroTipo = ref<string>('');   // Los valores de los select son strings
const filtroEstatus = ref<string>('');// Los valores de los select son strings
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive<ArregloForm>({ // <--- CAMBIO AQUÍ: Tipado explícito
  id_arreglo: null,
  descripcion: '',
  tipo_arreglo: '', // Valor inicial para "Seleccionar tipo"
  estatus: '1'      // Valor inicial para "Vigente"
});

// El tipo para errors puede ser más específico si conoces las claves, pero Record<string, string> es un buen comienzo.
const errors = ref<Record<string, string>>({}); // <--- CAMBIO AQUÍ: Tipado más específico que 'any'

// Zod Schema para validación (ya estaba bien, pero verifica que coincida con ArregloForm)
const arregloSchema = z.object({
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  tipo_arreglo: z.string().min(1, 'Debe seleccionar un tipo'), // Valida el string del form
  // estatus no es requerido aquí porque tiene un valor por defecto y no se valida explícitamente
  // Si estatus fuera requerido en el form y pudiera estar vacío, deberías añadirlo aquí.
});

const tipoLabels: Record<number, string> = {
  1: 'Ramo',
  2: 'Centro de mesa',
  3: 'Corona',
  4: 'Mixto'
};

const getTipoLabel = (tipo: number | string): string => {
  // Convertimos a número por si acaso, ya que la interfaz Arreglo lo tiene como número
  const tipoNum = Number(tipo);
  return tipoLabels[tipoNum] || 'Desconocido';
};

const loadArreglos = async () => {
  try {
    const params = new URLSearchParams();
    if (filtroTipo.value) params.append('tipo', filtroTipo.value);
    if (filtroEstatus.value) params.append('estatus', filtroEstatus.value);

    // Asumimos que api.get devuelve { data: Arreglo[] }
    const response = await api.get<{ data: Arreglo[] }>(`/arreglos?${params.toString()}`); // <--- CAMBIO AQUÍ: Tipado de la respuesta esperada
    arreglos.value = response.data.data; // Ajusta esto si la estructura de tu respuesta es diferente (ej. si es response.data directamente)
  } catch (error) {
    console.error('Error al cargar arreglos:', error);
    // Aquí podrías añadir lógica para mostrar un error al usuario
  }
};

const openModal = (arregloToEdit: Arreglo | null = null) => { // <--- CAMBIO AQUÍ: Tipado del parámetro
  errors.value = {}; // Limpiar errores al abrir el modal
  if (arregloToEdit) {
    isEditing.value = true;
    form.id_arreglo = arregloToEdit.id_arreglo;
    form.descripcion = arregloToEdit.descripcion;
    form.tipo_arreglo = String(arregloToEdit.tipo_arreglo); // Convertir a string para el select
    form.estatus = String(arregloToEdit.estatus);        // Convertir a string para el select
  } else {
    isEditing.value = false;
    resetForm();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // No es necesario resetForm() aquí si se limpia al abrir para 'nuevo' y se llena para 'editar'
  // Pero sí es bueno limpiar los errores.
  errors.value = {};
};

const resetForm = () => {
  form.id_arreglo = null;
  form.descripcion = '';
  form.tipo_arreglo = '';
  form.estatus = '1'; // Restablecer al valor por defecto
  // errors.value = {}; // También se puede limpiar aquí si se prefiere
};

const saveArreglo = async () => {
  try {
    errors.value = {}; // Limpiar errores previos
    // Validar solo las partes del form que corresponden al schema
    const validatedFormParts = {
      descripcion: form.descripcion,
      tipo_arreglo: form.tipo_arreglo,
      // estatus no está en el schema, se toma directamente de form.estatus
    };
    const validatedData = arregloSchema.parse(validatedFormParts);

    // Construir el objeto a enviar, convirtiendo a número donde sea necesario
    const dataToSend = {
      descripcion: validatedData.descripcion,
      tipo_arreglo: Number(validatedData.tipo_arreglo),
      estatus: Number(form.estatus) // Tomar el estatus del form y convertirlo
    };

    if (isEditing.value && form.id_arreglo !== null) { // Añadida verificación de form.id_arreglo no nulo
      await api.put(`/arreglos/${form.id_arreglo}`, dataToSend);
    } else {
      await api.post('/arreglos', dataToSend);
    }

    closeModal();
    resetForm(); // Limpiar el formulario después de guardar exitosamente
    loadArreglos(); // Recargar la lista
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path[0]) { // Asegurarse de que path[0] exista
          newErrors[err.path[0] as string] = err.message;
        }
      });
      errors.value = newErrors;
    } else {
      console.error('Error al guardar arreglo:', error);
      // Aquí podrías mostrar un error genérico al usuario
    }
  }
};

const deleteArreglo = async (arregloToDelete: Arreglo) => { // <--- CAMBIO AQUÍ: Tipado del parámetro
  if (confirm(`¿Estás seguro de dar de baja "${arregloToDelete.descripcion}"? Esta acción cambiará su estatus a 'No vigente'.`)) {
    try {
      // Asumiendo que tu API de DELETE cambia el estatus en lugar de borrar físicamente,
      // o si borra, entonces el mensaje de confirmación debería ser diferente.
      // Si el delete realmente cambia el estatus a 'No Vigente' (ej. estatus = 2),
      // el backend debería manejar esa lógica.
      // Si la API espera un cambio de estatus, quizá deberías usar un PUT:
      // await api.put(`/arreglos/${arregloToDelete.id_arreglo}`, { ...arregloToDelete, estatus: 2 });
      // O si es un DELETE estándar:
      await api.delete(`/arreglos/${arregloToDelete.id_arreglo}`);
      loadArreglos();
    } catch (error) {
      console.error('Error al dar de baja arreglo:', error);
      // Mostrar error al usuario
    }
  }
};

onMounted(() => {
  loadArreglos();
});
</script>

<style scoped>
/* Tus estilos .page-container, .page-header, etc. deberían estar aquí o en un archivo global */
/* Ejemplo de algunos estilos básicos para el modal y la tabla si no los tienes */
.page-container {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.filters-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.table-container {
  overflow-x: auto; /* Para tablas anchas en móvil */
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  text-align: left;
}
.table th {
  background-color: #f1f5f9;
}
.badge {
  padding: 0.25em 0.6em;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
}
.badge-info {
  background-color: #cffafe; /* Tailwind cyan-100 */
  color: #0891b2;       /* Tailwind cyan-600 */
}
.badge-success {
  background-color: #dcfce7; /* Tailwind green-100 */
  color: #16a34a;       /* Tailwind green-600 */
}
.badge-danger {
  background-color: #fee2e2; /* Tailwind red-100 */
  color: #dc2626;       /* Tailwind red-600 */
}
.actions {
  display: flex;
  gap: 8px;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #4b5563; /* Tailwind gray-600 */
}
.btn-icon:hover {
  color: #1f2937; /* Tailwind gray-800 */
}
.btn-icon-danger {
  color: #ef4444; /* Tailwind red-500 */
}
.btn-icon-danger:hover {
  color: #b91c1c; /* Tailwind red-700 */
}

/* Estilos del Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.modal-body .form-group {
  margin-bottom: 15px;
}
.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-sizing: border-box;
}
.input-error {
  border-color: #ef4444; /* Tailwind red-500 */
}
.form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e5e7eb;
  padding-top: 15px;
  margin-top: 20px;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary {
  background-color: #3b82f6; /* Tailwind blue-500 */
  color: white;
  display: inline-flex; /* Para alinear icono y texto */
  align-items: center;
  gap: 6px; /* Espacio entre icono y texto */
}
.btn-primary:hover {
  background-color: #2563eb; /* Tailwind blue-600 */
}
.btn-secondary {
  background-color: #e5e7eb; /* Tailwind gray-200 */
  color: #374151;       /* Tailwind gray-700 */
}
.btn-secondary:hover {
  background-color: #d1d5db; /* Tailwind gray-300 */
}
</style>