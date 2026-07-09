import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { rechazarSchema } from '@/validations/registro'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'COORDINADOR' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = rechazarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Debe indicar el motivo del rechazo', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const registro = await prisma.registroDiario.findUnique({ where: { id: id } })
  if (!registro || registro.deletedAt) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
  }

  if (registro.estado !== 'ENVIADO') {
    return NextResponse.json(
      { error: 'Solo se pueden rechazar registros en estado Enviado' },
      { status: 409 }
    )
  }

  const updated = await prisma.registroDiario.update({
    where: { id: id },
    data: {
      estado: 'RECHAZADO',
      aprobadoPorId: session.user.id,
      aprobadoAt: new Date(),
      comentarioAprobacion: parsed.data.comentario,
    },
  })

  await logAudit({
    userId: session.user.id,
    action: 'RECHAZAR',
    entity: 'RegistroDiario',
    entityId: registro.id,
    motivo: parsed.data.comentario,
  })

  return NextResponse.json(updated)
}
