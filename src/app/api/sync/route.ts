import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { crearRegistro, actualizarRegistro, ConflictoRegistroError } from '@/lib/registros'
import { registroSchema } from '@/validations/registro'

/**
 * Recibe registros encolados en IndexedDB mientras el dispositivo estaba sin conexión
 * y los aplica contra la base de datos. Reutiliza la misma lógica de creación/edición
 * que /api/registros para no duplicar reglas de negocio.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = registroSchema.safeParse(body.payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    if (body.registroId) {
      const { registro, warnings } = await actualizarRegistro(
        session.user.id,
        session.user.role === 'ADMIN',
        body.registroId,
        parsed.data
      )
      return NextResponse.json({ ...registro, warnings })
    }

    const { registro, warnings } = await crearRegistro(session.user.id, parsed.data)
    return NextResponse.json({ ...registro, warnings }, { status: 201 })
  } catch (err) {
    if (err instanceof ConflictoRegistroError) {
      return NextResponse.json({ error: err.message, registroId: err.registroId }, { status: 409 })
    }
    throw err
  }
}
