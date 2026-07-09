'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { UsuarioFormDialog } from './UsuarioFormDialog'
import { ROLE_LABELS, type Role } from '@/types'

interface Usuario {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
}

export function TabUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/configuracion/usuarios')
    const data = await res.json()
    setUsuarios(data.data ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`¿Desactivar a "${usuario.name}"?`)) return
    try {
      const res = await fetch(`/api/configuracion/usuarios/${usuario.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo desactivar el usuario')
      }
      toast.success('Usuario desactivado')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h3 className="font-display text-lg font-semibold text-content">Usuarios</h3>
          <p className="text-sm text-content-muted">Electromecánicos, coordinadores y administradores</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4" /> Nuevo usuario
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium text-content">{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{ROLE_LABELS[u.role]}</TableCell>
              <TableCell>
                <Badge variant={u.active ? 'success' : 'secondary'}>
                  {u.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(u)
                      setDialogOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u)}>
                    <Trash2 className="w-4 h-4 text-red" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UsuarioFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        usuario={editing}
        onSaved={load}
      />
    </Card>
  )
}
