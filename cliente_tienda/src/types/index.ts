export interface Personal {
  id?: number;
  nombre_completo: string;
  direccion?: string;
  telefono?: string;
  estatus: 1 | 2;
  created_at?: Date;
  updated_at?: Date;
}

export interface Cliente {
  id_cliente?: number;
  nombre_completo: string;
  direccion?: string;
  telefono?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ArregloFloral {
  id_arreglo?: number;
  descripcion: string;
  tipo_arreglo: 1 | 2 | 3 | 4;
  estatus: 1 | 2;
  created_at?: Date;
  updated_at?: Date;
}

export interface Pedido {
  folio: string;
  id_cliente: number;
  id_arreglo: number;
  descripcion?: string;
  fecha_pedido?: Date;
  fecha_entrega: Date;
  direccion_entrega: string;
  precio_sugerido: number;
  id_personal?: number;
  entregado: 1 | 2;
  pagado: 1 | 2;
  created_at?: Date;
  updated_at?: Date;
  // Relaciones
  cliente?: Cliente;
  arreglo?: ArregloFloral;
  personal?: Personal;
}