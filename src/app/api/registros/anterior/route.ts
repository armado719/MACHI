import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** Devuelve el registro más reciente de una sede/turno para precargar el formulario ("duplicar anterior"). */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sedeId = searchParams.get('sedeId')
  const turno = searchParams.get('turno')

  if (!sedeId || !turno) {
    return NextResponse.json({ error: 'sedeId y turno son requeridos' }, { status: 400 })
  }

  const registro = await prisma.registroDiario.findFirst({
    where: { sedeId, turno: turno as 'DIA' | 'NOCHE', deletedAt: null },
    orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
    include: {
      lecturas: { include: { equipo: { select: { id: true, nombre: true, activo: true } } } },
    },
  })

  return NextResponse.json({ data: registro })
}
