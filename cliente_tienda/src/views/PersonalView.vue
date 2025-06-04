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
        <label for="filtroEstatusPersonal" class="form-label sr-only">Filtrar por estatus:</label>
        <select id="filtroEstatusPersonal" v-model="filtroEstatus" @change="loadPersonal" class="form-input">
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
              <p>No hay pedidos asignados a este personal.</p>
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
          <div class="modal-footer">
            <button type="button" @click="closePedidosModal" class="btn btn-secondary">Cerrar</button>
          </div>
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
  EyeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

// --- Definición de Interfaces ---
// (Idealmente, mover a un archivo src/types.ts e importarlas)
interface Personal {
  id: number | string; // El tipo de ID que use tu API
  nombre_completo: string;
  direccion?: string | null;
  telefono?: string | null;
  estatus: number; // 1 para Vigente, 2 para Baja (según la lógica de la tabla)
}

interface PersonalForm {
  id: number | string | null; // null para nuevo
  nombre_completo: string;
  direccion: string; // En el form, los inputs son strings
  telefono: string;  // En el form, los inputs son strings
  estatus: string;   // En el form, el valor del select es string ("1" o "2")
}

// Interfaz para los pedidos que se muestran en el modal
// Esta podría ser la misma interfaz 'Pedido' que usaste en PedidosView.vue
// Si es así, impórtala desde tu archivo de tipos compartido.
interface PedidoParaPersonal {
  folio: string | number;
  cliente_nombre?: string;
  arreglo_descripcion?: string;
  fecha_entrega: string; // Asumiendo string de fecha ISO
  entregado: number; // 1 para Entregado, 2 para Pendiente
  precio_sugerido?: number | string; // Puede ser opcional si no siempre se muestra
}

// --- Variables Reactivas Tipadas ---
const personal = ref<Personal[]>([]);       // <--- CAMBIO AQUÍ
const filtroEstatus = ref<string>('');     // El valor del select es string
const showModal = ref(false);
const showPedidosModal = ref(false);
const isEditing = ref(false);
const selectedPersonal = ref<Personal | null>(null); // <--- CAMBIO AQUÍ
const pedidos = ref<PedidoParaPersonal[]>([]); // <--- CAMBIO AQUÍ: Para los pedidos del modal

const form = reactive<PersonalForm>({ // <--- CAMBIO AQUÍ
  id: null,
  nombre_completo: '',
  direccion: '',
  telefono: '',
  estatus: '1' // Default "Vigente"
});

const errors = ref<Record<string, string>>({}); // <--- CAMBIO AQUÍ (mejor que any)

// Zod Schema para validación del formulario de Personal
const personalSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  direccion: z.string().optional(),
  telefono: z.string().regex(/^[0-9+-]*$/, 'El teléfono solo puede contener números, guiones o signo +').optional(), // Ajustada regex
  estatus: z.string() // Valida el string "1" o "2" del formulario
});

const loadPersonal = async () => {
  try {
    // Asumiendo que la API devuelve el array directamente en response.data
    // Si es envuelto en { data: [...] }, ajusta el tipado y el acceso.
    const response = await api.get<Personal[]>('/personal');
    const personalData = response.data || []; // Asegurar que es un array

    personal.value = filtroEstatus.value
      ? personalData.filter((p: Personal) => p.estatus === Number(filtroEstatus.value))
      : personalData;
  } catch (error) {
    console.error('Error al cargar personal:', error);
    personal.value = []; // En caso de error, asegurar que sea un array vacío
  }
};

const openModal = (personaToEdit: Personal | null = null) => { // <--- CAMBIO AQUÍ
  errors.value = {};
  if (personaToEdit) {
    isEditing.value = true;
    form.id = personaToEdit.id;
    form.nombre_completo = personaToEdit.nombre_completo;
    form.direccion = personaToEdit.direccion || '';
    form.telefono = personaToEdit.telefono || '';
    form.estatus = String(personaToEdit.estatus); // Convertir a string para el select
  } else {
    isEditing.value = false;
    resetForm();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // resetForm() se llama al abrir para nuevo, errores se limpian al abrir también.
  errors.value = {};
};

const resetForm = () => {
  form.id = null;
  form.nombre_completo = '';
  form.direccion = '';
  form.telefono = '';
  form.estatus = '1'; // Default "Vigente"
};

const savePersonal = async () => {
  try {
    errors.value = {};
    const validatedFormData = personalSchema.parse(form); // form ya es PersonalForm

    // Convertir estatus a número si el backend lo espera así
    const dataToSend = {
      ...validatedFormData,
      estatus: Number(validatedFormData.estatus)
    };

    if (isEditing.value && form.id !== null) {
      await api.put(`/personal/${form.id}`, dataToSend);
    } else {
      // 'dataToSend' ya no tiene 'id' en su tipo (porque no está en personalSchema)
      // y el backend se encarga de generar el id para nuevo personal.
      await api.post('/personal', dataToSend);
    }

    closeModal();
    resetForm();
    loadPersonal();
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
      console.error('Error al guardar personal:', error);
      // Mostrar error genérico al usuario
    }
  }
};

