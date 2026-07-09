import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const alerta = await prisma.alerta.update({
    where: { id: params.id },
    data: {
      estado: 'RECONOCIDA',
      reconocidaPorId: session.user.id,
      reconocidaAt: new Date(),
    },
  })

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Alerta',
    entityId: alerta.id,
  })

  return NextResponse.json(alerta)
}
