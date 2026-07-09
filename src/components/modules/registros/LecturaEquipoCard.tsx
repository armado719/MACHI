'use client'

import { useRef } from 'react'
import { Camera, X, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { LecturaFormData } from '@/validations/registro'

const MAX_FILE_SIZE_MB = 5

export interface LecturaEquipoState extends LecturaFormData {
  equipoNombre: string
  ultimoHorometroConocido?: number
  fotoPreviewUrl?: string
}

export function LecturaEquipoCard({
  lectura,
  onChange,
}: {
  lectura: LecturaEquipoState
  onChange: (next: LecturaEquipoState) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const horometroRetrocede =
    lectura.ultimoHorometroConocido !== undefined &&
    lectura.horometro !== undefined &&
    Number(lectura.horometro) < lectura.ultimoHorometroConocido

  const handleFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`La imagen no puede superar ${MAX_FILE_SIZE_MB}MB`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange({
        ...lectura,
        fotoEvidenciaDataUrl: reader.result as string,
        fotoPreviewUrl: reader.result as string,
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-base font-semibold text-content tracking-wide">
          {lectura.equipoNombre}
        </h4>
        {lectura.ultimoHorometroConocido !== undefined && (
          <span className="text-xs text-content-muted">
            Último horómetro: {lectura.ultimoHorometroConocido}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`horometro-${lectura.equipoId}`}>Horómetro</Label>
          <Input
            id={`horometro-${lectura.equipoId}`}
            type="number"
            step="0.1"
            value={lectura.horometro ?? ''}
            onChange={(e) => onChange({ ...lectura, horometro: Number(e.target.value) })}
            className={cn(horometroRetrocede && 'border-amber focus:ring-amber focus:border-amber')}
          />
          {horometroRetrocede && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber">
              <AlertTriangle className="w-3 h-3" />
              Menor al último registrado — verifique si hubo cambio de equipo
            </p>
          )}
        </div>
        <div>
          <Label htmlFor={`combustible-${lectura.equipoId}`}>Combustible (Gls)</Label>
          <Input
            id={`combustible-${lectura.equipoId}`}
            type="number"
            step="0.1"
            placeholder="Sin dato"
            value={lectura.combustibleGalones ?? ''}
            onChange={(e) =>
              onChange({
                ...lectura,
                combustibleGalones: e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
          <p className="mt-1 text-xs text-content-muted">
            Deje vacío si no se reportó — no es igual a &quot;0 Gls&quot;
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor={`hallazgos-${lectura.equipoId}`}>Hallazgos / observaciones</Label>
        <Textarea
          id={`hallazgos-${lectura.equipoId}`}
          rows={2}
          value={lectura.hallazgos ?? ''}
          onChange={(e) => onChange({ ...lectura, hallazgos: e.target.value })}
        />
      </div>

      <div>
        <Label>Foto de evidencia (opcional)</Label>
        {lectura.fotoPreviewUrl ? (
          <div className="relative w-24 h-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lectura.fotoPreviewUrl}
              alt="Evidencia"
              className="w-24 h-24 object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() =>
                onChange({ ...lectura, fotoEvidenciaDataUrl: '', fotoPreviewUrl: undefined })
              }
              className="absolute -top-2 -right-2 bg-white border border-border rounded-full p-1 shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-content-muted border border-dashed border-border rounded-lg px-3 py-2 hover:border-steel hover:text-steel transition-colors"
          >
            <Camera className="w-4 h-4" /> Adjuntar foto
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
    </div>
  )
}
