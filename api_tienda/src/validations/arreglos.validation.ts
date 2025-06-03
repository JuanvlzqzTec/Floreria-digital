import { z } from 'zod';

export const arregloSchema = z.object({
  descripcion: z.string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  tipo_arreglo: z.enum(['1', '2', '3', '4']).transform(val => parseInt(val) as 1 | 2 | 3 | 4)
    .or(z.literal(1))
    .or(z.literal(2))
    .or(z.literal(3))
    .or(z.literal(4)),
  estatus: z.enum(['1', '2']).transform(val => parseInt(val) as 1 | 2)
    .or(z.literal(1))
    .or(z.literal(2))
});

export const updateArregloSchema = arregloSchema.partial();

export const arregloIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number)
});