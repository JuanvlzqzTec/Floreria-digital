import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { Personal, Pedido } from '../types';

function generarFolio(): string {
  return 'FOLIO-' + Date.now(); // ejemplo simple
}

export class PersonalModel {
  static async findAll(): Promise<Personal[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM personal ORDER BY nombre_completo'
    );
    return rows as Personal[];
  }

  static async findById(id: number): Promise<Personal | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM personal WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Personal) : null;
  }

  static async findByEstatus(estatus: 1 | 2): Promise<Personal[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM personal WHERE estatus = ? ORDER BY nombre_completo',
      [estatus]
    );
    return rows as Personal[];
  }

  static async create(personal: Omit<Personal, 'id'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO personal (nombre_completo, direccion, telefono, estatus) VALUES (?, ?, ?, ?)',
      [personal.nombre_completo, personal.direccion, personal.telefono, personal.estatus]
    );
    return result.insertId;
  }

  static async update(id: number, personal: Partial<Personal>): Promise<boolean> {
    const fields = [];
    const values = [];

    if (personal.nombre_completo !== undefined) {
      fields.push('nombre_completo = ?');
      values.push(personal.nombre_completo);
    }
    if (personal.direccion !== undefined) {
      fields.push('direccion = ?');
      values.push(personal.direccion);
    }
    if (personal.telefono !== undefined) {
      fields.push('telefono = ?');
      values.push(personal.telefono);
    }
    if (personal.estatus !== undefined) {
      fields.push('estatus = ?');
      values.push(personal.estatus);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE personal SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE personal SET estatus = 2 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Método delegado para obtener pedidos por personal
  static async getPedidosByPersonal(id: number): Promise<Pedido[]> {
    return PedidoModel.getPedidosByPersonal(id);
  }
}

export class PedidoModel {
  static async getPedidosByPersonal(id: number): Promise<Pedido[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, 
        c.nombre_completo as cliente_nombre, 
        a.descripcion as arreglo_descripcion,
        per.nombre_completo as personal_nombre
       FROM pedidos p
       JOIN clientes c ON p.id_cliente = c.id_cliente
       JOIN arreglos_florales a ON p.id_arreglo = a.id_arreglo
       LEFT JOIN personal per ON p.id_personal = per.id
       WHERE p.id_personal = ?
       ORDER BY p.fecha_pedido DESC`,
      [id]
    );
    return rows as Pedido[];
  }

  static async findWithFilters(filters: any): Promise<Pedido[]> {
    let query = `
      SELECT p.*, 
        c.nombre_completo as cliente_nombre, 
        a.descripcion as arreglo_descripcion,
        per.nombre_completo as personal_nombre
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

  static async create(pedido: Omit<Pedido, 'folio'>): Promise<string> {
    const folioBase = generarFolio();

    let folio = folioBase;
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
        folio = `${folioBase}-${counter}`;
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
    const fields = [];
    const values = [];

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

  static async getTotalPagados(): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT SUM(precio_sugerido) as total FROM pedidos WHERE pagado = 1'
    );
    return rows[0].total || 0;
  }
}
