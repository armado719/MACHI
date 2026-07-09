import { z } from 'zod'

export const usuarioSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  email: z.string().email('Ingrese un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  role: z.enum(['ELECTROMECANICO', 'COORDINADOR', 'ADMIN']),
  active: z.boolean().default(true),
})

export type UsuarioFormData = z.infer<typeof usuarioSchema>

export const configuracionGlobalSchema = z.object({
  nombreEmpresa: z.string().min(2).max(150),
  costoPorGalon: z.coerce.number().min(0),
  umbralAnomaliaPorcentaje: z.coerce.number().min(1).max(100),
})

export type ConfiguracionGlobalFormData = z.infer<typeof configuracionGlobalSchema>
