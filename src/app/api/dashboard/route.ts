import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getHistoricoLecturas, getCostoPorGalon } from '@/lib/historico'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sedeId = searchParams.get('sedeId')
  const equipoId = searchParams.get('equipoId')
  const fechaDesde = searchParams.get('fechaDesde')
  const fechaHasta = searchParams.get('fechaHasta')

  const [lecturas, costoPorGalon, alertasActivas] = await Promise.all([
    getHistoricoLecturas({ sedeId, equipoId, fechaDesde, fechaHasta }),
    getCostoPorGalon(),
    prisma.alerta.count({
      where: {
        estado: 'ACTIVA',
        equipo: { deletedAt: null, ...(sedeId ? { sedeId } : {}) },
      },
    }),
  ])

  const totalHoras = lecturas.reduce((sum, l) => sum + Number(l.deltaHoras ?? 0), 0)
  const totalGalones = lecturas.reduce((sum, l) => sum + Number(l.combustibleGalones ?? 0), 0)
  const costoAcumulado = totalGalones * costoPorGalon

  return NextResponse.json({
    resumen: {
      totalRegistrosLecturas: lecturas.length,
      totalHoras,
      totalGalones,
      costoAcumulado,
      alertasActivas,
      costoPorGalon,
    },
    historico: lecturas,
  })
}
