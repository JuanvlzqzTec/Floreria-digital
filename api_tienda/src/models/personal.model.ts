import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { Personal, Pedido } from '../types';
import { PedidoModel } from './pedido.model';

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

  static async getPedidosByPersonal(id: number): Promise<Pedido[]> {
    return PedidoModel.getByPersonal(id);
  }
}