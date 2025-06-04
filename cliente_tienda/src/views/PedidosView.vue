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
import api from '@/services/api'; // Asegúrate que este servicio esté correctamente configurado
import { z } from 'zod';
import {
  PlusIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

// --- Definición de Interfaces ---
// (Idealmente, mover estas a un archivo src/types.ts e importarlas)

interface ClienteMin {
  id_cliente: number | string; // El <select> usa el valor, que puede ser string o number
  nombre_completo: string;
}

interface ArregloMin {
  id_arreglo: number | string;
  descripcion: string;
  estatus?: number; // Para el filtro en loadSelects
}

interface PersonalMin {
  id: number | string; // El <select> usa 'persona.id'
  nombre_completo: string;
  estatus?: number; // Para el filtro en loadSelects
}

interface Pedido {
  folio: string | number;
  cliente_nombre?: string;
  arreglo_descripcion?: string;
  fecha_pedido: string; // Asumiendo string de fecha ISO
  fecha_entrega: string; // Asumiendo string de fecha ISO
  personal_nombre?: string | null;
  precio_sugerido: number | string; // La API puede devolver string o number
  entregado: number; // 1 para Sí/Entregado, 2 para No/Pendiente
  pagado: number;   // 1 para Sí/Pagado, 2 para No/Por pagar

  // Campos que pueden o no venir con el listado principal, pero sí en el form al editar:
  id_cliente?: number;
  id_arreglo?: number;
  descripcion?: string | null; // Descripción específica del pedido
  direccion_entrega?: string;
  id_personal?: number | null;
}

interface PedidoForm {
  folio: string | number | null; // Null para nuevo, valor para editar
  id_cliente: string; // valor del <select> es string
  id_arreglo: string; // valor del <select> es string
  descripcion: string;
  fecha_entrega: string; // valor de input datetime-local es string
  direccion_entrega: string;
  precio_sugerido: string; // input type="number" puede dar string vía v-model
  id_personal: string;     // valor del <select> es string (o "" para "Sin asignar")
  entregado: string;       // "1" o "2"
  pagado: string;          // "1" o "2"
}

interface Filters {
  entregado: string;
  pagado: string;
}

// --- Variables Reactivas Tipadas ---
const pedidos = ref<Pedido[]>([]); // <--- CAMBIO AQUÍ
const clientes = ref<ClienteMin[]>([]); // <--- CAMBIO AQUÍ
const arreglos = ref<ArregloMin[]>([]); // <--- CAMBIO AQUÍ
const personal = ref<PersonalMin[]>([]); // <--- CAMBIO AQUÍ
const showModal = ref(false);
const isEditing = ref(false);

const filters = reactive<Filters>({ // <--- CAMBIO AQUÍ
  entregado: '',
  pagado: ''
});

const form = reactive<PedidoForm>({ // <--- CAMBIO AQUÍ
  folio: '', // Se asigna al editar, no es un campo de entrada para nuevo
  id_cliente: '',
  id_arreglo: '',
  descripcion: '',
  fecha_entrega: '',
  direccion_entrega: '',
  precio_sugerido: '', // Zod espera string, y el input number puede dar string
  id_personal: '',     // '' para "Sin asignar"
  entregado: '2',      // Default "Pendiente"
  pagado: '2'          // Default "Por pagar"
});

const errors = ref<Record<string, string>>({}); // <--- CAMBIO AQUÍ (mejor que any)

// Zod Schema (ya parece estar bien alineado con PedidoForm)
const pedidoSchema = z.object({
  id_cliente: z.string().min(1, 'Debe seleccionar un cliente'),
  id_arreglo: z.string().min(1, 'Debe seleccionar un arreglo'),
  descripcion: z.string().optional(),
  fecha_entrega: z.string().min(1, 'La fecha de entrega es requerida'), // datetime-local input value is string
  direccion_entrega: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  precio_sugerido: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido (ej: 123.45)'),
  id_personal: z.string().optional(), // Puede ser una cadena vacía si no se asigna
  entregado: z.string(), // Validar que sea "1" o "2" si es necesario con .refine() o enum
  pagado: z.string()     // Validar que sea "1" o "2" si es necesario
});

const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric'
      // Considerar añadir hora si es relevante: hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return 'Fecha inválida';
  }
};

const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return ''; // Chequeo por fecha inválida

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
};

const loadPedidos = async () => {
  try {
    const params = new URLSearchParams();
    if (filters.entregado) params.append('entregado', filters.entregado);
    if (filters.pagado) params.append('pagado', filters.pagado);

    // Asumiendo que la API devuelve el array de pedidos directamente en response.data
    // Si es envuelto en { data: [...] }, ajusta el tipado y el acceso.
    const response = await api.get<Pedido[]>(`/pedidos?${params.toString()}`);
    pedidos.value = response.data;
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
  }
};

const loadSelects = async () => {
  try {
    // Asumiendo que cada API devuelve el array directamente en response.data
    const [clientesRes, arreglosRes, personalRes] = await Promise.all([
      api.get<ClienteMin[]>('/clientes'),
      api.get<ArregloMin[]>('/arreglos'),
      api.get<PersonalMin[]>('/personal')
    ]);

    clientes.value = clientesRes.data;
    // Filtrar arreglos y personal por estatus activo (asumiendo estatus 1 es activo)
    arreglos.value = (arreglosRes.data || []).filter((a: ArregloMin) => a.estatus === 1);
    personal.value = (personalRes.data || []).filter((p: PersonalMin) => p.estatus === 1);
  } catch (error) {
    console.error('Error al cargar datos para selects:', error);
  }
};

