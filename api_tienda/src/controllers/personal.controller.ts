import { Request, Response } from 'express';
import { PersonalModel } from '../models/personal.model';

export class PersonalController {
  static async getAll(req: Request, res: Response) {
    try {
      const personal = await PersonalModel.findAll();
      res.json(personal);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el personal', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const personal = await PersonalModel.findById(Number(id));
      
      if (!personal) {
        return res.status(404).json({ message: 'Personal no encontrado' });
      }
      
      res.json(personal);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el personal', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const id = await PersonalModel.create(req.body);
      res.status(201).json({ 
        message: 'Personal creado exitosamente', 
        id 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el personal', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await PersonalModel.update(Number(id), req.body);
      
      if (!updated) {
        return res.status(404).json({ message: 'Personal no encontrado' });
      }
      
      res.json({ message: 'Personal actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el personal', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await PersonalModel.delete(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Personal no encontrado' });
      }
      
      res.json({ message: 'Personal dado de baja exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al dar de baja el personal', error });
    }
  }

  static async getPedidos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pedidos = await PersonalModel.getPedidosByPersonal(Number(id));
      res.json(pedidos);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los pedidos', error });
    }
  }
}