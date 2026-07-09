'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { usuarioSchema, type UsuarioFormData } from '@/validations/usuario'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ROLE_LABELS, type Role } from '@/types'

interface Usuario {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
}

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuario,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: Usuario | null
  onSaved: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { role: 'ELECTROMECANICO', active: true },
  })

  useEffect(() => {
    if (open) {
      reset(
        usuario
          ? { ...usuario, password: '' }
          : { name: '', email: '', password: '', role: 'ELECTROMECANICO', active: true }
      )
    }
  }, [open, usuario, reset])

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      const res = await fetch(
        usuario ? `/api/configuracion/usuarios/${usuario.id}` : '/api/configuracion/usuarios',
        {
          method: usuario ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo guardar el usuario')
      }
      toast.success(usuario ? 'Usuario actualizado' : 'Usuario creado')
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">
              Contraseña {usuario && <span className="text-content-muted">(dejar vacío para no cambiar)</span>}
            </Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="role">Rol</Label>
            <Select value={watch('role')} onValueChange={(v) => setValue('role', v as Role)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