const openModal = (pedidoToEdit: Pedido | null = null) => { // <--- CAMBIO AQUÍ
  errors.value = {};
  if (pedidoToEdit) {
    isEditing.value = true;
    form.folio = pedidoToEdit.folio;
    form.id_cliente = String(pedidoToEdit.id_cliente || '');
    form.id_arreglo = String(pedidoToEdit.id_arreglo || '');
    form.descripcion = pedidoToEdit.descripcion || '';
    form.fecha_entrega = formatDateForInput(pedidoToEdit.fecha_entrega);
    form.direccion_entrega = pedidoToEdit.direccion_entrega || '';
    form.precio_sugerido = String(pedidoToEdit.precio_sugerido || '');
    form.id_personal = pedidoToEdit.id_personal ? String(pedidoToEdit.id_personal) : '';
    form.entregado = String(pedidoToEdit.entregado);
    form.pagado = String(pedidoToEdit.pagado);
  } else {
    isEditing.value = false;
    resetForm();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // No es necesario resetForm() aquí si se hace al abrir para nuevo y se sobreescribe al editar
  errors.value = {};
};

const resetForm = () => {
  form.folio = null; // O '' si el tipo de folio en PedidoForm es string
  form.id_cliente = '';
  form.id_arreglo = '';
  form.descripcion = '';
  form.fecha_entrega = '';
  form.direccion_entrega = '';
  form.precio_sugerido = ''; // o 0 si prefieres para input number, pero Zod espera string
  form.id_personal = '';
  form.entregado = '2'; // Default "Pendiente"
  form.pagado = '2';   // Default "Por pagar"
};

const savePedido = async () => {
  try {
    errors.value = {};
    // Zod parseará el objeto form (que es PedidoForm)
    const validatedData = pedidoSchema.parse(form);

    // Convertir a los tipos numéricos esperados por el backend
    const dataToSend = {
      ...validatedData, // Incluye descripcion, fecha_entrega, direccion_entrega (todos strings)
      id_cliente: Number(validatedData.id_cliente),
      id_arreglo: Number(validatedData.id_arreglo),
      precio_sugerido: parseFloat(validatedData.precio_sugerido), // Usar parseFloat para decimales
      // id_personal puede ser "" si "Sin asignar" fue seleccionado. Convertir a null si es necesario.
      id_personal: validatedData.id_personal ? Number(validatedData.id_personal) : null,
      entregado: Number(validatedData.entregado),
      pagado: Number(validatedData.pagado)
    };

    if (isEditing.value && form.folio) {
      await api.put(`/pedidos/${form.folio}`, dataToSend);
    } else {
      // 'dataToSend' ya no tiene 'folio' en su tipo (porque no está en pedidoSchema)
      // y el backend se encarga de generar el folio para nuevos pedidos.
      await api.post('/pedidos', dataToSend);
    }

    closeModal();
    resetForm();
    loadPedidos();
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
      console.error('Error al guardar pedido:', error);
      // Mostrar error genérico al usuario
    }
  }
};

onMounted(() => {
  loadPedidos();
  loadSelects();
});
</script>

<style scoped>
/* Reutiliza estilos de ArreglosView y ClientesView si son comunes, o define específicos aquí */
.page-container { /* Estilos base de otros Views */
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.filters-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap; /* Para mejor responsividad */
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
.filter-group select.form-input { /* Aplicar clase form-input para consistencia */
  width: auto; /* O un min-width */
  min-width: 150px;
}

.table-container {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.table th, .table td {
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.875rem;
}
.table th {
  background-color: #f8fafc;
  font-weight: 600;
}

.badge {
  padding: 0.25em 0.6em;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0.375rem;
}
.badge-success { background-color: #dcfce7; color: #16a34a; }
.badge-warning { background-color: #fef3c7; color: #b45309; } /* Para Pendiente */
.badge-danger { background-color: #fee2e2; color: #dc2626; } /* Para Por Pagar */

.actions { display: flex; gap: 8px; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 4px; color: #4b5563; }
.btn-icon:hover { color: #1f2937; }

.modal-overlay { /* Estilos de otros Views */
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal {
  background-color: white; padding: 0; /* Padding se maneja en header/body/footer */
  border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  display: flex; flex-direction: column; /* Para que el body pueda hacer scroll */
  max-height: 90vh; /* Altura máxima del modal */
}
.modal-large { max-width: 700px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb;
}
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 600;}
.close-btn { background: none; border: none; cursor: pointer; padding: 0; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* Scroll para el cuerpo del modal si el contenido es largo */
}
.modal-body .form-group { margin-bottom: 1rem; }
.form-label { display: block; margin-bottom: 0.375rem; font-weight: 500; }
.form-input {
  width: 100%; padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;
}
.form-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
.input-error { border-color: #ef4444 !important; }
.form-error { color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Responsivo */
  gap: 1rem; /* Espacio entre elementos del grid */
}
.form-grid .form-group { /* Para que no haya doble margen si un form-group está en el grid */
    margin-bottom: 0;
}


.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-bottom-left-radius: 8px; /* Para que coincida con el modal */
  border-bottom-right-radius: 8px;
}
.btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; }
.btn-primary { background-color: #3b82f6; color: white; display: inline-flex; align-items: center; gap: 6px; }
.btn-primary:hover { background-color: #2563eb; }
.btn-secondary { background-color: #e5e7eb; color: #374151; }
.btn-secondary:hover { background-color: #d1d5db; }
</style>