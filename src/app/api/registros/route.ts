import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { crearRegistro, ConflictoRegistroError } from '@/lib/registros'
import { registroSchema } from '@/validations/registro'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sedeId = searchParams.get('sedeId')
  const fecha = searchParams.get('fecha')
  const turno = searchParams.get('turno')
  const estado = searchParams.get('estado')
  const equipoId = searchParams.get('equipoId')
  const fechaDesde = searchParams.get('fechaDesde')
  const fechaHasta = searchParams.get('fechaHasta')
  const mios = searchParams.get('mios')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where: Prisma.RegistroDiarioWhereInput = {
    deletedAt: null,
    ...(sedeId ? { sedeId } : {}),
    ...(fecha ? { fecha: new Date(fecha) } : {}),
    ...(turno ? { turno: turno as 'DIA' | 'NOCHE' } : {}),
    ...(estado ? { estado: estado as 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO' } : {}),
    ...(mios === 'true' ? { creadoPorId: session.user.id } : {}),
    ...(fechaDesde || fechaHasta
      ? {
          fecha: {
            ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
            ...(fechaHasta ? { lte: new Date(fechaHasta) } : {}),
          },
        }
      : {}),
    ...(equipoId ? { lecturas: { some: { equipoId } } } : {}),
  }

  const [data, total] = await Promise.all([
    prisma.registroDiario.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
      include: {
        sede: { select: { id: true, nombre: true } },
        creadoPor: { select: { id: true, name: true } },
        aprobadoPor: { select: { id: true, name: true } },
        lecturas: { include: { equipo: { select: { id: true, nombre: true } } } },
      },
    }),
    prisma.registroDiario.count({ where }),
  ])

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = registroSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const { registro, warnings } = await crearRegistro(session.user.id, parsed.data)

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'RegistroDiario',
      entityId: registro.id,
    })

    return NextResponse.json({ ...registro, warnings }, { status: 201 })
  } catch (err) {
    if (err instanceof ConflictoRegistroError) {
      return NextResponse.json({ error: err.message, registroId: err.registroId }, { status: 409 })
    }
    throw err
  }
}
