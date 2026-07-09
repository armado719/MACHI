import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildConsolidadoWorkbook } from '@/lib/excel/consolidado'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const workbook = await buildConsolidadoWorkbook({
    sedeId: searchParams.get('sedeId'),
    equipoId: searchParams.get('equipoId'),
    fechaDesde: searchParams.get('fechaDesde'),
    fechaHasta: searchParams.get('fechaHasta'),
  })

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="machi-consolidado-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
