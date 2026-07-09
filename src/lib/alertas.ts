import { prisma } from '@/lib/prisma'

const DEFAULT_ANOMALIA_PORCENTAJE = 30

async function upsertAlerta(
  equipoId: string,
  tipo: 'MANTENIMIENTO_PROXIMO' | 'MANTENIMIENTO_VENCIDO' | 'CONSUMO_ANOMALO',
  severidad: 'AMARILLA' | 'ROJA',
  mensaje: string
) {
  const existente = await prisma.alerta.findFirst({
    where: { equipoId, tipo, estado: 'ACTIVA' },
  })

  if (existente) {
    if (existente.severidad !== severidad || existente.mensaje !== mensaje) {
      await prisma.alerta.update({
        where: { id: existente.id },
        data: { severidad, mensaje },
      })
    }
    return
  }

  await prisma.alerta.create({
    data: { equipoId, tipo, severidad, mensaje },
  })
}

async function resolverAlerta(equipoId: string, tipo: string) {
  await prisma.alerta.updateMany({
    where: { equipoId, tipo, estado: 'ACTIVA' },
    data: { estado: 'RECONOCIDA', reconocidaAt: new Date() },
  })
}

/** Evalúa umbrales de mantenimiento y consumo anómalo para un equipo tras registrar una lectura. */
export async function evaluarAlertasEquipo(equipoId: string) {
  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } })
  if (!equipo) return

  // --- Mantenimiento por horas ---
  if (equipo.intervaloMantenimientoHoras) {
    const intervalo = Number(equipo.intervaloMantenimientoHoras)
    const horas = Number(equipo.horasDesdeMantenimiento)
    const umbralRojo = equipo.umbralRojoHoras ? Number(equipo.umbralRojoHoras) : 0
    const umbralAmarillo = equipo.umbralAmarilloHoras ? Number(equipo.umbralAmarilloHoras) : 0

    const horasRestantes = intervalo - horas

    if (horasRestantes <= 0) {
      await upsertAlerta(
        equipoId,
        'MANTENIMIENTO_VENCIDO',
        'ROJA',
        `${equipo.nombre}: mantenimiento vencido (${horas.toFixed(1)}h de ${intervalo}h)`
      )
      await resolverAlerta(equipoId, 'MANTENIMIENTO_PROXIMO')
    } else if (horasRestantes <= umbralRojo) {
      await upsertAlerta(
        equipoId,
        'MANTENIMIENTO_PROXIMO',
        'ROJA',
        `${equipo.nombre}: quedan ${horasRestantes.toFixed(1)}h para el mantenimiento`
      )
      await resolverAlerta(equipoId, 'MANTENIMIENTO_VENCIDO')
    } else if (horasRestantes <= umbralAmarillo) {
      await upsertAlerta(
        equipoId,
        'MANTENIMIENTO_PROXIMO',
        'AMARILLA',
        `${equipo.nombre}: quedan ${horasRestantes.toFixed(1)}h para el mantenimiento`
      )
      await resolverAlerta(equipoId, 'MANTENIMIENTO_VENCIDO')
    } else {
      await resolverAlerta(equipoId, 'MANTENIMIENTO_PROXIMO')
      await resolverAlerta(equipoId, 'MANTENIMIENTO_VENCIDO')
    }
  }

  // --- Consumo anómalo (Gls/Hr vs promedio histórico) ---
  const historial = await prisma.lecturaEquipo.findMany({
    where: {
      equipoId,
      combustibleGalones: { not: null },
      deltaHoras: { gt: 0 },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  if (historial.length >= 5) {
    const ultima = historial[0]
    const anteriores = historial.slice(1)

    const rendimientos = anteriores.map(
      (l) => Number(l.combustibleGalones) / Number(l.deltaHoras)
    )
    const promedio = rendimientos.reduce((a, b) => a + b, 0) / rendimientos.length
    const rendimientoActual = Number(ultima.combustibleGalones) / Number(ultima.deltaHoras)

    const config = await prisma.configuracionGlobal.findFirst()
    const umbralPorcentaje = config
      ? Number(config.umbralAnomaliaPorcentaje)
      : DEFAULT_ANOMALIA_PORCENTAJE

    const desviacion = promedio > 0 ? Math.abs(rendimientoActual - promedio) / promedio : 0

    if (desviacion * 100 >= umbralPorcentaje) {
      const equipoNombre = equipo.nombre
      await upsertAlerta(
        equipoId,
        'CONSUMO_ANOMALO',
        desviacion * 100 >= umbralPorcentaje * 2 ? 'ROJA' : 'AMARILLA',
        `${equipoNombre}: consumo de ${rendimientoActual.toFixed(2)} Gls/h se desvía ${(desviacion * 100).toFixed(0)}% del promedio histórico (${promedio.toFixed(2)} Gls/h)`
      )
    } else {
      await resolverAlerta(equipoId, 'CONSUMO_ANOMALO')
    }
  }
}
