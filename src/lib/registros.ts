import { prisma } from '@/lib/prisma'
import { evaluarAlertasEquipo } from '@/lib/alertas'
import { saveEvidenceImage } from '@/lib/uploads'
import { getLecturaAnterior, esLecturaMasReciente } from '@/lib/lecturas'
import type { RegistroFormData } from '@/validations/registro'

export class ConflictoRegistroError extends Error {
  registroId?: string
  constructor(message: string, registroId?: string) {
    super(message)
    this.registroId = registroId
  }
}

export async function crearRegistro(userId: string, data: RegistroFormData) {
  const { sedeId, fecha, turno, estado, lecturas } = data

  const existente = await prisma.registroDiario.findFirst({
    where: { sedeId, fecha: new Date(fecha), turno, deletedAt: null },
  })

  if (existente) {
    throw new ConflictoRegistroError(
      'Ya existe un registro para esta sede, fecha y turno. Edítelo en vez de crear uno nuevo.',
      existente.id
    )
  }

  const equipos = await prisma.equipo.findMany({
    where: { id: { in: lecturas.map((l) => l.equipoId) } },
  })
  const equiposById = new Map(equipos.map((e) => [e.id, e]))
  const warnings: string[] = []

  const registro = await prisma.$transaction(async (tx) => {
    const created = await tx.registroDiario.create({
      data: { sedeId, fecha: new Date(fecha), turno, estado, creadoPorId: userId },
    })

    for (const lectura of lecturas) {
      const equipo = equiposById.get(lectura.equipoId)
      if (!equipo) continue

      const ultimoHorometro = Number(equipo.ultimoHorometro)
      const retrocedio = lectura.horometro < ultimoHorometro
      if (retrocedio) {
        warnings.push(
          `${equipo.nombre}: el horómetro (${lectura.horometro}) es menor al último registrado (${ultimoHorometro}). Verifique si hubo cambio de equipo.`
        )
      }
      const deltaHoras = Math.max(0, lectura.horometro - ultimoHorometro)

      let fotoEvidenciaUrl: string | null = null
      if (lectura.fotoEvidenciaDataUrl) {
        fotoEvidenciaUrl = await saveEvidenceImage(
          lectura.fotoEvidenciaDataUrl,
          created.id,
          lectura.equipoId
        )
      }

      await tx.lecturaEquipo.create({
        data: {
          registroDiarioId: created.id,
          equipoId: lectura.equipoId,
          horometro: lectura.horometro,
          combustibleGalones: lectura.combustibleGalones,
          deltaHoras,
          horometroRetrocedio: retrocedio,
          fotoEvidenciaUrl,
          hallazgos: lectura.hallazgos || null,
        },
      })

      await tx.equipo.update({
        where: { id: lectura.equipoId },
        data: {
          ultimoHorometro: lectura.horometro,
          horasDesdeMantenimiento: { increment: deltaHoras },
        },
      })
    }

    return created
  })

  for (const lectura of lecturas) {
    await evaluarAlertasEquipo(lectura.equipoId)
  }

  return { registro, warnings }
}

export async function actualizarRegistro(
  userId: string,
  isAdmin: boolean,
  registroId: string,
  data: RegistroFormData,
  motivo?: string
) {
  const existing = await prisma.registroDiario.findUnique({ where: { id: registroId } })
  if (!existing || existing.deletedAt) {
    throw new ConflictoRegistroError('Registro no encontrado')
  }

  if (existing.estado === 'APROBADO' && !isAdmin) {
    throw new ConflictoRegistroError('Este registro ya fue aprobado y no puede editarse')
  }

  if (existing.estado === 'APROBADO' && isAdmin && !motivo) {
    throw new ConflictoRegistroError('Debe indicar el motivo para corregir un registro aprobado')
  }

  if (data.updatedAt && new Date(data.updatedAt).getTime() !== existing.updatedAt.getTime()) {
    throw new ConflictoRegistroError(
      'Este registro fue modificado por otro usuario mientras lo editabas. Recarga para ver los cambios más recientes.'
    )
  }

  const { fecha, turno, estado, lecturas } = data
  const nuevaFecha = new Date(fecha)

  const equipos = await prisma.equipo.findMany({
    where: { id: { in: lecturas.map((l) => l.equipoId) } },
  })
  const equiposById = new Map(equipos.map((e) => [e.id, e]))
  const warnings: string[] = []

  const registro = await prisma.$transaction(async (tx) => {
    await tx.lecturaEquipo.deleteMany({ where: { registroDiarioId: registroId } })

    for (const lectura of lecturas) {
      const equipo = equiposById.get(lectura.equipoId)
      if (!equipo) continue

      const anterior = await getLecturaAnterior(tx, lectura.equipoId, nuevaFecha, turno, registroId)
      const horometroAnterior = anterior ? Number(anterior.horometro) : 0
      const retrocedio = lectura.horometro < horometroAnterior
      if (retrocedio) {
        warnings.push(
          `${equipo.nombre}: el horómetro (${lectura.horometro}) es menor al de la lectura anterior (${horometroAnterior}). Verifique si hubo cambio de equipo.`
        )
      }
      const deltaHoras = Math.max(0, lectura.horometro - horometroAnterior)

      let fotoEvidenciaUrl: string | null = null
      if (lectura.fotoEvidenciaDataUrl) {
        fotoEvidenciaUrl = await saveEvidenceImage(
          lectura.fotoEvidenciaDataUrl,
          registroId,
          lectura.equipoId
        )
      }

      await tx.lecturaEquipo.create({
        data: {
          registroDiarioId: registroId,
          equipoId: lectura.equipoId,
          horometro: lectura.horometro,
          combustibleGalones: lectura.combustibleGalones,
          deltaHoras,
          horometroRetrocedio: retrocedio,
          fotoEvidenciaUrl,
          hallazgos: lectura.hallazgos || null,
        },
      })

      const esLaMasReciente = await esLecturaMasReciente(
        tx,
        lectura.equipoId,
        nuevaFecha,
        turno,
        registroId
      )
      if (esLaMasReciente) {
        await tx.equipo.update({
          where: { id: lectura.equipoId },
          data: { ultimoHorometro: lectura.horometro },
        })
      }
    }

    const estadoFinal = existing.estado === 'APROBADO' && isAdmin ? 'APROBADO' : estado

    return tx.registroDiario.update({
      where: { id: registroId },
      data: { fecha: nuevaFecha, turno, estado: estadoFinal },
    })
  })

  for (const lectura of lecturas) {
    await evaluarAlertasEquipo(lectura.equipoId)
  }

  return { registro, warnings }
}
