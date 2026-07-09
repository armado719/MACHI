'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, ClipboardList, Download } from 'lucide-react'
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
import { EstadoBadge } from '@/components/modules/registros/EstadoBadge'
import { formatDate } from '@/lib/utils'
import { TURNO_LABELS, type EstadoRegistro, type Turno } from '@/types'

interface RegistroRow {
  id: string
  fecha: string
  turno: Turno
  estado: EstadoRegistro
  sede: { nombre: string }
  creadoPor: { name: string }
  lecturas: unknown[]
}

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<RegistroRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/registros?mios=true&pageSize=50')
      const data = await res.json()
      setRegistros(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-content">Registro diario</h1>
          <p className="text-content-muted text-sm mt-1">Tus registros de horómetros y combustible</p>
        </div>
        <Button asChild>
          <Link href="/registros/nuevo">
            <Plus className="w-4 h-4" /> Nuevo registro
          </Link>
        </Button>
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
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Aún no has creado registros.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Equipos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDate(r.fecha, 'd MMM yyyy')}</TableCell>
                  <TableCell className="font-medium text-content">{r.sede.nombre}</TableCell>
                  <TableCell>{TURNO_LABELS[r.turno]}</TableCell>
                  <TableCell>{r.lecturas.length}</TableCell>
                  <TableCell>
                    <EstadoBadge estado={r.estado} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/registros/${r.id}`}>Ver / editar</Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/api/export/pdf/registro/${r.id}`} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
