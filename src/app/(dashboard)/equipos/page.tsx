'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { EquipoFormDialog } from '@/components/modules/equipos/EquipoFormDialog'

interface Sede {
  id: string
  nombre: string
}

interface Equipo {
  id: string
  sedeId: string
  nombre: string
  marca: string | null
  modelo: string | null
  serie: string | null
  capacidadTanqueGalones: number | null
  intervaloMantenimientoHoras: number | null
  umbralAmarilloHoras: number | null
  umbralRojoHoras: number | null
  activo: boolean
  sede: { id: string; nombre: string }
}

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedeFilter, setSedeFilter] = useState<string>('todas')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Equipo | null>(null)

  const loadSedes = useCallback(async () => {
    const res = await fetch('/api/sedes')
    const data = await res.json()
    setSedes(data.data ?? [])
  }, [])

  const loadEquipos = useCallback(async () => {
    setLoading(true)
    try {
      const qs = sedeFilter !== 'todas' ? `?sedeId=${sedeFilter}` : ''
      const res = await fetch(`/api/equipos${qs}`)
      const data = await res.json()
      setEquipos(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [sedeFilter])

  useEffect(() => {
    loadSedes()
  }, [loadSedes])

  useEffect(() => {
    loadEquipos()
  }, [loadEquipos])

  const handleDelete = async (equipo: Equipo) => {
    if (!confirm(`¿Desactivar el equipo "${equipo.nombre}"?`)) return
    try {
      const res = await fetch(`/api/equipos/${equipo.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo desactivar el equipo')
      toast.success('Equipo desactivado')
      loadEquipos()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-content">Equipos</h1>
          <p className="text-content-muted text-sm mt-1">
            Ficha técnica y umbrales de alerta por equipo
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4" /> Nuevo equipo
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : equipos.length === 0 ? (
          <div className="p-12 text-center text-content-muted">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No hay equipos registrados{sedeFilter !== 'todas' ? ' en esta sede' : ''}.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Marca / Modelo</TableHead>
                <TableHead>Tanque</TableHead>
                <TableHead>Intervalo mant.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell className="font-medium text-content">{equipo.nombre}</TableCell>
                  <TableCell>{equipo.sede.nombre}</TableCell>
                  <TableCell>
                    {[equipo.marca, equipo.modelo].filter(Boolean).join(' ') || '—'}
                  </TableCell>
                  <TableCell>
                    {equipo.capacidadTanqueGalones ? `${equipo.capacidadTanqueGalones} Gls` : '—'}
                  </TableCell>
                  <TableCell>
                    {equipo.intervaloMantenimientoHoras
                      ? `${equipo.intervaloMantenimientoHoras} h`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={equipo.activo ? 'success' : 'secondary'}>
                      {equipo.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(equipo)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(equipo)}>
                        <Trash2 className="w-4 h-4 text-red" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <EquipoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipo={editing}
        sedes={sedes}
        defaultSedeId={sedeFilter !== 'todas' ? sedeFilter : undefined}
        onSaved={loadEquipos}
      />
    </div>
  )
}
