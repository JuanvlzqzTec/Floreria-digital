<template>
  <MainLayout>
    <div class="page-container">
      <div class="page-header">
        <h2>Reportes</h2>
      </div>

      <div class="reports-grid">
        <div class="report-card">
          <div class="report-header">
            <h3>Reporte de Clientes</h3>
            <UsersIcon class="w-6 h-6 text-blue-500" />
          </div>
          <p class="report-description">Lista completa de clientes registrados</p>
          <button @click="generarReporte('clientes')" class="btn btn-primary w-full">
            Generar Reporte
          </button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Reporte de Personal</h3>
            <UserGroupIcon class="w-6 h-6 text-green-500" />
          </div>
          <p class="report-description">Lista de personal con filtro por estatus</p>
          <select v-model="filtros.personal.estatus" class="form-input mb-3">
            <option value="">Todos</option>
            <option value="1">Vigente</option>
            <option value="2">Baja</option>
          </select>
          <button @click="generarReporte('personal')" class="btn btn-primary w-full">
            Generar Reporte
          </button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Pedidos por Fecha</h3>
            <CalendarIcon class="w-6 h-6 text-purple-500" />
          </div>
          <p class="report-description">Filtrar pedidos por rango de fechas</p>
          <div class="date-filters">
            <input
              v-model="filtros.pedidos.fecha_inicio"
              type="date"
              class="form-input"
              placeholder="Fecha inicio"
            />
            <input
              v-model="filtros.pedidos.fecha_fin"
              type="date"
              class="form-input"
              placeholder="Fecha fin"
            />
          </div>
          <button @click="generarReporte('pedidos-fecha')" class="btn btn-primary w-full">
            Generar Reporte
          </button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Pedidos por Entrega</h3>
            <TruckIcon class="w-6 h-6 text-orange-500" />
          </div>
          <p class="report-description">Filtrar por estado de entrega</p>
          <select v-model="filtros.pedidos.entregado" class="form-input mb-3">
            <option value="">Todos</option>
            <option value="1">Entregados</option>
            <option value="2">Pendientes</option>
          </select>
          <button @click="generarReporte('pedidos-entrega')" class="btn btn-primary w-full">
            Generar Reporte
          </button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Pedidos por Pago</h3>
            <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          </div>
          <p class="report-description">Filtrar por estado de pago</p>
          <select v-model="filtros.pedidos.pagado" class="form-input mb-3">
            <option value="">Todos</option>
            <option value="1">Pagados</option>
            <option value="2">Por pagar</option>
          </select>
          <button @click="generarReporte('pedidos-pago')" class="btn btn-primary w-full">
            Generar Reporte
          </button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Pedidos por Personal</h3>
            <UserIcon class="w-6 h-6 text-indigo-500" />
          </div>
          <p class="report-description">Pedidos asignados a cada personal</p>
          <select v-model="filtros.pedidos.id_personal" class="form-input mb-3">
            <option value="">Seleccionar personal</option>
            <option v-for="persona in personal" :key="persona.id" :value="persona.id">
              {{ persona.nombre_completo }}
            </option>
          </select>
          <button @click="generarReporte('pedidos-personal')" class="btn btn-primary w-full">
            Generar Reporte
          </button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Arreglos Florales</h3>
            <SparklesIcon class="w-6 h-6 text-pink-500" />
          </div>
          <p class="report-description">Lista de arreglos por tipo</p>
          <select v-model="filtros.arreglos.tipo" class="form-input mb-3">
            <option value="">Todos</option>
            <option value="1">Ramo</option>
            <option value="2">Centro de mesa</option>
            <option value="3">Corona</option>
            <option value="4">Mixto</option>
          </select>
          <button @click="generarReporte('arreglos')" class="btn btn-primary w-full">
            Generar Reporte
          </button>
        </div>
      </div>

      <div v-if="showResults" class="modal-overlay" @click.self="closeResults">
        <div class="modal modal-xl">
          <div class="modal-header">
            <h3>{{ reporteActual.titulo }}</h3>
            <div class="header-actions">
              <button @click="exportarExcel" class="btn btn-success">
                <DocumentArrowDownIcon class="w-5 h-5" />
                Exportar a Excel
              </button>
              <button @click="closeResults" class="close-btn">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="modal-body">
            <div class="report-summary">
              <p><strong>Fecha:</strong> {{ formatDate(reporteActual.fecha) }}</p>
              <p><strong>Total de registros:</strong> {{ reporteActual.total }}</p>
              <p v-if="reporteActual.totalPagados !== undefined">
                <strong>Total pagado:</strong> ${{ reporteActual.totalPagados.toFixed(2) }}
              </p>
            </div>

            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th v-for="column in tableColumns" :key="column.key">
                      {{ column.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in reporteActual.data" :key="index">
                    <td v-for="column in tableColumns" :key="column.key">
                       <span v-if="column.type === 'badge'"
                            class="badge"
                            :class="getBadgeClass(row[column.key as keyof ReportDataRow], column.key)">
                        {{ getDisplayValue(row[column.key as keyof ReportDataRow], column.key) }}
                      </span>
                      <span v-else-if="column.type === 'currency'">
                        ${{ Number(row[column.key as keyof ReportDataRow]).toFixed(2) }}
                      </span>
                      <span v-else-if="column.type === 'date'">
                        {{ formatDate(row[column.key as keyof ReportDataRow] as string | Date) }}
                      </span>
                      <span v-else>
                        {{ (row[column.key as keyof ReportDataRow] as string | number | null | undefined) || '-' }}
                      </span>
                    </td>
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
import { ref, onMounted, reactive, computed } from 'vue';
import MainLayout from '@/components/layouts/MainLayout.vue';
import api from '@/services/api'; // Asegúrate que este servicio esté correctamente configurado
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  UsersIcon, UserGroupIcon, CalendarIcon, TruckIcon, CurrencyDollarIcon,
  UserIcon, SparklesIcon, DocumentArrowDownIcon, XMarkIcon
} from '@heroicons/vue/24/outline';

// --- Definición de Interfaces ---
// (Idealmente, mover a un archivo src/types.ts e importarlas)

// Para el select de personal
interface PersonalMin {
  id: number | string;
  nombre_completo: string;
  estatus?: number; // Necesario para el filtro en loadPersonal
}

// Tipos para los datos de cada reporte (podrían ser más detallados o importados)
interface ReportCliente {
  id_cliente: number | string;
  nombre_completo: string;
  direccion?: string | null;
  telefono?: string | null;
}
interface ReportPersonal {
  id: number | string;
  nombre_completo: string;
  direccion?: string | null;
  telefono?: string | null;
  estatus: number;
}
interface ReportPedido {
  folio: string | number;
  cliente_nombre?: string;
  arreglo_descripcion?: string;
  fecha_pedido: string;
  fecha_entrega: string;
  personal_nombre?: string | null;
  precio_sugerido: number | string;
  entregado: number;
  pagado: number;
}
interface ReportArreglo {
  id_arreglo: number | string;
  descripcion: string;
  tipo_arreglo: number; // Asumiendo que 'tipo_arreglo' en la tabla es numérico
  estatus: number;
}

// Tipo unión para los datos del reporte actual
type ReportDataRow = ReportCliente | ReportPersonal | ReportPedido | ReportArreglo;

interface ReporteActualStructure {
  titulo: string;
  fecha: Date;
  total: number;
  data: ReportDataRow[]; // Array de uno de los tipos de reporte
  totalPagados?: number; // Opcional, solo para reportes de pedidos
}

interface Filtros {
  personal: { estatus: string };
  pedidos: {
    fecha_inicio: string;
    fecha_fin: string;
    entregado: string;
    pagado: string;
    id_personal: string;
  };
  arreglos: { tipo: string };
}

interface TableColumn {
  key: string; // Debería ser keyof ReportDataRow para mayor seguridad, pero es complejo con la unión
  label: string;
  type?: 'badge' | 'currency' | 'date';
}

// --- Variables Reactivas Tipadas ---
const personal = ref<PersonalMin[]>([]); // <--- CAMBIO AQUÍ
const showResults = ref(false);
const reporteActual = ref<ReporteActualStructure>({ // <--- CAMBIO AQUÍ
  titulo: '',
  fecha: new Date(),
  total: 0,
  data: [], // Inicializar como array vacío del tipo correcto
  totalPagados: undefined // Inicializar opcionales como undefined
});

const filtros = reactive<Filtros>({ // <--- CAMBIO AQUÍ
  personal: { estatus: '' },
  pedidos: {
    fecha_inicio: '',
    fecha_fin: '',
    entregado: '',
    pagado: '',
    id_personal: ''
  },
  arreglos: { tipo: '' }
});

const tableColumns = computed((): TableColumn[] => { // <--- CAMBIO AQUÍ: Tipo de retorno
  const tipo = reporteActual.value.titulo;

  if (tipo.includes('Clientes')) {
    return [
      { key: 'id_cliente', label: 'ID' },
      { key: 'nombre_completo', label: 'Nombre Completo' },
      { key: 'direccion', label: 'Dirección' },
      { key: 'telefono', label: 'Teléfono' }
    ];
  } else if (tipo.includes('Personal')) {
    return [
      { key: 'id', label: 'ID' },
      { key: 'nombre_completo', label: 'Nombre Completo' },
      { key: 'direccion', label: 'Dirección' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'estatus', label: 'Estatus', type: 'badge' }
    ];
  } else if (tipo.includes('Pedidos')) {
    return [
      { key: 'folio', label: 'Folio' },
      { key: 'cliente_nombre', label: 'Cliente' },
      { key: 'arreglo_descripcion', label: 'Arreglo' },
      { key: 'fecha_pedido', label: 'Fecha Pedido', type: 'date' },
      { key: 'fecha_entrega', label: 'Fecha Entrega', type: 'date' },
      { key: 'personal_nombre', label: 'Personal' },
      { key: 'precio_sugerido', label: 'Precio', type: 'currency' },
      { key: 'entregado', label: 'Entregado', type: 'badge' },
      { key: 'pagado', label: 'Pagado', type: 'badge' }
    ];
  } else if (tipo.includes('Arreglos')) {
    return [
      { key: 'id_arreglo', label: 'ID' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'tipo_arreglo', label: 'Tipo', type: 'badge' },
      { key: 'estatus', label: 'Estatus', type: 'badge' }
    ];
  }
  return [];
});

const formatDate = (dateInput: string | Date | null | undefined): string => { // <--- CAMBIO AQUÍ: Tipo de entrada
  if (!dateInput) return '-';
  try {
    return new Date(dateInput).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
    return 'Fecha inválida';
  }
};

// Tipar 'value' de forma más genérica o con 'unknown' y luego hacer type guards si es necesario
const getBadgeClass = (value: string | number | null | undefined, key: string): string => { // <--- CAMBIO AQUÍ
  if (key === 'estatus' || key === 'entregado' || key === 'pagado') {
    return Number(value) === 1 ? 'badge-success' : 'badge-danger';
  }
  if (key === 'tipo_arreglo') {
    return 'badge-info'; // Suponiendo una clase genérica para tipo de arreglo
  }
  return '';
};

const getDisplayValue = (value: string | number | null | undefined, key: string): string => { // <--- CAMBIO AQUÍ
  if (key === 'estatus') {
    return Number(value) === 1 ? 'Vigente' : 'Baja';
  }
  if (key === 'entregado' || key === 'pagado') {
    return Number(value) === 1 ? 'Sí' : 'No';
  }
  if (key === 'tipo_arreglo') {
    const tipos: Record<number, string> = {
      1: 'Ramo',
      2: 'Centro de mesa',
      3: 'Corona',
      4: 'Mixto'
    };
    return tipos[Number(value)] || 'Desconocido';
  }
  return String(value || '-');
};

const loadPersonal = async () => {
  try {
    const response = await api.get<{ data: PersonalMin[] }>('/personal'); // <--- CAMBIO AQUÍ
    // Asumiendo que la API devuelve el array directamente en response.data o en response.data.data
    const personalData = response.data.data || response.data || []; // Ajustar según la estructura de la API
    personal.value = personalData.filter((p: PersonalMin) => p.estatus === 1);
  } catch (error) {
    console.error('Error al cargar personal activo:', error);
    personal.value = [];
  }
};

const generarReporte = async (tipoReporte: string) => { // <--- CAMBIO AQUÍ: Nombre del parámetro
  try {
    let response;
    // Asumimos que la API para reportes devuelve un objeto que coincide con ReporteActualStructure
    // o al menos un objeto con { data: ReportDataRow[], titulo: string, ... }
    // Por simplicidad, tiparemos response.data como 'any' aquí, y el tipado de reporteActual se encargará.
    let apiResponseData: any;

    const params = new URLSearchParams();

    switch (tipoReporte) {
      case 'clientes':
        response = await api.get<ReporteActualStructure>('/reportes/clientes');
        apiResponseData = response.data;
        break;
      case 'personal':
        if (filtros.personal.estatus) {
          params.append('estatus', filtros.personal.estatus);
        }
        response = await api.get<ReporteActualStructure>(`/reportes/personal?${params.toString()}`);
        apiResponseData = response.data;
        break;
      case 'pedidos-fecha':
        if (filtros.pedidos.fecha_inicio && filtros.pedidos.fecha_fin) {
          params.append('fecha_inicio', filtros.pedidos.fecha_inicio);
          params.append('fecha_fin', filtros.pedidos.fecha_fin);
        }
        response = await api.get<ReporteActualStructure>(`/reportes/pedidos?${params.toString()}`);
        apiResponseData = response.data;
        break;
      case 'pedidos-entrega':
        if (filtros.pedidos.entregado) {
          params.append('entregado', filtros.pedidos.entregado);
        }
        response = await api.get<ReporteActualStructure>(`/reportes/pedidos?${params.toString()}`);
        apiResponseData = response.data;
        break;
      case 'pedidos-pago':
        if (filtros.pedidos.pagado) {
          params.append('pagado', filtros.pedidos.pagado);
        }
        response = await api.get<ReporteActualStructure>(`/reportes/pedidos?${params.toString()}`);
        apiResponseData = response.data;
        break;
      case 'pedidos-personal':
        if (filtros.pedidos.id_personal) {
          // Asumiendo que este endpoint devuelve directamente un array de Pedidos
          const pedidosDataResponse = await api.get<ReportPedido[]>(`/pedidos/personal/${filtros.pedidos.id_personal}`);
          const data = pedidosDataResponse.data || [];
          apiResponseData = { // Construimos el objeto ReporteActualStructure manualmente
            titulo: 'Reporte de Pedidos por Personal',
            fecha: new Date(),
            total: data.length,
            data: data,
            // totalPagados podría calcularse si es necesario para este reporte específico
          };
        } else {
          alert('Por favor selecciona un personal');
          return;
        }
        break;
      case 'arreglos':
        if (filtros.arreglos.tipo) {
          params.append('tipo', filtros.arreglos.tipo);
        }
        response = await api.get<ReporteActualStructure>(`/reportes/arreglos?${params.toString()}`);
        apiResponseData = response.data;
        break;
      default:
        return;
    }

    if (apiResponseData) {
      reporteActual.value = { // Aseguramos que la asignación cumpla con ReporteActualStructure
        titulo: apiResponseData.titulo || 'Reporte',
        fecha: apiResponseData.fecha ? new Date(apiResponseData.fecha) : new Date(),
        total: apiResponseData.total || (apiResponseData.data ? apiResponseData.data.length : 0),
        data: apiResponseData.data || [],
        totalPagados: apiResponseData.totalPagados // Será undefined si no viene
      };
      showResults.value = true;
    }
  } catch (error) {
    console.error('Error al generar reporte:', error);
    alert('Error al generar el reporte. Revise la consola para más detalles.');
  }
};


const exportarExcel = () => {
  try {
    const wb = XLSX.utils.book_new();
    const dataForSheet = reporteActual.value.data.map((row: ReportDataRow) => { // <--- CAMBIO AQUÍ
      const newRow: Record<string, string | number | null | undefined> = {}; // <--- CAMBIO AQUÍ
      tableColumns.value.forEach(col => {
        const key = col.key as keyof ReportDataRow; // <--- Asumir que key es una clave válida
        const value = row[key];

        if (col.type === 'badge') {
          newRow[col.label] = getDisplayValue(value, col.key);
        } else if (col.type === 'currency') {
          newRow[col.label] = `$${Number(value).toFixed(2)}`;
        } else if (col.type === 'date') {
          newRow[col.label] = formatDate(value as string | Date);
        } else {
          newRow[col.label] = value !== null && value !== undefined ? String(value) : '-';
        }
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(dataForSheet);
    const reportInfo = [
      ['FLORERÍA DIGITAL'],
      [reporteActual.value.titulo],
      [`Fecha: ${formatDate(reporteActual.value.fecha)}`],
      [`Total de registros: ${reporteActual.value.total}`]
    ];
    if (reporteActual.value.totalPagados !== undefined) {
      reportInfo.push([`Total pagado: $${reporteActual.value.totalPagados.toFixed(2)}`]);
    }
    reportInfo.push([]);
    XLSX.utils.sheet_add_aoa(ws, reportInfo, { origin: 'A1' });
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `${reporteActual.value.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    alert('Error al exportar el reporte a Excel');
  }
};

const closeResults = () => {
  showResults.value = false;
  // Opcional: resetear reporteActual si se desea
  // reporteActual.value = { titulo: '', fecha: new Date(), total: 0, data: [], totalPagados: undefined };
};

onMounted(() => {
  loadPersonal(); // Cargar personal para el filtro de "Pedidos por Personal"
});
</script>

<style scoped>
/* Estilos generales y reutilizados de otros componentes */
.page-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h2 { font-size: 1.875rem; font-weight: 700; color: #1f2937; }

.btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; transition: background-color 0.2s; }
.btn-primary { background-color: #3b82f6; color: white; display: inline-flex; align-items: center; gap: 6px; }
.btn-primary:hover { background-color: #2563eb; }
.btn-success { background-color: #10b981; color: white; display: inline-flex; align-items: center; gap: 6px;}
.btn-success:hover { background-color: #059669; }
.w-full { width: 100%; justify-content: center; } /* Para botones de generar reporte */
.mb-3 { margin-bottom: 0.75rem; } /* 12px */

.form-input { /* Estilo base para selects e inputs de filtro */
  width: 100%; padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;
}
.form-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.report-card {
  background: white; border-radius: 0.5rem; padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0,0,0,0.06);
  transition: all 0.3s; display: flex; flex-direction: column;
}
.report-card:hover { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0,0,0,0.08); transform: translateY(-2px); }
.report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.report-header h3 { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin: 0;}
.report-description { color: #6b7280; margin-bottom: 1rem; font-size: 0.875rem; flex-grow: 1; }
.date-filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.date-filters input { flex: 1; }

.modal-overlay { /* Reutilizado */
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal { /* Reutilizado */
  background: white; border-radius: 0.5rem; width: 90%;
  max-height: 90vh; display: flex; flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
.modal-xl { max-width: 1200px; }
.modal-header { /* Reutilizado */
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb;
}
.modal-header h3 { font-size: 1.25rem; font-weight: 600; margin:0; }
.header-actions { display: flex; gap: 1rem; align-items: center; }
.close-btn { background: none; border: none; cursor: pointer; color: #6b7280; padding:0.25rem; }
.close-btn:hover { color: #111827; }

.modal-body { padding: 1.5rem; overflow-y: auto; }
.report-summary { background: #f9fafb; padding: 1rem; border-radius: 0.375rem; margin-bottom: 1.5rem; }
.report-summary p { margin-bottom: 0.5rem; font-size: 0.875rem; color: #374151;}
.report-summary p:last-child { margin-bottom: 0; }
.report-summary strong { color: #111827; }

.table-container { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
.table th, .table td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; font-size: 0.875rem; }
.table th { background-color: #f8fafc; font-weight: 600; }

.badge { padding: 0.25em 0.6em; font-size: 0.75rem; font-weight: 700; border-radius: 0.375rem;}
.badge-success { background-color: #dcfce7; color: #16a34a; }
.badge-danger { background-color: #fee2e2; color: #dc2626; } /* Para Estatus Baja, o Pedido No Pagado, No Entregado */
.badge-info { background-color: #dbeafe; color: #1e40af; } /* Para Tipo Arreglo */

/* Ajustes para iconos de colores */
.text-blue-500 { color: #3b82f6; }
.text-green-500 { color: #22c55e; }
.text-purple-500 { color: #8b5cf6; }
.text-orange-500 { color: #f97316; }
.text-green-600 { color: #16a34a; }
.text-indigo-500 { color: #6366f1; }
.text-pink-500 { color: #ec4899; }
</style>