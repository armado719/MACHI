import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { equipoSchema } from '@/validations/equipo'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = equipoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { sedeId, ...rest } = parsed.data
  const equipo = await prisma.equipo.update({
    where: { id: params.id },
    data: {
      ...rest,
      marca: rest.marca || null,
      modelo: rest.modelo || null,
      serie: rest.serie || null,
      sede: { connect: { id: sedeId } },
    },
  })

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Equipo',
    entityId: equipo.id,
    changes: parsed.data,
  })

  return NextResponse.json(equipo)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  await prisma.equipo.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), activo: false },
  })

  await logAudit({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Equipo',
    entityId: params.id,
  })

  return NextResponse.json({ ok: true })
}
