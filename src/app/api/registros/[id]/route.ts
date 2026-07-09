import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { actualizarRegistro, ConflictoRegistroError } from '@/lib/registros'
import { registroSchema } from '@/validations/registro'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const registro = await prisma.registroDiario.findUnique({
    where: { id: params.id },
    include: {
      sede: { select: { id: true, nombre: true } },
      creadoPor: { select: { id: true, name: true } },
      aprobadoPor: { select: { id: true, name: true } },
      lecturas: { include: { equipo: true } },
    },
  })

  if (!registro || registro.deletedAt) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
  }

  return NextResponse.json(registro)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { registro, warnings } = await actualizarRegistro(
      session.user.id,
      session.user.role === 'ADMIN',
      params.id,
      parsed.data,
      body.motivo
    )

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'RegistroDiario',
      entityId: registro.id,
      motivo: body.motivo,
    })

    return NextResponse.json({ ...registro, warnings })
  } catch (err) {
    if (err instanceof ConflictoRegistroError) {
      const status = err.message.includes('no encontrado')
        ? 404
        : err.message.includes('modificado por otro usuario')
          ? 409
          : 403
      return NextResponse.json({ error: err.message }, { status })
    }
    throw err
  }
}
