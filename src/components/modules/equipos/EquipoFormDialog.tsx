'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { equipoSchema, type EquipoFormData } from '@/validations/equipo'
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
}

export function EquipoFormDialog({
  open,
  onOpenChange,
  equipo,
  sedes,
  defaultSedeId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipo?: Equipo | null
  sedes: Sede[]
  defaultSedeId?: string
  onSaved: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EquipoFormData>({
    resolver: zodResolver(equipoSchema),
    defaultValues: { sedeId: defaultSedeId ?? '', nombre: '', activo: true },
  })

  useEffect(() => {
    if (open) {
      reset(
        equipo
          ? {
              sedeId: equipo.sedeId,
              nombre: equipo.nombre,
              marca: equipo.marca ?? '',
              modelo: equipo.modelo ?? '',
              serie: equipo.serie ?? '',
              capacidadTanqueGalones: equipo.capacidadTanqueGalones,
              intervaloMantenimientoHoras: equipo.intervaloMantenimientoHoras,
              umbralAmarilloHoras: equipo.umbralAmarilloHoras,
              umbralRojoHoras: equipo.umbralRojoHoras,
              activo: equipo.activo,
            }
          : {
              sedeId: defaultSedeId ?? '',
              nombre: '',
              marca: '',
              modelo: '',
              serie: '',
              capacidadTanqueGalones: undefined,
              intervaloMantenimientoHoras: undefined,
              umbralAmarilloHoras: undefined,
              umbralRojoHoras: undefined,
              activo: true,
            }
      )
    }
  }, [open, equipo, defaultSedeId, reset])

  const onSubmit = async (data: EquipoFormData) => {
    try {
      const res = await fetch(equipo ? `/api/equipos/${equipo.id}` : '/api/equipos', {
        method: equipo ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo guardar el equipo')
      }

      toast.success(equipo ? 'Equipo actualizado' : 'Equipo creado')
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{equipo ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="sedeId">Sede</Label>
              <Select
                value={watch('sedeId')}
                onValueChange={(v) => setValue('sedeId', v, { shouldValidate: true })}
              >
                <SelectTrigger id="sedeId">
                  <SelectValue placeholder="Seleccione una sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sedeId && <p className="mt-1 text-xs text-red">{errors.sedeId.message}</p>}
            </div>

            <div className="col-span-2">
              <Label htmlFor="nombre">Nombre / identificador del equipo</Label>
              <Input id="nombre" placeholder="Ej. Excavadora CAT-320 #04" {...register('nombre')} />
              {errors.nombre && <p className="mt-1 text-xs text-red">{errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" {...register('marca')} />
            </div>
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" {...register('modelo')} />
            </div>
            <div>
              <Label htmlFor="serie">Serie</Label>
              <Input id="serie" {...register('serie')} />
            </div>
            <div>
              <Label htmlFor="capacidadTanqueGalones">Capacidad tanque (Gls)</Label>
              <Input
                id="capacidadTanqueGalones"
                type="number"
                step="0.1"
                {...register('capacidadTanqueGalones')}
              />
            </div>
            <div>
              <Label htmlFor="intervaloMantenimientoHoras">Intervalo mantenimiento (h)</Label>
              <Input
                id="intervaloMantenimientoHoras"
                type="number"
                step="1"
                {...register('intervaloMantenimientoHoras')}
              />
            </div>
            <div>
              <Label htmlFor="umbralAmarilloHoras">Umbral alerta amarilla (h antes)</Label>
              <Input
                id="umbralAmarilloHoras"
                type="number"
                step="1"
                {...register('umbralAmarilloHoras')}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="umbralRojoHoras">Umbral alerta roja (h antes)</Label>
              <Input
                id="umbralRojoHoras"
                type="number"
                step="1"
                {...register('umbralRojoHoras')}
              />
            </div>
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