const deletePersonal = async (personaToDelete: Personal) => { // <--- CAMBIO AQUÍ
  if (confirm(`¿Estás seguro de dar de baja a ${personaToDelete.nombre_completo}? Esto cambiará su estatus.`)) {
    try {
      // Asumiendo que el backend maneja el cambio de estatus en el DELETE
      // o si tienes un endpoint específico para cambiar estatus (ej. PUT /personal/:id/estatus)
      // Por ahora, se asume que el DELETE maneja la baja lógica o la eliminación.
      await api.put(`/personal/${personaToDelete.id}`, { ...personaToDelete, estatus: 2 }); // Ejemplo: dar de baja cambiando estatus
      // O si es un delete real: await api.delete(`/personal/${personaToDelete.id}`);
      loadPersonal();
    } catch (error) {
      console.error('Error al dar de baja personal:', error);
    }
  }
};

const verPedidos = async (persona: Personal) => { // <--- CAMBIO AQUÍ
  selectedPersonal.value = persona;
  try {
    // Asumiendo que la API devuelve el array directamente en response.data
    const response = await api.get<PedidoParaPersonal[]>(`/personal/${persona.id}/pedidos`);
    pedidos.value = response.data || []; // Asegurar array en caso de respuesta vacía o inesperada
    showPedidosModal.value = true;
  } catch (error) {
    console.error('Error al cargar pedidos del personal:', error);
    pedidos.value = []; // Limpiar en caso de error
  }
};

const closePedidosModal = () => {
  showPedidosModal.value = false;
  pedidos.value = []; // Limpiar la lista de pedidos del modal
  selectedPersonal.value = null; // Limpiar la persona seleccionada
};

const formatDate = (dateString: string | Date | null | undefined): string => { // Misma función que en PedidosView
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
    return 'Fecha inválida';
  }
};

onMounted(() => {
  loadPersonal();
});
</script>

<style scoped>
/* Reutiliza estilos de ClientesView.vue si son aplicables y añade los específicos */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
.btn-primary { /* Reutilizado */
  background-color: #3b82f6; color: white; display: inline-flex; align-items: center; gap: 6px;
  padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;
}
.btn-primary:hover { background-color: #2563eb; }
.btn-secondary { /* Reutilizado */
  background-color: #e5e7eb; color: #374151;
  padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;
}
.btn-secondary:hover { background-color: #d1d5db; }

.filters {
  margin-bottom: 1.5rem;
  display: flex; /* Para alinear label (si la hubiera) y select */
  gap: 0.5rem;
  align-items: center;
}
.filters .form-input, .filters select { /* Aplicar clase form-input para consistencia */
  width: auto; /* O un min-width */
  min-width: 200px;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
}
.filters .form-input:focus, .filters select:focus {
    border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}
.sr-only { /* Para labels ocultas visualmente pero accesibles */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}


.table-container { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
.table th, .table td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; font-size: 0.875rem; }
.table th { background-color: #f8fafc; font-weight: 600; }

.badge { padding: 0.25em 0.6em; font-size: 0.75rem; font-weight: 700; border-radius: 0.375rem;}
.badge-success { background-color: #dcfce7; color: #16a34a; }
.badge-danger { background-color: #fee2e2; color: #dc2626; }
.badge-warning { background-color: #fef3c7; color: #b45309; } /* Para Pendiente en modal de pedidos */


.actions { display: flex; gap: 0.5rem; }
.btn-icon {
  padding: 0.5rem; border: none; background: transparent; border-radius: 0.375rem;
  cursor: pointer; transition: all 0.2s; color: #6b7280;
}
.btn-icon:hover { color: #1f2937; }
.btn-icon-danger { color: #ef4444; }
.btn-icon-danger:hover { color: #b91c1c; }

.modal-overlay { /* Reutilizado */
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal { /* Reutilizado */
  background: white; border-radius: 0.5rem; width: 90%;
  max-width: 500px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
}
.modal-large { max-width: 800px; }
.modal-header { /* Reutilizado */
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb;
}
.modal-header h3 { font-size: 1.25rem; font-weight: 600; margin:0; }
.close-btn { background: none; border: none; cursor: pointer; color: #6b7280; }
.close-btn:hover { color: #111827; }

.modal-body { padding: 1.5rem; overflow-y: auto; }
.modal-body .form-group { margin-bottom: 1rem; } /* Reutilizado */
.form-label { display: block; margin-bottom: 0.375rem; font-weight: 500; } /* Reutilizado */
.form-input { /* Reutilizado */
  width: 100%; padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;
}
.form-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
.input-error { border-color: #ef4444 !important; } /* Reutilizado */
.form-error { color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; } /* Reutilizado */


.modal-footer { /* Reutilizado */
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background-color: #f9fafb;
  border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}
</style>