import { Router } from 'express';
import { ReportesController } from '../controllers/reportes.controller';

const router = Router();

router.get('/clientes', ReportesController.reporteClientes);
router.get('/personal', ReportesController.reportePersonal);
router.get('/arreglos', ReportesController.reporteArreglos);
router.get('/pedidos/excel', ReportesController.exportarPedidosExcel);
router.get('/pedidos', ReportesController.reportePedidos);

export default router;