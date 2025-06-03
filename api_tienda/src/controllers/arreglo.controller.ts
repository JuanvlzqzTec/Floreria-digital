import { Request, Response } from 'express';
import { ArregloModel } from '../models/arreglo.model';

export class ArregloController {
  static async getAll(req: Request, res: Response) {
    try {
      const { tipo, estatus } = req.query;
      let arreglos;

      if (tipo) {
        arreglos = await ArregloModel.findByTipo(Number(tipo) as 1 | 2 | 3 | 4);
      } else if (estatus) {
        arreglos = await ArregloModel.findByEstatus(Number(estatus) as 1 | 2);
      } else {
        arreglos = await ArregloModel.findAll();
      }

      res.json(arreglos);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los arreglos', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const arreglo = await ArregloModel.findById(Number(id));
      
      if (!arreglo) {
        return res.status(404).json({ message: 'Arreglo no encontrado' });
      }
      
      res.json(arreglo);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el arreglo', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const id = await ArregloModel.create(req.body);
      res.status(201).json({ 
        message: 'Arreglo creado exitosamente', 
        id_arreglo: id 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el arreglo', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await ArregloModel.update(Number(id), req.body);
      
      if (!updated) {
        return res.status(404).json({ message: 'Arreglo no encontrado' });
      }
      
      res.json({ message: 'Arreglo actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el arreglo', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ArregloModel.delete(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Arreglo no encontrado' });
      }
      
      res.json({ message: 'Arreglo dado de baja exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al dar de baja el arreglo', error });
    }
  }
}