import { Router } from 'express';
import { PersonalController } from '../controllers/personal.controller';
import { 
  personalSchema, 
  updatePersonalSchema, 
  personalIdSchema 
} from '../validations/personal.validation';
import { validate, validateParams } from '../middlewares/validation.middleware';

const router = Router();

router.get('/', PersonalController.getAll);
router.get('/:id', validateParams(personalIdSchema), PersonalController.getById);
router.get('/:id/pedidos', validateParams(personalIdSchema), PersonalController.getPedidos);
router.post('/', validate(personalSchema), PersonalController.create);
router.put('/:id', validateParams(personalIdSchema), validate(updatePersonalSchema), PersonalController.update);
router.delete('/:id', validateParams(personalIdSchema), PersonalController.delete);

export default router;