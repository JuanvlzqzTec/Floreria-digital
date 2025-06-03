import { Request, Response } from 'express';
import { PedidoModel } from '../models/pedido.model';

export class PedidoController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pedidos = Object.keys(filters).length > 0 
        ? await PedidoModel.findByFilters(filters)
        : await PedidoModel.findAll();
      
      res.json(pedidos);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los pedidos', error });
    }
  }

  static async getByFolio(req: Request, res: Response) {
    try {
      const { folio } = req.params;
      const pedido = await PedidoModel.findByFolio(folio);
      
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      
      res.json(pedido);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el pedido', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const folio = await PedidoModel.create(req.body);
      res.status(201).json({ 
        message: 'Pedido creado exitosamente', 
        folio 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el pedido', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { folio } = req.params;
      const updated = await PedidoModel.update(folio, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      
      res.json({ message: 'Pedido actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el pedido', error });
    }
  }

  static async getTotalPagados(req: Request, res: Response) {
    try {
      const total = await PedidoModel.getTotalPagados();
      res.json({ total });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el total', error });
    }
  }

  static async getByPersonal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pedidos = await PedidoModel.getByPersonal(Number(id));
      res.json(pedidos);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los pedidos', error });
    }
  }
}