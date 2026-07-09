import { Badge } from '@/components/ui/badge'
import { ESTADO_REGISTRO_LABELS, type EstadoRegistro } from '@/types'

const VARIANTS: Record<EstadoRegistro, 'secondary' | 'default' | 'success' | 'destructive'> = {
  BORRADOR: 'secondary',
  ENVIADO: 'default',
  APROBADO: 'success',
  RECHAZADO: 'destructive',
}

export function EstadoBadge({ estado }: { estado: EstadoRegistro }) {
  return <Badge variant={VARIANTS[estado]}>{ESTADO_REGISTRO_LABELS[estado]}</Badge>
}
