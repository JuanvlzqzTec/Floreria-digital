import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { ArregloFloral } from '../types';

export class ArregloModel {
  static async findAll(): Promise<ArregloFloral[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM arreglos_florales ORDER BY descripcion'
    );
    return rows as ArregloFloral[];
  }

  static async findById(id: number): Promise<ArregloFloral | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM arreglos_florales WHERE id_arreglo = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as ArregloFloral) : null;
  }

  static async findByTipo(tipo: 1 | 2 | 3 | 4): Promise<ArregloFloral[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM arreglos_florales WHERE tipo_arreglo = ? AND estatus = 1 ORDER BY descripcion',
      [tipo]
    );
    return rows as ArregloFloral[];
  }

  static async findByEstatus(estatus: 1 | 2): Promise<ArregloFloral[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM arreglos_florales WHERE estatus = ? ORDER BY descripcion',
      [estatus]
    );
    return rows as ArregloFloral[];
  }

  static async create(arreglo: Omit<ArregloFloral, 'id_arreglo'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO arreglos_florales (descripcion, tipo_arreglo, estatus) VALUES (?, ?, ?)',
      [arreglo.descripcion, arreglo.tipo_arreglo, arreglo.estatus]
    );
    return result.insertId;
  }

  static async update(id: number, arreglo: Partial<ArregloFloral>): Promise<boolean> {
    const fields = [];
    const values = [];

    if (arreglo.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(arreglo.descripcion);
    }
    if (arreglo.tipo_arreglo !== undefined) {
      fields.push('tipo_arreglo = ?');
      values.push(arreglo.tipo_arreglo);
    }
    if (arreglo.estatus !== undefined) {
      fields.push('estatus = ?');
      values.push(arreglo.estatus);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE arreglos_florales SET ${fields.join(', ')} WHERE id_arreglo = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE arreglos_florales SET estatus = 2 WHERE id_arreglo = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}