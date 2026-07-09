import { z } from 'zod'

export const equipoSchema = z.object({
  sedeId: z.string().min(1, 'Seleccione una sede'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  marca: z.string().max(100).optional().or(z.literal('')),
  modelo: z.string().max(100).optional().or(z.literal('')),
  serie: z.string().max(100).optional().or(z.literal('')),
  capacidadTanqueGalones: z.coerce.number().min(0).optional().nullable(),
  intervaloMantenimientoHoras: z.coerce.number().min(0).optional().nullable(),
  umbralAmarilloHoras: z.coerce.number().min(0).optional().nullable(),
  umbralRojoHoras: z.coerce.number().min(0).optional().nullable(),
  activo: z.boolean().default(true),
})

export type EquipoFormData = z.infer<typeof equipoSchema>
