import { z } from 'zod'

export const sedeSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  ciudad: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres').max(100),
  departamento: z.string().min(2, 'El departamento debe tener al menos 2 caracteres').max(100),
})

export type SedeFormData = z.infer<typeof sedeSchema>
