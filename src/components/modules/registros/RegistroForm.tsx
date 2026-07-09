'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Copy, Send, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { LecturaEquipoCard, type LecturaEquipoState } from './LecturaEquipoCard'
import { registroSchema } from '@/validations/registro'
import { queueRegistro } from '@/lib/offline/db'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

interface Sede {
  id: string
  nombre: string
}

interface Equipo {
  id: string
  nombre: string
  ultimoHorometro: number
}

interface RegistroExistente {
  id: string
  sedeId: string
  fecha: string
  turno: 'DIA' | 'NOCHE'
  estado: 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO'
  updatedAt: string
  comentarioAprobacion: string | null
  lecturas: Array<{
    equipoId: string
    horometro: number
    combustibleGalones: number | null
    hallazgos: string | null
    fotoEvidenciaUrl: string | null
    equipo: { nombre: string }
  }>
}

export function RegistroForm({
  mode,
  registroId,
}: {
  mode: 'nuevo' | 'editar'
  registroId?: string
}) {
  const router = useRouter()
  const isOnline = useOnlineStatus()

  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedeId, setSedeId] = useState('')
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [turno, setTurno] = useState<'DIA' | 'NOCHE' | ''>('')
  const [lecturas, setLecturas] = useState<LecturaEquipoState[]>([])
  const [loadingEquipos, setLoadingEquipos] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existing, setExisting] = useState<RegistroExistente | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/sedes')
      .then((r) => r.json())
      .then((d) => setSedes(d.data ?? []))
  }, [])

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((s) => setIsAdmin(s?.user?.role === 'ADMIN'))
  }, [])

  // Cargar registro existente en modo edición
  useEffect(() => {
    if (mode !== 'editar' || !registroId) return
    fetch(`/api/registros/${registroId}`)
      .then((r) => r.json())
      .then((data: RegistroExistente) => {
        setExisting(data)
        setSedeId(data.sedeId)
        setFecha(format(new Date(data.fecha), 'yyyy-MM-dd'))
        setTurno(data.turno)
        setLecturas(
          data.lecturas.map((l) => ({
            equipoId: l.equipoId,
            equipoNombre: l.equipo.nombre,
            horometro: l.horometro,
            combustibleGalones: l.combustibleGalones,
            hallazgos: l.hallazgos ?? '',
            fotoEvidenciaDataUrl: '',
            fotoPreviewUrl: l.fotoEvidenciaUrl ?? undefined,
          }))
        )
      })
      .catch(() => toast.error('No se pudo cargar el registro'))
  }, [mode, registroId])

  const loadEquiposDeSede = useCallback(
    async (targetSedeId: string) => {
      setLoadingEquipos(true)
      try {
        const res = await fetch(`/api/equipos?sedeId=${targetSedeId}&activo=true`)
        const data = await res.json()
        const equipos: Equipo[] = data.data ?? []
        setLecturas((prev) =>
          equipos.map((eq) => {
            const existente = prev.find((l) => l.equipoId === eq.id)
            return (
              existente ?? {
                equipoId: eq.id,
                equipoNombre: eq.nombre,
                horometro: eq.ultimoHorometro,
                combustibleGalones: null,
                hallazgos: '',
                fotoEvidenciaDataUrl: '',
                ultimoHorometroConocido: eq.ultimoHorometro,
              }
            )
          })
        )
      } finally {
        setLoadingEquipos(false)
      }
    },
    []
  )

  // En modo "nuevo": al elegir sede, carga el grid de equipos activos
  useEffect(() => {
    if (mode === 'nuevo' && sedeId) {
      loadEquiposDeSede(sedeId)
    }
  }, [mode, sedeId, loadEquiposDeSede])

  // En modo "nuevo": verificar duplicado sede+fecha+turno
  useEffect(() => {
    if (mode !== 'nuevo' || !sedeId || !fecha || !turno) return
    const controller = new AbortController()
    fetch(`/api/registros?sedeId=${sedeId}&fecha=${fecha}&turno=${turno}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.[0]) {
          toast.info('Ya existe un registro para esta sede, fecha y turno. Redirigiendo a editarlo…')
          router.push(`/registros/${data.data[0].id}`)
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [mode, sedeId, fecha, turno, router])

  const handleDuplicarAnterior = async () => {
    if (!sedeId || !turno) {
      toast.error('Seleccione sede y turno primero')
      return
    }
    const res = await fetch(`/api/registros/anterior?sedeId=${sedeId}&turno=${turno}`)
    const data = await res.json()
    if (!data.data) {
      toast.info('No hay un registro anterior para duplicar')
      return
    }
    setLecturas((prev) =>
      prev.map((l) => {
        const anterior = data.data.lecturas.find(
          (al: { equipoId: string; horometro: number; combustibleGalones: number | null }) =>
            al.equipoId === l.equipoId
        )
        return anterior
          ? { ...l, horometro: anterior.horometro, combustibleGalones: anterior.combustibleGalones }
          : l
      })
    )
    toast.success('Valores del registro anterior cargados — ajuste lo que cambió')
  }

  const buildPayload = (estado: 'BORRADOR' | 'ENVIADO') => ({
    sedeId,
    fecha,
    turno: turno as 'DIA' | 'NOCHE',
    estado,
    lecturas: lecturas.map((l) => ({
      equipoId: l.equipoId,
      horometro: Number(l.horometro),
      combustibleGalones: l.combustibleGalones === null ? null : Number(l.combustibleGalones),
      fotoEvidenciaDataUrl: l.fotoEvidenciaDataUrl || undefined,
      hallazgos: l.hallazgos || '',
    })),
    updatedAt: existing?.updatedAt,
  })

  const handleSubmit = async (estado: 'BORRADOR' | 'ENVIADO') => {
    if (!sedeId || !turno) {
      toast.error('Seleccione sede y turno')
      return
    }
    const payload = buildPayload(estado)
    const parsed = registroSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Datos inválidos')
      return
    }

    setSubmitting(true)
    try {
      if (!isOnline) {
        await queueRegistro({
          localId: `local-${Date.now()}`,
          registroId: existing?.id,
          payload,
        })
        toast.success('Sin conexión — el registro se guardó localmente y se sincronizará automáticamente')
        router.push('/registros')
        return
      }

      const url = existing ? `/api/registros/${existing.id}` : '/api/registros'
      const res = await fetch(url, {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await res.json()

      if (res.status === 409 && body.registroId) {
        toast.info('Ya existe un registro para esa sede/fecha/turno — se abrirá para editarlo')
        router.push(`/registros/${body.registroId}`)
        return
      }

      if (!res.ok) {
        throw new Error(body.error || 'No se pudo guardar el registro')
      }

      if (body.warnings?.length) {
        body.warnings.forEach((w: string) => toast.warning(w))
      }

      toast.success(estado === 'ENVIADO' ? 'Registro enviado para aprobación' : 'Borrador guardado')
      router.push('/registros')
    } catch (err) {
      // Falla de red inesperada estando "online" (falso positivo de navigator.onLine) — encolar como respaldo
      if (err instanceof TypeError) {
        await queueRegistro({ localId: `local-${Date.now()}`, registroId: existing?.id, payload })
        toast.warning('No se pudo conectar al servidor — el registro se guardó localmente')
        router.push('/registros')
        return
      }
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setSubmitting(false)
    }
  }

  const bloqueado = existing?.estado === 'APROBADO' && !isAdmin

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Datos del turno</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sede">Sede</Label>
            <Select value={sedeId} onValueChange={setSedeId} disabled={mode === 'editar'}>
              <SelectTrigger id="sede">
                <SelectValue placeholder="Seleccione sede" />
              </SelectTrigger>
              <SelectContent>
                {sedes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={mode === 'editar'}
            />
          </div>
          <div>
            <Label htmlFor="turno">Turno</Label>
            <Select
              value={turno}
              onValueChange={(v) => setTurno(v as 'DIA' | 'NOCHE')}
              disabled={mode === 'editar'}
            >
              <SelectTrigger id="turno">
                <SelectValue placeholder="Seleccione turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIA">Día</SelectItem>
                <SelectItem value="NOCHE">Noche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {existing?.comentarioAprobacion && existing.estado === 'RECHAZADO' && (
        <Card className="border-red/30 bg-red-bg">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red">Registro rechazado</p>
            <p className="text-sm text-red/90 mt-1">{existing.comentarioAprobacion}</p>
          </CardContent>
        </Card>
      )}

      {bloqueado && (
        <Card className="border-amber/30 bg-amber-bg">
          <CardContent className="p-4 text-sm text-amber">
            Este registro ya fue aprobado y está bloqueado para edición. Solo un Administrador
            puede corregirlo.
          </CardContent>
        </Card>
      )}

      {sedeId && turno && (
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-content">Equipos</h3>
          {mode === 'nuevo' && (
            <Button variant="outline" size="sm" onClick={handleDuplicarAnterior} type="button">
              <Copy className="w-4 h-4" /> Duplicar registro anterior
            </Button>
          )}
        </div>
      )}

      {loadingEquipos ? (
        <p className="text-sm text-content-muted">Cargando equipos…</p>
      ) : (
        <div className="space-y-4">
          {lecturas.map((lectura) => (
            <LecturaEquipoCard
              key={lectura.equipoId}
              lectura={lectura}
              onChange={(next) =>
                setLecturas((prev) =>
                  prev.map((l) => (l.equipoId === next.equipoId ? next : l))
                )
              }
            />
          ))}
        </div>
      )}

      {sedeId && turno && lecturas.length > 0 && !bloqueado && (
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            disabled={submitting}
            onClick={() => handleSubmit('BORRADOR')}
          >
            <Save className="w-4 h-4" /> Guardar borrador
          </Button>
          <Button disabled={submitting} onClick={() => handleSubmit('ENVIADO')}>
            <Send className="w-4 h-4" /> Enviar para aprobación
          </Button>
        </div>
      )}
    </div>
  )
}
