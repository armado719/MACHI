'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { BellOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AlertaCard, type AlertaData } from '@/components/modules/alertas/AlertaCard'

interface Sede {
  id: string
  nombre: string
}

export default function AlertasPage() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedeFilter, setSedeFilter] = useState('todas')
  const [estado, setEstado] = useState<'ACTIVA' | 'RECONOCIDA'>('ACTIVA')
  const [alertas, setAlertas] = useState<AlertaData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sedes')
      .then((r) => r.json())
      .then((d) => setSedes(d.data ?? []))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ estado })
      if (sedeFilter !== 'todas') qs.set('sedeId', sedeFilter)
      const res = await fetch(`/api/alertas?${qs}`)
      const data = await res.json()
      setAlertas(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [sedeFilter, estado])

  useEffect(() => {
    load()
  }, [load])

  const handleReconocer = async (id: string) => {
    try {
      const res = await fetch(`/api/alertas/${id}/reconocer`, { method: 'POST' })
      if (!res.ok) throw new Error('No se pudo reconocer la alerta')
      toast.success('Alerta reconocida')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-content">Alertas</h1>
          <p className="text-content-muted text-sm mt-1">
            Mantenimiento próximo/vencido y consumo anómalo por equipo
          </p>
        </div>
        <Select value={sedeFilter} onValueChange={setSedeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las sedes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las sedes</SelectItem>
            {sedes.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={estado} onValueChange={(v) => setEstado(v as 'ACTIVA' | 'RECONOCIDA')}>
        <TabsList>
          <TabsTrigger value="ACTIVA">Activas</TabsTrigger>
          <TabsTrigger value="RECONOCIDA">Reconocidas</TabsTrigger>
        </TabsList>
        <TabsContent value={estado}>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : alertas.length === 0 ? (
            <Card className="p-12 text-center text-content-muted">
              <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No hay alertas {estado === 'ACTIVA' ? 'activas' : 'reconocidas'}.
            </Card>
          ) : (
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <AlertaCard key={alerta.id} alerta={alerta} onReconocer={handleReconocer} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
