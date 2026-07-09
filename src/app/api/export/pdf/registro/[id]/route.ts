import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RegistroPDF } from '@/lib/pdf/templates/RegistroPDF'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const registro = await prisma.registroDiario.findUnique({
    where: { id: id },
    include: {
      sede: true,
      creadoPor: { select: { name: true } },
      aprobadoPor: { select: { name: true } },
      lecturas: { include: { equipo: true } },
    },
  })

  if (!registro || registro.deletedAt) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
  }

  const buffer = await renderToBuffer(
    createElement(RegistroPDF, {
      registro: {
        fecha: registro.fecha,
        turno: registro.turno,
        estado: registro.estado,
        sede: registro.sede,
        creadoPor: registro.creadoPor,
        aprobadoPor: registro.aprobadoPor,
        lecturas: registro.lecturas.map((l) => ({
          equipo: { nombre: l.equipo.nombre },
          horometro: Number(l.horometro),
          combustibleGalones: l.combustibleGalones === null ? null : Number(l.combustibleGalones),
          deltaHoras: l.deltaHoras === null ? null : Number(l.deltaHoras),
          hallazgos: l.hallazgos,
        })),
      },
    }) as any
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="machi-registro-${registro.fecha.toISOString().slice(0, 10)}.pdf"`,
    },
  })
}
