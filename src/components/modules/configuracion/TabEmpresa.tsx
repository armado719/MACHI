'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { configuracionGlobalSchema, type ConfiguracionGlobalFormData } from '@/validations/usuario'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function TabEmpresa() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConfiguracionGlobalFormData>({
    resolver: zodResolver(configuracionGlobalSchema),
  })

  useEffect(() => {
    fetch('/api/configuracion')
      .then((r) => r.json())
      .then((data) =>
        reset({
          nombreEmpresa: data.nombreEmpresa,
          costoPorGalon: Number(data.costoPorGalon),
          umbralAnomaliaPorcentaje: Number(data.umbralAnomaliaPorcentaje),
        })
      )
  }, [reset])

  const onSubmit = async (data: ConfiguracionGlobalFormData) => {
    try {
      const res = await fetch('/api/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('No se pudo guardar la configuración')
      toast.success('Configuración actualizada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa</CardTitle>
        <CardDescription>
          Nombre provisional, costo por galón y sensibilidad de detección de consumo anómalo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
            <Input id="nombreEmpresa" {...register('nombreEmpresa')} />
            {errors.nombreEmpresa && (
              <p className="mt-1 text-xs text-red">{errors.nombreEmpresa.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="costoPorGalon">Costo por galón</Label>
            <Input id="costoPorGalon" type="number" step="0.01" {...register('costoPorGalon')} />
            {errors.costoPorGalon && (
              <p className="mt-1 text-xs text-red">{errors.costoPorGalon.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="umbralAnomaliaPorcentaje">
              Umbral de desviación para consumo anómalo (%)
            </Label>
            <Input
              id="umbralAnomaliaPorcentaje"
              type="number"
              step="1"
              {...register('umbralAnomaliaPorcentaje')}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
