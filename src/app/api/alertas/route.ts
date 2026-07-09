import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sedeId = searchParams.get('sedeId')
  const estado = searchParams.get('estado')
  const severidad = searchParams.get('severidad')

  const alertas = await prisma.alerta.findMany({
    where: {
      ...(estado ? { estado: estado as 'ACTIVA' | 'RECONOCIDA' } : {}),
      ...(severidad ? { severidad: severidad as 'AMARILLA' | 'ROJA' } : {}),
      equipo: {
        deletedAt: null,
        ...(sedeId ? { sedeId } : {}),
      },
    },
    include: {
      equipo: { select: { id: true, nombre: true, sede: { select: { id: true, nombre: true } } } },
      reconocidaPor: { select: { id: true, name: true } },
    },
    orderBy: [{ severidad: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ data: alertas, total: alertas.length })
}
