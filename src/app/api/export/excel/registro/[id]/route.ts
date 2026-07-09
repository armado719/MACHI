import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import ExcelJS from 'exceljs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCostoPorGalon } from '@/lib/historico'
import { TURNO_LABELS } from '@/types'

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
      lecturas: { include: { equipo: true } },
    },
  })

  if (!registro || registro.deletedAt) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
  }

  const costoPorGalon = await getCostoPorGalon()

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Registro')
  sheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 14 },
    { header: 'Sede', key: 'sede', width: 20 },
    { header: 'Turno', key: 'turno', width: 10 },
    { header: 'Equipo', key: 'equipo', width: 28 },
    { header: 'Horómetro', key: 'horometro', width: 14 },
    { header: 'Combustible (Gls)', key: 'combustible', width: 18 },
    { header: 'Costo', key: 'costo', width: 16 },
    { header: 'Delta horas', key: 'deltaHoras', width: 14 },
  ]
  sheet.getRow(1).font = { bold: true }

  for (const l of registro.lecturas) {
    const combustible = l.combustibleGalones === null ? null : Number(l.combustibleGalones)
    sheet.addRow({
      fecha: registro.fecha.toISOString().slice(0, 10),
      sede: registro.sede.nombre,
      turno: TURNO_LABELS[registro.turno],
      equipo: l.equipo.nombre,
      horometro: Number(l.horometro),
      combustible: combustible ?? 'Sin dato',
      costo: combustible !== null ? combustible * costoPorGalon : '',
      deltaHoras: Number(l.deltaHoras ?? 0),
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="machi-registro-${registro.fecha.toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
