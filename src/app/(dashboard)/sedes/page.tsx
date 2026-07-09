'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { SedeFormDialog } from '@/components/modules/sedes/SedeFormDialog'

interface Sede {
  id: string
  nombre: string
  ciudad: string
  departamento: string
  _count: { equipos: number }
}

export default function SedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Sede | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sedes')
      const data = await res.json()
      setSedes(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (sede: Sede) => {
    if (!confirm(`¿Eliminar la sede "${sede.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/sedes/${sede.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo eliminar la sede')
      }
      toast.success('Sede eliminada')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-content">Sedes</h1>
          <p className="text-content-muted text-sm mt-1">
            Empresa X opera en varias ciudades — el personal rota entre sedes por ciclo de turno
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4" /> Nueva sede
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sedes.length === 0 ? (
          <div className="p-12 text-center text-content-muted">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No hay sedes registradas todavía.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Equipos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sedes.map((sede) => (
                <TableRow key={sede.id}>
                  <TableCell className="font-medium text-content">{sede.nombre}</TableCell>
                  <TableCell>{sede.ciudad}</TableCell>
                  <TableCell>{sede.departamento}</TableCell>
                  <TableCell>{sede._count.equipos}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(sede)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(sede)}>
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

      <SedeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sede={editing}
        onSaved={load}
      />
    </div>
  )
}
