import { Request, Response } from 'express';
import { ClienteModel } from '../models/cliente.model';
import { PersonalModel } from '../models/personal.model';
import { PedidoModel } from '../models/pedido.model';
import { ArregloModel } from '../models/arreglo.model';
import * as ExcelJS from 'exceljs';

export class ReportesController {
  static async reporteClientes(req: Request, res: Response) {
    try {
      const clientes = await ClienteModel.findAll();
      res.json({
        titulo: 'Reporte de Clientes',
        fecha: new Date(),
        total: clientes.length,
        data: clientes
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al generar el reporte', error });
    }
  }

  static async reportePersonal(req: Request, res: Response) {
    try {
      const { estatus } = req.query;
      const personal = estatus 
        ? await PersonalModel.findByEstatus(Number(estatus) as 1 | 2)
        : await PersonalModel.findAll();
      
      res.json({
        titulo: 'Reporte de Personal',
        fecha: new Date(),
        total: personal.length,
        data: personal
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al generar el reporte', error });
    }
  }

  static async reportePedidos(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pedidos = await PedidoModel.findByFilters(filters);
      
      let totalPagados = 0;
      if (filters.pagado === '1') {
        totalPagados = await PedidoModel.getTotalPagados();
      }
      
      res.json({
        titulo: 'Reporte de Pedidos',
        fecha: new Date(),
        total: pedidos.length,
        totalPagados,
        data: pedidos
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al generar el reporte', error });
    }
  }

  static async reporteArreglos(req: Request, res: Response) {
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
      
      res.json({
        titulo: 'Reporte de Arreglos Florales',
        fecha: new Date(),
        total: arreglos.length,
        data: arreglos
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al generar el reporte', error });
    }
  }

  static async exportarPedidosExcel(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pedidos = await PedidoModel.findByFilters(filters);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pedidos');

      // Definir columnas
      worksheet.columns = [
        { header: 'Folio', key: 'folio', width: 15 },
        { header: 'Cliente', key: 'cliente_nombre', width: 30 },
        { header: 'Arreglo', key: 'arreglo_descripcion', width: 30 },
        { header: 'Fecha Pedido', key: 'fecha_pedido', width: 15 },
        { header: 'Fecha Entrega', key: 'fecha_entrega', width: 15 },
        { header: 'Dirección Entrega', key: 'direccion_entrega', width: 40 },
        { header: 'Precio', key: 'precio_sugerido', width: 15 },
        { header: 'Personal', key: 'personal_nombre', width: 25 },
        { header: 'Entregado', key: 'entregado', width: 12 },
        { header: 'Pagado', key: 'pagado', width: 12 }
      ];

      // Agregar filas
      pedidos.forEach(pedido => {
        worksheet.addRow({
          ...pedido,
          entregado: pedido.entregado === 1 ? 'Sí' : 'No',
          pagado: pedido.pagado === 1 ? 'Sí' : 'No'
        });
      });

      // Estilo de encabezados
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Configurar respuesta
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=pedidos.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ message: 'Error al exportar a Excel', error });
    }
  }
}