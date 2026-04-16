import { calcTotal, calcReceiptTotal } from './calculations'
import { formatCurrency, formatDate } from './formatters'
import { INVOICE_STATUSES, PAYMENT_METHODS } from '../constants'

const css = `
  body { font-family: Arial, sans-serif; direction: rtl; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
  .wrap { max-width: 620px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .header { background: #1e3a5f; color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: flex-start; }
  .biz-name { font-size: 22px; font-weight: 700; }
  .biz-sub { font-size: 12px; color: #bfdbfe; margin-top: 4px; }
  .doc-title { font-size: 28px; font-weight: 700; text-align: left; }
  .doc-num { font-size: 13px; color: #bfdbfe; text-align: left; }
  .body { padding: 28px 32px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 24px; }
  .meta-block label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 2px; }
  .meta-block span { font-size: 14px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
  thead tr { background: #1e3a5f; color: #fff; }
  thead th { padding: 8px 12px; text-align: right; }
  tbody tr:nth-child(even) { background: #f3f4f6; }
  tbody td { padding: 8px 12px; }
  .totals { margin-right: auto; width: 220px; }
  .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #374151; }
  .totals-final { display: flex; justify-content: space-between; padding: 8px 0 0; border-top: 2px solid #1e3a5f; font-size: 16px; font-weight: 700; color: #1e3a5f; }
  .payment-box { background: #f3f4f6; border-radius: 8px; padding: 14px 16px; margin-top: 20px; font-size: 13px; }
  .payment-box label { font-size: 11px; font-weight: 700; color: #1e3a5f; display: block; margin-bottom: 6px; }
  .notes { margin-top: 16px; font-size: 13px; color: #6b7280; white-space: pre-line; }
  .footer { text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
`

export function buildInvoiceEmail(invoice, client, settings) {
  const { subtotal, discountAmount, taxAmount, total } = calcTotal(
    invoice.lineItems, invoice.taxRate, invoice.discountType, invoice.discountValue
  )
  const fmt = v => formatCurrency(v, invoice.currency)
  const statusLabel = INVOICE_STATUSES[invoice.status]?.label || invoice.status

  const itemRows = invoice.lineItems.map((item, i) => `
    <tr>
      <td>${item.description}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:left;font-family:monospace">${fmt(item.unitPrice)}</td>
      <td style="text-align:left;font-family:monospace;font-weight:600">${fmt(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('')

  const discountRow = discountAmount > 0
    ? `<div class="totals-row"><span>הנחה</span><span style="color:#dc2626">-${fmt(discountAmount)}</span></div>` : ''

  const taxRow = invoice.taxRate > 0
    ? `<div class="totals-row"><span>מע"מ (${invoice.taxRate}%)</span><span style="font-family:monospace">${fmt(taxAmount)}</span></div>` : ''

  const paymentBox = settings.paymentInfo
    ? `<div class="payment-box"><label>פרטי תשלום</label>${settings.paymentInfo.replace(/\n/g, '<br>')}</div>` : ''

  const notesBox = invoice.notes
    ? `<div class="notes"><strong>הערות:</strong><br>${invoice.notes}</div>` : ''

  const footerText = settings.invoiceFooter
    ? `<div class="footer">${settings.invoiceFooter}</div>` : ''

  const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><style>${css}</style></head>
<body><div class="wrap">
  <div class="header">
    <div>
      <div class="biz-name">${settings.businessName || ''}</div>
      ${settings.taxId ? `<div class="biz-sub">מס׳ עוסק: ${settings.taxId}</div>` : ''}
      ${settings.phone ? `<div class="biz-sub">${settings.phone}</div>` : ''}
    </div>
    <div>
      <div class="doc-title">חשבונית</div>
      <div class="doc-num">${invoice.number} · ${statusLabel}</div>
    </div>
  </div>
  <div class="body">
    <div class="meta">
      ${client ? `<div class="meta-block"><label>לכבוד</label><span>${client.name}</span>${client.company ? `<div style="font-size:12px;color:#6b7280">${client.company}</div>` : ''}</div>` : ''}
      <div>
        <div class="meta-block"><label>תאריך הנפקה</label><span>${formatDate(invoice.issueDate)}</span></div>
        ${invoice.dueDate ? `<div class="meta-block" style="margin-top:10px"><label>תאריך פירעון</label><span>${formatDate(invoice.dueDate)}</span></div>` : ''}
      </div>
    </div>
    <table>
      <thead><tr>
        <th>תיאור</th><th style="text-align:center">כמות</th>
        <th style="text-align:left">מחיר יחידה</th><th style="text-align:left">סה"כ</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="totals">
      <div class="totals-row"><span>סכום ביניים</span><span style="font-family:monospace">${fmt(subtotal)}</span></div>
      ${discountRow}${taxRow}
      <div class="totals-final"><span>סה"כ לתשלום</span><span style="font-family:monospace">${fmt(total)}</span></div>
    </div>
    ${paymentBox}${notesBox}
  </div>
  ${footerText}
</div></body></html>`

  return {
    html,
    subject: `חשבונית ${invoice.number} מאת ${settings.businessName || 'העסק'}`,
    toEmail: client?.email || '',
    toName: client?.name || '',
  }
}

export function buildReceiptEmail(receipt, client, settings) {
  const total = calcReceiptTotal(receipt.items)
  const fmt = v => formatCurrency(v, receipt.currency)
  const paymentLabel = PAYMENT_METHODS.find(m => m.value === receipt.paymentMethod)?.label || receipt.paymentMethod

  const itemRows = receipt.items.map(item => `
    <tr>
      <td>${item.description}</td>
      <td style="text-align:left;font-family:monospace;font-weight:600">${fmt(item.amount)}</td>
    </tr>
  `).join('')

  const footerText = settings.invoiceFooter
    ? `<div class="footer">${settings.invoiceFooter}</div>` : ''

  const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><style>${css}</style></head>
<body><div class="wrap">
  <div class="header">
    <div>
      <div class="biz-name">${settings.businessName || ''}</div>
      ${settings.taxId ? `<div class="biz-sub">מס׳ עוסק: ${settings.taxId}</div>` : ''}
    </div>
    <div>
      <div class="doc-title">קבלה</div>
      <div class="doc-num">${receipt.number}</div>
    </div>
  </div>
  <div class="body">
    <div class="meta">
      ${client ? `<div class="meta-block"><label>התקבל מ</label><span>${client.name}</span></div>` : ''}
      <div class="meta-block"><label>תאריך</label><span>${formatDate(receipt.date)}</span></div>
    </div>
    <table>
      <thead><tr><th>תיאור</th><th style="text-align:left">סכום</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="totals">
      <div class="totals-final"><span>סה"כ</span><span style="font-family:monospace">${fmt(total)}</span></div>
    </div>
    <div class="payment-box">
      <label>אמצעי תשלום</label>
      ${paymentLabel}${receipt.paymentReference ? ` · אסמכתא: ${receipt.paymentReference}` : ''}
    </div>
    ${receipt.notes ? `<div class="notes">${receipt.notes}</div>` : ''}
    <div style="text-align:center;margin-top:24px;font-size:15px;font-weight:700;color:#1e3a5f">תודה על העסקה!</div>
  </div>
  ${footerText}
</div></body></html>`

  return {
    html,
    subject: `קבלה ${receipt.number} מאת ${settings.businessName || 'העסק'}`,
    toEmail: client?.email || '',
    toName: client?.name || '',
  }
}
