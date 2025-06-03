import { z } from 'zod';

export const pedidoSchema = z.object({
  id_cliente: z.number().positive('ID de cliente inválido')
    .or(z.string().regex(/^\d+$/).transform(Number)),
  id_arreglo: z.number().positive('ID de arreglo inválido')
    .or(z.string().regex(/^\d+$/).transform(Number)),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  fecha_entrega: z.string()
    .datetime({ message: 'Formato de fecha inválido' })
    .or(z.date()),
  direccion_entrega: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  precio_sugerido: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(999999.99, 'El precio no puede exceder 999,999.99')
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  id_personal: z.number().positive('ID de personal inválido')
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional()
    .nullable(),
  entregado: z.enum(['1', '2']).transform(val => parseInt(val) as 1 | 2)
    .or(z.literal(1))
    .or(z.literal(2)),
  pagado: z.enum(['1', '2']).transform(val => parseInt(val) as 1 | 2)
    .or(z.literal(1))
    .or(z.literal(2))
});

export const updatePedidoSchema = pedidoSchema.partial();

export const pedidoFolioSchema = z.object({
  folio: z.string().regex(/^PED-\d{4}-\d{4}$/, 'Formato de folio inválido')
});

export const pedidoFilterSchema = z.object({
  fecha_inicio: z.string().datetime().optional(),
  fecha_fin: z.string().datetime().optional(),
  entregado: z.enum(['1', '2']).optional(),
  pagado: z.enum(['1', '2']).optional(),
  id_cliente: z.string().regex(/^\d+$/).transform(Number).optional(),
  id_personal: z.string().regex(/^\d+$/).transform(Number).optional()
});