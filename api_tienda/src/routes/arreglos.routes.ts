import { Router } from 'express';
import { ArregloController } from '../controllers/arreglo.controller';
import { 
  arregloSchema, 
  updateArregloSchema, 
  arregloIdSchema 
} from '../validations/arreglos.validation';
import { validate, validateParams } from '../middlewares/validation.middleware';

const router = Router();

router.get('/', ArregloController.getAll);
router.get('/:id', validateParams(arregloIdSchema), ArregloController.getById);
router.post('/', validate(arregloSchema), ArregloController.create);
router.put('/:id', validateParams(arregloIdSchema), validate(updateArregloSchema), ArregloController.update);
router.delete('/:id', validateParams(arregloIdSchema), ArregloController.delete);

export default router;