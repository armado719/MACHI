import ExcelJS from 'exceljs'
import { getHistoricoLecturas, getCostoPorGalon, type HistoricoFilters } from '@/lib/historico'
import { TURNO_LABELS } from '@/types'

const COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 14 },
  { header: 'Sede', key: 'sede', width: 20 },
  { header: 'Turno', key: 'turno', width: 10 },
  { header: 'Equipo', key: 'equipo', width: 28 },
  { header: 'Horómetro', key: 'horometro', width: 14 },
  { header: 'Combustible (Gls)', key: 'combustible', width: 18 },
  { header: 'Costo', key: 'costo', width: 16 },
  { header: 'Delta horas', key: 'deltaHoras', width: 14 },
]

/** Hoja única en formato largo — pivoteable directo en Excel. */
export async function buildConsolidadoWorkbook(filters: HistoricoFilters) {
  const [lecturas, costoPorGalon] = await Promise.all([
    getHistoricoLecturas(filters),
    getCostoPorGalon(),
  ])

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MACHI'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Histórico')
  sheet.columns = COLUMNS

  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E5EA' },
  }

  for (const l of lecturas) {
    const combustible = l.combustibleGalones === null ? null : Number(l.combustibleGalones)
    sheet.addRow({
      fecha: l.registro.fecha.toISOString().slice(0, 10),
      sede: l.registro.sede.nombre,
      turno: TURNO_LABELS[l.registro.turno],
      equipo: l.equipo.nombre,
      horometro: Number(l.horometro),
      combustible: combustible ?? 'Sin dato',
      costo: combustible !== null ? combustible * costoPorGalon : '',
      deltaHoras: Number(l.deltaHoras ?? 0),
    })
  }

  sheet.getColumn('costo').numFmt = '#,##0'

  return workbook
}
