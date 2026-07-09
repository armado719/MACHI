import { z } from 'zod'

export const lecturaSchema = z.object({
  equipoId: z.string().min(1),
  horometro: z.coerce.number().min(0, 'El horómetro no puede ser negativo'),
  // null/undefined = no reportado ("Sin dato"); 0 = consumo real cero
  combustibleGalones: z
    .union([z.coerce.number().min(0), z.null()])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  fotoEvidenciaDataUrl: z.string().startsWith('data:image/').optional().or(z.literal('')),
  hallazgos: z.string().max(2000).optional().or(z.literal('')),
})

export const registroSchema = z.object({
  sedeId: z.string().min(1, 'Seleccione una sede'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  turno: z.enum(['DIA', 'NOCHE'], { required_error: 'Seleccione el turno' }),
  estado: z.enum(['BORRADOR', 'ENVIADO']).default('BORRADOR'),
  lecturas: z.array(lecturaSchema).min(1, 'Agregue al menos una lectura de equipo'),
  updatedAt: z.string().optional(), // usado para optimistic locking en edición
})

export type RegistroFormData = z.infer<typeof registroSchema>
export type LecturaFormData = z.infer<typeof lecturaSchema>

export const rechazarSchema = z.object({
  comentario: z.string().min(5, 'El comentario debe explicar el motivo del rechazo').max(1000),
})

export const corregirSchema = z.object({
  motivo: z.string().min(5, 'Debe indicar el motivo de la corrección').max(1000),
  lecturas: z.array(lecturaSchema).min(1),
})
