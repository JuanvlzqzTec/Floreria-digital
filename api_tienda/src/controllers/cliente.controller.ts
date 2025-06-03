import { Request, Response } from 'express';
import { ClienteModel } from '../models/cliente.model';

export class ClienteController {
  static async getAll(req: Request, res: Response) {
    try {
      const clientes = await ClienteModel.findAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los clientes', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cliente = await ClienteModel.findById(Number(id));
      
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el cliente', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const id = await ClienteModel.create(req.body);
      res.status(201).json({ 
        message: 'Cliente creado exitosamente', 
        id_cliente: id 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el cliente', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await ClienteModel.update(Number(id), req.body);
      
      if (!updated) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      
      res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el cliente', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ClienteModel.delete(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      
      res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el cliente', error });
    }
  }
}