import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { sedeSchema } from '@/validations/sede'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = sedeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const sede = await prisma.sede.update({
    where: { id: params.id },
    data: parsed.data,
  })

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Sede',
    entityId: sede.id,
    changes: parsed.data,
  })

  return NextResponse.json(sede)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const equiposActivos = await prisma.equipo.count({
    where: { sedeId: params.id, deletedAt: null },
  })

  if (equiposActivos > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar una sede con equipos activos asociados' },
      { status: 409 }
    )
  }

  await prisma.sede.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  })

  await logAudit({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Sede',
    entityId: params.id,
  })

  return NextResponse.json({ ok: true })
}
