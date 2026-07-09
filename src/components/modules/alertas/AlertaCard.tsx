'use client'

import { AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatDateTime } from '@/lib/utils'
import { TIPO_ALERTA_LABELS } from '@/types'

export interface AlertaData {
  id: string
  tipo: 'MANTENIMIENTO_PROXIMO' | 'MANTENIMIENTO_VENCIDO' | 'CONSUMO_ANOMALO'
  severidad: 'AMARILLA' | 'ROJA'
  estado: 'ACTIVA' | 'RECONOCIDA'
  mensaje: string
  createdAt: string
  equipo: { nombre: string; sede: { nombre: string } }
  reconocidaPor: { name: string } | null
}

export function AlertaCard({
  alerta,
  onReconocer,
}: {
  alerta: AlertaData
  onReconocer: (id: string) => void
}) {
  const roja = alerta.severidad === 'ROJA'

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        roja ? 'border-red/30 bg-red-bg' : 'border-amber/30 bg-amber-bg'
      )}
    >
      <AlertTriangle className={cn('w-5 h-5 mt-0.5 shrink-0', roja ? 'text-red' : 'text-amber')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={roja ? 'destructive' : 'warning'}>
            {TIPO_ALERTA_LABELS[alerta.tipo]}
          </Badge>
          <span className="text-xs text-content-muted">{alerta.equipo.sede.nombre}</span>
        </div>
        <p className="text-sm text-content mt-1">{alerta.mensaje}</p>
        <p className="text-xs text-content-muted mt-1">{formatDateTime(alerta.createdAt)}</p>
      </div>
      {alerta.estado === 'ACTIVA' ? (
        <Button variant="secondary" size="sm" onClick={() => onReconocer(alerta.id)}>
          <Check className="w-3.5 h-3.5" /> Reconocer
        </Button>
      ) : (
        <span className="text-xs text-content-muted whitespace-nowrap">
          Reconocida por {alerta.reconocidaPor?.name}
        </span>
      )}
    </div>
  )
}
