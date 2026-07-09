import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface HistoricoFilters {
  sedeId?: string | null
  equipoId?: string | null
  fechaDesde?: string | null
  fechaHasta?: string | null
}

/**
 * Solo cuenta registros ENVIADO o APROBADO — un BORRADOR aún no es un dato
 * confiable y un RECHAZADO no es válido para el histórico/costos.
 */
export async function getHistoricoLecturas(filters: HistoricoFilters) {
  const where: Prisma.LecturaEquipoWhereInput = {
    registro: {
      deletedAt: null,
      estado: { in: ['ENVIADO', 'APROBADO'] },
      ...(filters.sedeId ? { sedeId: filters.sedeId } : {}),
      ...(filters.fechaDesde || filters.fechaHasta
        ? {
            fecha: {
              ...(filters.fechaDesde ? { gte: new Date(filters.fechaDesde) } : {}),
              ...(filters.fechaHasta ? { lte: new Date(filters.fechaHasta) } : {}),
            },
          }
        : {}),
    },
    ...(filters.equipoId ? { equipoId: filters.equipoId } : {}),
  }

  return prisma.lecturaEquipo.findMany({
    where,
    include: {
      equipo: { select: { id: true, nombre: true } },
      registro: {
        select: {
          id: true,
          fecha: true,
          turno: true,
          estado: true,
          sede: { select: { id: true, nombre: true } },
        },
      },
    },
    orderBy: [{ registro: { fecha: 'desc' } }],
  })
}

export async function getCostoPorGalon(): Promise<number> {
  const config = await prisma.configuracionGlobal.findFirst()
  return config ? Number(config.costoPorGalon) : 0
}
