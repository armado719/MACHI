import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const C = {
  steel: '#3E5C76',
  steelDark: '#26374A',
  bg: '#F4F6F8',
  text: '#1C2430',
  muted: '#64748B',
  border: '#E2E5EA',
  white: '#FFFFFF',
  amber: '#D98E04',
  red: '#D6402F',
  green: '#2F9E5B',
}

export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.text,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: C.steel,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#D9E2EA',
    marginTop: 2,
  },
  headerRight: {
    position: 'absolute',
    right: 32,
    top: 16,
    alignItems: 'flex-end',
  },
  headerRightText: {
    fontSize: 8,
    color: '#D9E2EA',
  },
  body: { paddingHorizontal: 32 },
  titleBar: {
    backgroundColor: C.bg,
    borderLeft: `4px solid ${C.steel}`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  titleBarText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.steelDark,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoBlock: {
    width: '25%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 7,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: C.text,
    fontFamily: 'Helvetica-Bold',
  },
  table: { width: '100%', marginBottom: 8 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.steel,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `1px solid ${C.border}`,
  },
  tableRowAlt: { backgroundColor: C.bg },
  tableCell: { fontSize: 8, color: C.text, flex: 1 },
  signatureBlock: {
    marginTop: 32,
    borderTop: `1px solid ${C.border}`,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: { width: 200, alignItems: 'center' },
  signatureLine: { borderBottom: `1px solid ${C.text}`, width: 180, marginBottom: 4 },
  signatureName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.text },
  signatureRole: { fontSize: 8, color: C.muted },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid ${C.border}`,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: C.muted },
})

export function PDFHeader({
  documentType,
  date,
  empresa = 'Gworks Services S.A.S.',
}: {
  documentType: string
  date: string
  empresa?: string
}) {
  return (
    <View style={baseStyles.header} fixed>
      <Text style={baseStyles.headerTitle}>MACHI</Text>
      <Text style={baseStyles.headerSubtitle}>{empresa} — Tracker de Horómetros y Combustible</Text>
      <View style={baseStyles.headerRight}>
        <Text style={baseStyles.headerRightText}>{documentType}</Text>
        <Text style={baseStyles.headerRightText}>{date}</Text>
      </View>
    </View>
  )
}

export function PDFFooter({ text }: { text?: string }) {
  return (
    <View style={baseStyles.footer} fixed>
      <Text style={baseStyles.footerText}>{text ?? 'Documento generado por MACHI'}</Text>
      <Text
        style={baseStyles.footerText}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  )
}

export { Document, Page, Text, View, StyleSheet, C }
