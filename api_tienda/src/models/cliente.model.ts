import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { Cliente } from '../types';

export class ClienteModel {
  static async findAll(): Promise<Cliente[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clientes ORDER BY nombre_completo'
    );
    return rows as Cliente[];
  }

  static async findById(id: number): Promise<Cliente | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clientes WHERE id_cliente = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Cliente) : null;
  }

  static async create(cliente: Omit<Cliente, 'id_cliente'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO clientes (nombre_completo, direccion, telefono) VALUES (?, ?, ?)',
      [cliente.nombre_completo, cliente.direccion, cliente.telefono]
    );
    return result.insertId;
  }

  static async update(id: number, cliente: Partial<Cliente>): Promise<boolean> {
    const fields = [];
    const values = [];

    if (cliente.nombre_completo !== undefined) {
      fields.push('nombre_completo = ?');
      values.push(cliente.nombre_completo);
    }
    if (cliente.direccion !== undefined) {
      fields.push('direccion = ?');
      values.push(cliente.direccion);
    }
    if (cliente.telefono !== undefined) {
      fields.push('telefono = ?');
      values.push(cliente.telefono);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE clientes SET ${fields.join(', ')} WHERE id_cliente = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM clientes WHERE id_cliente = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}