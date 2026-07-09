'use client'

import { useEffect, useState, useCallback } from 'react'
import { format, subDays } from 'date-fns'
import { Clock, Fuel, DollarSign, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/modules/dashboard/StatCard'
import { formatCombustible, formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { TURNO_LABELS, type Turno } from '@/types'

interface Sede {
  id: string
  nombre: string
}

interface Equipo {
  id: string
  nombre: string
}

interface LecturaHistorico {
  id: string
  horometro: number
  combustibleGalones: number | null
  deltaHoras: number | null
  equipo: { id: string; nombre: string }
  registro: {
    fecha: string
    turno: Turno
    sede: { id: string; nombre: string }
  }
}

export default function DashboardPage() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [sedeId, setSedeId] = useState('todas')
  const [equipoId, setEquipoId] = useState('todos')
  const [fechaDesde, setFechaDesde] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [fechaHasta, setFechaHasta] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [resumen, setResumen] = useState<{
    totalHoras: number
    totalGalones: number
    costoAcumulado: number
    alertasActivas: number
  } | null>(null)
  const [historico, setHistorico] = useState<LecturaHistorico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sedes')
      .then((r) => r.json())
      .then((d) => setSedes(d.data ?? []))
  }, [])

  useEffect(() => {
    const qs = sedeId !== 'todas' ? `?sedeId=${sedeId}` : ''
    fetch(`/api/equipos${qs}`)
      .then((r) => r.json())
      .then((d) => setEquipos(d.data ?? []))
  }, [sedeId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ fechaDesde, fechaHasta })
      if (sedeId !== 'todas') qs.set('sedeId', sedeId)
      if (equipoId !== 'todos') qs.set('equipoId', equipoId)
      const res = await fetch(`/api/dashboard?${qs}`)
      const data = await res.json()
      setResumen(data.resumen)
      setHistorico(data.historico ?? [])
    } finally {
      setLoading(false)
    }
  }, [sedeId, equipoId, fechaDesde, fechaHasta])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-content">Dashboard</h1>
        <p className="text-content-muted text-sm mt-1">
          Histórico de horómetros y combustible — solo registros enviados/aprobados
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label>Sede</Label>
            <Select value={sedeId} onValueChange={setSedeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {sedes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Equipo</Label>
            <Select value={equipoId} onValueChange={setEquipoId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {equipos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Desde</Label>
            <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </div>
          <Button variant="outline" asChild>
            <a
              href={`/api/export/excel/consolidado?${new URLSearchParams({
                ...(sedeId !== 'todas' ? { sedeId } : {}),
                ...(equipoId !== 'todos' ? { equipoId } : {}),
                fechaDesde,
                fechaHasta,
              })}`}
            >
              Exportar Excel
            </a>
          </Button>
        </div>
      </Card>

      {loading || !resumen ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Horas trabajadas" value={formatNumber(resumen.totalHoras, 1)} icon={Clock} />
          <StatCard
            label="Combustible acumulado"
            value={formatCombustible(resumen.totalGalones)}
            icon={Fuel}
          />
          <StatCard
            label="Costo acumulado"
            value={formatCurrency(resumen.costoAcumulado)}
            icon={DollarSign}
            accent="green"
          />
          <StatCard
            label="Alertas activas"
            value={String(resumen.alertasActivas)}
            icon={AlertTriangle}
            accent="red"
          />
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : historico.length === 0 ? (
          <div className="p-12 text-center text-content-muted">
            No hay datos para los filtros seleccionados.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Horómetro</TableHead>
                <TableHead>Combustible</TableHead>
                <TableHead>Delta horas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{formatDate(l.registro.fecha, 'd MMM yyyy')}</TableCell>
                  <TableCell>{l.registro.sede.nombre}</TableCell>
                  <TableCell>{TURNO_LABELS[l.registro.turno]}</TableCell>
                  <TableCell className="font-medium text-content">{l.equipo.nombre}</TableCell>
                  <TableCell>{formatNumber(l.horometro, 1)}</TableCell>
                  <TableCell>{formatCombustible(l.combustibleGalones)}</TableCell>
                  <TableCell>{formatNumber(l.deltaHoras ?? 0, 1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
