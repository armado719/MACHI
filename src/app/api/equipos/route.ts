import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { equipoSchema } from '@/validations/equipo'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sedeId = searchParams.get('sedeId')
  const activo = searchParams.get('activo')

  const equipos = await prisma.equipo.findMany({
    where: {
      deletedAt: null,
      ...(sedeId ? { sedeId } : {}),
      ...(activo !== null ? { activo: activo === 'true' } : {}),
    },
    include: { sede: { select: { id: true, nombre: true } } },
    orderBy: { nombre: 'asc' },
  })

  return NextResponse.json({ data: equipos })
}

export async function POST(request: NextRequest) {
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
  const equipo = await prisma.equipo.create({
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
    action: 'CREATE',
    entity: 'Equipo',
    entityId: equipo.id,
    changes: parsed.data,
  })

  return NextResponse.json(equipo, { status: 201 })
}
