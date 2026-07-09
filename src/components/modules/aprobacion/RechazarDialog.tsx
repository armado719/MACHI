'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function RechazarDialog({
  open,
  onOpenChange,
  registroId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  registroId: string | null
  onDone: () => void
}) {
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (comentario.trim().length < 5) {
      toast.error('El comentario debe explicar el motivo del rechazo')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/registros/${registroId}/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentario }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo rechazar el registro')
      }
      toast.success('Registro rechazado')
      setComentario('')
      onOpenChange(false)
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar registro</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="comentario">Motivo del rechazo</Label>
          <Textarea
            id="comentario"
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Explique qué debe corregirse antes de volver a enviar"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Rechazando…' : 'Rechazar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
