import type { PrismaClient } from '@prisma/client'

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

/** Turno DIA precede a NOCHE dentro del mismo día para ordenar cronológicamente. */
const TURNO_ORDEN = { DIA: 0, NOCHE: 1 } as const

/**
 * Busca la lectura previa (cronológicamente) de un equipo antes de una fecha/turno dados,
 * excluyendo un registro específico (usado al editar). Necesario porque `equipo.ultimoHorometro`
 * es solo un caché del último valor conocido — al editar un registro antiguo hay que comparar
 * contra lo que era "anterior" en ese momento, no contra el caché global.
 */
export async function getLecturaAnterior(
  tx: Tx,
  equipoId: string,
  fecha: Date,
  turno: 'DIA' | 'NOCHE',
  excludeRegistroId: string
) {
  const candidatas = await tx.lecturaEquipo.findMany({
    where: {
      equipoId,
      registroDiarioId: { not: excludeRegistroId },
      registro: { deletedAt: null },
    },
    include: { registro: { select: { fecha: true, turno: true } } },
  })

  const anteriores = candidatas.filter((l) => {
    const f = l.registro.fecha.getTime()
    if (f < fecha.getTime()) return true
    if (f > fecha.getTime()) return false
    return TURNO_ORDEN[l.registro.turno] < TURNO_ORDEN[turno]
  })

  anteriores.sort((a, b) => {
    const diff = b.registro.fecha.getTime() - a.registro.fecha.getTime()
    if (diff !== 0) return diff
    return TURNO_ORDEN[b.registro.turno] - TURNO_ORDEN[a.registro.turno]
  })

  return anteriores[0] ?? null
}

/** true si no existe ninguna lectura posterior de ese equipo (esta es la más reciente conocida). */
export async function esLecturaMasReciente(
  tx: Tx,
  equipoId: string,
  fecha: Date,
  turno: 'DIA' | 'NOCHE',
  excludeRegistroId: string
) {
  const posteriores = await tx.lecturaEquipo.findMany({
    where: {
      equipoId,
      registroDiarioId: { not: excludeRegistroId },
      registro: { deletedAt: null },
    },
    include: { registro: { select: { fecha: true, turno: true } } },
  })

  return !posteriores.some((l) => {
    const f = l.registro.fecha.getTime()
    if (f > fecha.getTime()) return true
    if (f < fecha.getTime()) return false
    return TURNO_ORDEN[l.registro.turno] > TURNO_ORDEN[turno]
  })
}
