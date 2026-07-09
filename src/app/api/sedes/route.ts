import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { sedeSchema } from '@/validations/sede'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  const sedes = await prisma.sede.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nombre: { contains: search } },
              { ciudad: { contains: search } },
              { departamento: { contains: search } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { equipos: true } } },
    orderBy: { nombre: 'asc' },
  })

  return NextResponse.json({ data: sedes })
}

export async function POST(request: NextRequest) {
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

  const sede = await prisma.sede.create({ data: parsed.data })

  await logAudit({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Sede',
    entityId: sede.id,
    changes: parsed.data,
  })

  return NextResponse.json(sede, { status: 201 })
}
