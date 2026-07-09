'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { sedeSchema, type SedeFormData } from '@/validations/sede'
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

interface Sede {
  id: string
  nombre: string
  ciudad: string
  departamento: string
}

export function SedeFormDialog({
  open,
  onOpenChange,
  sede,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sede?: Sede | null
  onSaved: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SedeFormData>({
    resolver: zodResolver(sedeSchema),
    defaultValues: { nombre: '', ciudad: '', departamento: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        sede
          ? { nombre: sede.nombre, ciudad: sede.ciudad, departamento: sede.departamento }
          : { nombre: '', ciudad: '', departamento: '' }
      )
    }
  }, [open, sede, reset])

  const onSubmit = async (data: SedeFormData) => {
    try {
      const res = await fetch(sede ? `/api/sedes/${sede.id}` : '/api/sedes', {
        method: sede ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo guardar la sede')
      }

      toast.success(sede ? 'Sede actualizada' : 'Sede creada')
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
          <DialogTitle>{sede ? 'Editar sede' : 'Nueva sede'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="mt-1 text-xs text-red">{errors.nombre.message}</p>}
          </div>
          <div>
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input id="ciudad" {...register('ciudad')} />
            {errors.ciudad && <p className="mt-1 text-xs text-red">{errors.ciudad.message}</p>}
          </div>
          <div>
            <Label htmlFor="departamento">Departamento</Label>
            <Input id="departamento" {...register('departamento')} />
            {errors.departamento && (
              <p className="mt-1 text-xs text-red">{errors.departamento.message}</p>
            )}
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
