import { z } from 'zod';

export const clienteSchema = z.object({
  nombre_completo: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  direccion: z.string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .nullable(),
  telefono: z.string()
    .regex(/^[0-9-]+$/, 'El teléfono solo puede contener números y guiones')
    .min(10, 'El teléfono debe tener al menos 10 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable()
});

export const updateClienteSchema = clienteSchema.partial();

export const clienteIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number)
});