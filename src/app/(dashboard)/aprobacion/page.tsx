'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { CheckSquare, Check, X, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { RechazarDialog } from '@/components/modules/aprobacion/RechazarDialog'
import { formatDate } from '@/lib/utils'
import { TURNO_LABELS, type Turno } from '@/types'

interface Sede {
  id: string
  nombre: string
}

interface RegistroPendiente {
  id: string
  fecha: string
  turno: Turno
  sede: { nombre: string }
  creadoPor: { name: string }
  lecturas: unknown[]
}

export default function AprobacionPage() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedeFilter, setSedeFilter] = useState('todas')
  const [registros, setRegistros] = useState<RegistroPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [rechazarId, setRechazarId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sedes')
      .then((r) => r.json())
      .then((d) => setSedes(d.data ?? []))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ estado: 'ENVIADO', pageSize: '50' })
      if (sedeFilter !== 'todas') qs.set('sedeId', sedeFilter)
      const res = await fetch(`/api/registros?${qs}`)
      const data = await res.json()
      setRegistros(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [sedeFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleAprobar = async (id: string) => {
    try {
      const res = await fetch(`/api/registros/${id}/aprobar`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo aprobar el registro')
      }
      toast.success('Registro aprobado')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-content">
            Aprobación de registros
          </h1>
          <p className="text-content-muted text-sm mt-1">
            Registros enviados pendientes de revisión
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

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : registros.length === 0 ? (
          <div className="p-12 text-center text-content-muted">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No hay registros pendientes de aprobación.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Electromecánico</TableHead>
                <TableHead>Equipos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDate(r.fecha, 'd MMM yyyy')}</TableCell>
                  <TableCell className="font-medium text-content">{r.sede.nombre}</TableCell>
                  <TableCell>{TURNO_LABELS[r.turno]}</TableCell>
                  <TableCell>{r.creadoPor.name}</TableCell>
                  <TableCell>{r.lecturas.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/registros/${r.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAprobar(r.id)}>
                        <Check className="w-4 h-4 text-green" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setRechazarId(r.id)}>
                        <X className="w-4 h-4 text-red" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <RechazarDialog
        open={!!rechazarId}
        onOpenChange={(open) => !open && setRechazarId(null)}
        registroId={rechazarId}
        onDone={load}
      />
    </div>
  )
}
