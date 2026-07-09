import { Document, Page, Text, View, StyleSheet, C, PDFHeader, PDFFooter, baseStyles } from '@/lib/pdf/base'
import { TURNO_LABELS, ESTADO_REGISTRO_LABELS } from '@/types'

const S = StyleSheet.create({
  body: { paddingHorizontal: 32, paddingTop: 8 },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
  },
  hallazgos: {
    fontSize: 7,
    color: C.muted,
    marginTop: 2,
  },
})

const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  BORRADOR: { bg: '#E2E5EA', text: '#26374A' },
  ENVIADO: { bg: '#FEF3DA', text: '#8A5E02' },
  APROBADO: { bg: '#DFF3E7', text: '#1E7A44' },
  RECHAZADO: { bg: '#FBE2DE', text: '#9E2E1F' },
}

function fmtDate(d: string | Date) {
  const dt = typeof d === 'string' ? new Date(d) : d
  return dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface LecturaPDF {
  equipo: { nombre: string }
  horometro: number
  combustibleGalones: number | null
  deltaHoras: number | null
  hallazgos: string | null
}

interface RegistroPDFProps {
  registro: {
    fecha: string | Date
    turno: 'DIA' | 'NOCHE'
    estado: 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO'
    sede: { nombre: string; ciudad: string }
    creadoPor: { name: string }
    aprobadoPor: { name: string } | null
    lecturas: LecturaPDF[]
  }
}

export function RegistroPDF({ registro }: RegistroPDFProps) {
  const estadoColor = ESTADO_COLORS[registro.estado]

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        <PDFHeader documentType="REGISTRO DE ACTIVIDADES" date={fmtDate(registro.fecha)} />

        <View style={S.body}>
          <View
            style={[
              S.estadoBadge,
              { backgroundColor: estadoColor.bg },
            ]}
          >
            <Text style={{ color: estadoColor.text }}>
              {ESTADO_REGISTRO_LABELS[registro.estado]}
            </Text>
          </View>

          <View style={baseStyles.titleBar}>
            <Text style={baseStyles.titleBarText}>DATOS DEL TURNO</Text>
          </View>

          <View style={baseStyles.infoGrid}>
            <View style={baseStyles.infoBlock}>
              <Text style={baseStyles.infoLabel}>Sede</Text>
              <Text style={baseStyles.infoValue}>{registro.sede.nombre}</Text>
            </View>
            <View style={baseStyles.infoBlock}>
              <Text style={baseStyles.infoLabel}>Ciudad</Text>
              <Text style={baseStyles.infoValue}>{registro.sede.ciudad}</Text>
            </View>
            <View style={baseStyles.infoBlock}>
              <Text style={baseStyles.infoLabel}>Turno</Text>
              <Text style={baseStyles.infoValue}>{TURNO_LABELS[registro.turno]}</Text>
            </View>
            <View style={baseStyles.infoBlock}>
              <Text style={baseStyles.infoLabel}>Electromecánico</Text>
              <Text style={baseStyles.infoValue}>{registro.creadoPor.name}</Text>
            </View>
          </View>

          <View style={baseStyles.titleBar}>
            <Text style={baseStyles.titleBarText}>LECTURAS POR EQUIPO</Text>
          </View>

          <View style={baseStyles.table}>
            <View style={baseStyles.tableHeader}>
              <Text style={baseStyles.tableHeaderCell}>Equipo</Text>
              <Text style={baseStyles.tableHeaderCell}>Horómetro</Text>
              <Text style={baseStyles.tableHeaderCell}>Combustible</Text>
              <Text style={baseStyles.tableHeaderCell}>Delta horas</Text>
            </View>
            {registro.lecturas.map((l, i) => (
              <View
                key={i}
                style={[baseStyles.tableRow, ...(i % 2 === 1 ? [baseStyles.tableRowAlt] : [])]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={baseStyles.tableCell}>{l.equipo.nombre}</Text>
                  {l.hallazgos && <Text style={S.hallazgos}>{l.hallazgos}</Text>}
                </View>
                <Text style={baseStyles.tableCell}>{Number(l.horometro).toFixed(1)}</Text>
                <Text style={baseStyles.tableCell}>
                  {l.combustibleGalones === null ? 'Sin dato' : `${Number(l.combustibleGalones).toFixed(1)} Gls`}
                </Text>
                <Text style={baseStyles.tableCell}>{Number(l.deltaHoras ?? 0).toFixed(1)}</Text>
              </View>
            ))}
          </View>

          <View style={baseStyles.signatureBlock}>
            <View style={baseStyles.signatureBox}>
              <View style={baseStyles.signatureLine} />
              <Text style={baseStyles.signatureName}>{registro.creadoPor.name}</Text>
              <Text style={baseStyles.signatureRole}>Electromecánico</Text>
            </View>
            {registro.aprobadoPor && (
              <View style={baseStyles.signatureBox}>
                <View style={baseStyles.signatureLine} />
                <Text style={baseStyles.signatureName}>{registro.aprobadoPor.name}</Text>
                <Text style={baseStyles.signatureRole}>Coordinador — Aprobó</Text>
              </View>
            )}
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  )
}
