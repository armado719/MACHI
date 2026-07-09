import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { usuarioSchema } from '@/validations/usuario'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const usuarios = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ data: usuarios })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = usuarioSchema.safeParse(body)
  if (!parsed.success || !parsed.data.password) {
    return NextResponse.json(
      { error: 'Datos inválidos — la contraseña es requerida para un usuario nuevo' },
      { status: 400 }
    )
  }

  const existente = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existente) {
    return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10)
  const usuario = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      role: parsed.data.role,
      active: parsed.data.active,
    },
  })

  await logAudit({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'User',
    entityId: usuario.id,
  })

  return NextResponse.json({ id: usuario.id, name: usuario.name, email: usuario.email }, { status: 201 })
}
