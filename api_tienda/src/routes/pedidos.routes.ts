import { Router } from 'express';
import { PedidoController } from '../controllers/pedido.controller';
import { 
  pedidoSchema, 
  updatePedidoSchema, 
  pedidoFolioSchema,
  pedidoFilterSchema 
} from '../validations/pedidos.validation';
import { 
  validate, 
  validateParams, 
  validateQuery 
} from '../middlewares/validation.middleware';

const router = Router();

router.get('/', validateQuery(pedidoFilterSchema), PedidoController.getAll);
router.get('/total-pagados', PedidoController.getTotalPagados);
router.get('/personal/:id', PedidoController.getByPersonal);
router.get('/:folio', validateParams(pedidoFolioSchema), PedidoController.getByFolio);
router.post('/', validate(pedidoSchema), PedidoController.create);
router.put('/:folio', validateParams(pedidoFolioSchema), validate(updatePedidoSchema), PedidoController.update);

export default router;