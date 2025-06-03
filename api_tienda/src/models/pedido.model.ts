import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { Pedido } from '../types';
import { generarFolio } from '../utils/folio.generator';

export class PedidoModel {
  static async findAll(): Promise<Pedido[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, 
        c.nombre_completo AS cliente_nombre, 
        a.descripcion AS arreglo_descripcion,
        per.nombre_completo AS personal_nombre
       FROM pedidos p
       JOIN clientes c ON p.id_cliente = c.id_cliente
       JOIN arreglos_florales a ON p.id_arreglo = a.id_arreglo
       LEFT JOIN personal per ON p.id_personal = per.id
       ORDER BY p.fecha_pedido DESC`
    );
    return rows as Pedido[];
  }

  static async findByFolio(folio: string): Promise<Pedido | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, 
        c.nombre_completo AS cliente_nombre, 
        a.descripcion AS arreglo_descripcion,
        per.nombre_completo AS personal_nombre
       FROM pedidos p
       JOIN clientes c ON p.id_cliente = c.id_cliente
       JOIN arreglos_florales a ON p.id_arreglo = a.id_arreglo
       LEFT JOIN personal per ON p.id_personal = per.id
       WHERE p.folio = ?`,
      [folio]
    );
    if (rows.length === 0) return null;
    return rows[0] as Pedido;
  }

  static async create(pedido: Omit<Pedido, 'folio'>): Promise<string> {
    let folio = generarFolio();

    // Verificar que el folio no exista para evitar duplicados
    let folioExists = true;
    let counter = 0;

    while (folioExists && counter < 10) {
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT folio FROM pedidos WHERE folio = ?',
        [folio]
      );
      if (existing.length === 0) {
        folioExists = false;
      } else {
        counter++;
        folio = `${generarFolio()}-${counter}`;
      }
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO pedidos (
        folio, id_cliente, id_arreglo, descripcion, 
        fecha_entrega, direccion_entrega, precio_sugerido, 
        id_personal, entregado, pagado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        folio,
        pedido.id_cliente,
        pedido.id_arreglo,
        pedido.descripcion,
        pedido.fecha_entrega,
        pedido.direccion_entrega,
        pedido.precio_sugerido,
        pedido.id_personal,
        pedido.entregado,
        pedido.pagado
      ]
    );

    return folio;
  }

  static async update(folio: string, pedido: Partial<Pedido>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (pedido.id_cliente !== undefined) {
      fields.push('id_cliente = ?');
      values.push(pedido.id_cliente);
    }
    if (pedido.id_arreglo !== undefined) {
      fields.push('id_arreglo = ?');
      values.push(pedido.id_arreglo);
    }
    if (pedido.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(pedido.descripcion);
    }
    if (pedido.fecha_entrega !== undefined) {
      fields.push('fecha_entrega = ?');
      values.push(pedido.fecha_entrega);
    }
    if (pedido.direccion_entrega !== undefined) {
      fields.push('direccion_entrega = ?');
      values.push(pedido.direccion_entrega);
    }
    if (pedido.precio_sugerido !== undefined) {
      fields.push('precio_sugerido = ?');
      values.push(pedido.precio_sugerido);
    }
    if (pedido.id_personal !== undefined) {
      fields.push('id_personal = ?');
      values.push(pedido.id_personal);
    }
    if (pedido.entregado !== undefined) {
      fields.push('entregado = ?');
      values.push(pedido.entregado);
    }
    if (pedido.pagado !== undefined) {
      fields.push('pagado = ?');
      values.push(pedido.pagado);
    }

    if (fields.length === 0) return false;

    values.push(folio);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE pedidos SET ${fields.join(', ')} WHERE folio = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  static async delete(folio: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM pedidos WHERE folio = ?`,
      [folio]
    );
    return result.affectedRows > 0;
  }

  static async findByFilters(filters: {
    fecha_inicio?: string;
    fecha_fin?: string;
    entregado?: boolean;
    pagado?: boolean;
    id_cliente?: number;
    id_personal?: number;
  }): Promise<Pedido[]> {
    let query = `
      SELECT p.*, 
        c.nombre_completo AS cliente_nombre, 
        a.descripcion AS arreglo_descripcion,
        per.nombre_completo AS personal_nombre
      FROM pedidos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      JOIN arreglos_florales a ON p.id_arreglo = a.id_arreglo
      LEFT JOIN personal per ON p.id_personal = per.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.fecha_inicio && filters.fecha_fin) {
      query += ' AND p.fecha_pedido BETWEEN ? AND ?';
      params.push(filters.fecha_inicio, filters.fecha_fin);
    }
    if (filters.entregado !== undefined) {
      query += ' AND p.entregado = ?';
      params.push(filters.entregado);
    }
    if (filters.pagado !== undefined) {
      query += ' AND p.pagado = ?';
      params.push(filters.pagado);
    }
    if (filters.id_cliente) {
      query += ' AND p.id_cliente = ?';
      params.push(filters.id_cliente);
    }
    if (filters.id_personal) {
      query += ' AND p.id_personal = ?';
      params.push(filters.id_personal);
    }

    query += ' ORDER BY p.fecha_pedido DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as Pedido[];
  }

  // Nuevo método: Obtener total pagado (suma de precio_sugerido donde pagado = true)
  static async getTotalPagados(): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT SUM(precio_sugerido) AS total_pagado FROM pedidos WHERE pagado = 1`
    );
    const total = rows[0]?.total_pagado;
    return total ? Number(total) : 0;
  }

  // Nuevo método: Obtener pedidos por personal
  static async getByPersonal(id_personal: number): Promise<Pedido[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, 
        c.nombre_completo AS cliente_nombre, 
        a.descripcion AS arreglo_descripcion,
        per.nombre_completo AS personal_nombre
       FROM pedidos p
       JOIN clientes c ON p.id_cliente = c.id_cliente
       JOIN arreglos_florales a ON p.id_arreglo = a.id_arreglo
       LEFT JOIN personal per ON p.id_personal = per.id
       WHERE p.id_personal = ?
       ORDER BY p.fecha_pedido DESC`,
      [id_personal]
    );
    return rows as Pedido[];
  }
}
