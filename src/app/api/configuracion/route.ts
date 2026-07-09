import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { configuracionGlobalSchema } from '@/validations/usuario'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let config = await prisma.configuracionGlobal.findFirst()
  if (!config) {
    config = await prisma.configuracionGlobal.create({ data: {} })
  }

  return NextResponse.json(config)
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = configuracionGlobalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  let config = await prisma.configuracionGlobal.findFirst()
  config = config
    ? await prisma.configuracionGlobal.update({ where: { id: config.id }, data: parsed.data })
    : await prisma.configuracionGlobal.create({ data: parsed.data })

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'ConfiguracionGlobal',
    entityId: config.id,
  })

  return NextResponse.json(config)
}
