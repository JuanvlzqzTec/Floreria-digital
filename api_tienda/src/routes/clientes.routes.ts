import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { 
  clienteSchema, 
  updateClienteSchema, 
  clienteIdSchema 
} from '../validations/clientes.validation';
import { validate, validateParams } from '../middlewares/validation.middleware';

const router = Router();

router.get('/', ClienteController.getAll);
router.get('/:id', validateParams(clienteIdSchema), ClienteController.getById);
router.post('/', validate(clienteSchema), ClienteController.create);
router.put('/:id', validateParams(clienteIdSchema), validate(updateClienteSchema), ClienteController.update);
router.delete('/:id', validateParams(clienteIdSchema), ClienteController.delete);

export default router;