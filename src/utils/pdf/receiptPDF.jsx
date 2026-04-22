import React from 'react'
import {
  Document, Page, View, Text, Image, StyleSheet
} from '@react-pdf/renderer'
import { calcReceiptTotal } from '../calculations'
import { formatCurrency, formatDate } from '../formatters'
import { PAYMENT_METHODS } from '../../constants'

const C = {
  navy:    '#1e3a5f',
  gray50:  '#f9fafb',
  gray100: '#f3f4f6',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',
  white:   '#ffffff',
}

const s = StyleSheet.create({
  page:         { fontFamily: 'NotoSansHebrew', fontSize: 10, color: C.gray900, padding: 40, backgroundColor: C.white },
  header:       { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logo:         { width: 80, height: 80, objectFit: 'contain' },
  businessBlock:{ alignItems: 'flex-end' },
  businessName: { fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 },
  businessSub:  { fontSize: 9, color: C.gray500, textAlign: 'right', lineHeight: 1.5 },
  divider:      { borderBottomWidth: 2, borderBottomColor: C.navy, marginBottom: 20 },
  titleRow:     { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  docTitle:     { fontSize: 22, fontWeight: 700, color: C.navy },
  docNumber:    { fontSize: 12, color: C.gray500 },
  metaRow:      { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 24 },
  metaBlock:    { alignItems: 'flex-end' },
  metaLabel:    { fontSize: 8, color: C.gray500, marginBottom: 2 },
  metaValue:    { fontSize: 10, color: C.gray900 },
  tableHeader:  { flexDirection: 'row-reverse', backgroundColor: C.navy, padding: '6 8', borderRadius: 3, marginBottom: 2 },
  tableRow:     { flexDirection: 'row-reverse', padding: '5 8', borderBottomWidth: 1, borderBottomColor: C.gray100 },
  tableRowAlt:  { backgroundColor: C.gray50 },
  colDesc:      { flex: 4, textAlign: 'right' },
  colAmount:    { flex: 1.5, textAlign: 'left' },
  thText:       { color: C.white, fontSize: 9, fontWeight: 700 },
  tdText:       { fontSize: 9, color: C.gray700 },
  totalRow:     { flexDirection: 'row-reverse', justifyContent: 'space-between', width: 200, borderTopWidth: 1.5, borderTopColor: C.navy, paddingTop: 6, marginTop: 8 },
  totalText:    { fontSize: 11, fontWeight: 700, color: C.navy },
  paymentBox:   { marginTop: 20, padding: 12, backgroundColor: C.gray50, borderRadius: 4 },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: C.navy, marginBottom: 6 },
  paymentText:  { fontSize: 9, color: C.gray700, lineHeight: 1.6 },
  thankYou:     { marginTop: 28, textAlign: 'center', fontSize: 11, color: C.navy, fontWeight: 700 },
  footer:       { position: 'absolute', bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 8 },
  footerText:   { fontSize: 8, color: C.gray500, textAlign: 'center' },
})

export function ReceiptPDF({ receipt, client, settings }) {
  const total = calcReceiptTotal(receipt.items)
  const fmt = v => formatCurrency(v, receipt.currency)
  const paymentLabel = PAYMENT_METHODS.find(m => m.value === receipt.paymentMethod)?.label || receipt.paymentMethod

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          {settings.logo
            ? <Image style={s.logo} src={settings.logo} />
            : <View style={{ width: 80 }} />}
          <View style={s.businessBlock}>
            <Text style={s.businessName}>{settings.businessName || 'שם העסק'}</Text>
            {settings.taxId && <Text style={s.businessSub}>מס' עוסק: {settings.taxId}</Text>}
            {settings.phone && <Text style={s.businessSub}>{settings.phone}</Text>}
            {settings.email && <Text style={s.businessSub}>{settings.email}</Text>}
            {settings.address?.line1 && <Text style={s.businessSub}>{settings.address.line1}</Text>}
          </View>
        </View>

        <View style={s.divider} />

        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.docNumber}>{receipt.number}</Text>
          <Text style={s.docTitle}>קבלה</Text>
        </View>

        {/* Meta */}
        <View style={s.metaRow}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>תאריך</Text>
            <Text style={s.metaValue}>{formatDate(receipt.date)}</Text>
          </View>
          {client && (
            <View style={s.metaBlock}>
              <Text style={s.metaLabel}>התקבל מ</Text>
              <Text style={[s.metaValue, { fontWeight: 700 }]}>{client.name}</Text>
              {client.company && <Text style={s.metaValue}>{client.company}</Text>}
            </View>
          )}
        </View>

        {/* Items table */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colDesc]}>תיאור</Text>
          <Text style={[s.thText, s.colAmount]}>סכום</Text>
        </View>
        {receipt.items.map((item, i) => (
          <View key={item.id} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.tdText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdText, s.colAmount]}>{fmt(item.amount)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={s.totalRow}>
            <Text style={s.totalText}>{fmt(total)}</Text>
            <Text style={s.totalText}>סה"כ</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={s.paymentBox}>
          <Text style={s.sectionTitle}>אמצעי תשלום</Text>
          <Text style={s.paymentText}>{paymentLabel}</Text>
          {receipt.paymentReference && (
            <Text style={s.paymentText}>אסמכתא: {receipt.paymentReference}</Text>
          )}
        </View>

        {/* Notes */}
        {receipt.notes && (
          <Text style={[s.paymentText, { marginTop: 12 }]}>{receipt.notes}</Text>
        )}

        {settings.invoiceFooter && (
          <View style={s.footer}>
            <Text style={s.footerText}>{settings.invoiceFooter}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
