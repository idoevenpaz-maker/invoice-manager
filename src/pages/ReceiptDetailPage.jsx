import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useReceiptStore } from '../store/useReceiptStore'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { useClientStore } from '../store/useClientStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { ReceiptForm } from '../components/receipt/ReceiptForm'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatCurrency, formatDate } from '../utils/formatters'
import { calcReceiptTotal, calcTotal } from '../utils/calculations'
import { PAYMENT_METHODS } from '../constants'
import { v4 as uuidv4 } from 'uuid'

export function ReceiptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isNew = !id

  const addReceipt = useReceiptStore(s => s.addReceipt)
  const updateReceipt = useReceiptStore(s => s.updateReceipt)
  const deleteReceipt = useReceiptStore(s => s.deleteReceipt)
  const getReceipt = useReceiptStore(s => s.getById)
  const updateInvoice = useInvoiceStore(s => s.updateInvoice)
  const getInvoice = useInvoiceStore(s => s.getById)
  const getClient = useClientStore(s => s.getById)
  const settings = useSettingsStore()

  const existingReceipt = id ? getReceipt(id) : null

  // Pre-fill from invoice if converting
  const fromInvoiceId = searchParams.get('fromInvoice')
  const sourceInvoice = fromInvoiceId ? getInvoice(fromInvoiceId) : null

  const initialOverrides = sourceInvoice ? {
    clientId: sourceInvoice.clientId,
    invoiceId: sourceInvoice.id,
    items: [{
      id: uuidv4(),
      description: `תשלום עבור חשבונית ${sourceInvoice.number}`,
      amount: calcTotal(sourceInvoice.lineItems, sourceInvoice.taxRate, sourceInvoice.discountType, sourceInvoice.discountValue).total,
    }],
  } : {}

  const [isEditing, setIsEditing] = useState(isNew)
  const [showDelete, setShowDelete] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  if (!isNew && !existingReceipt) {
    return (
      <PageWrapper title="קבלה לא נמצאה">
        <Button onClick={() => navigate('/receipts')}>חזרה לקבלות</Button>
      </PageWrapper>
    )
  }

  const receipt = existingReceipt

  const handleSave = (formData) => {
    if (isNew) {
      const created = addReceipt(formData)
      // Mark source invoice as paid if came from invoice
      if (fromInvoiceId) {
        updateInvoice(fromInvoiceId, { status: 'paid' })
      }
      navigate(`/receipts/${created.id}`, { replace: true })
    } else {
      updateReceipt(id, formData)
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    deleteReceipt(id)
    navigate('/receipts')
  }

  const handleDownloadPDF = async () => {
    const client = getClient(receipt.clientId)
    setPdfLoading(true)
    try {
      const [{ pdf }, { ReceiptPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../utils/pdf/receiptPDF'),
      ])
      const blob = await pdf(<ReceiptPDF receipt={receipt} client={client} settings={settings} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${receipt.number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
  }

  if (isNew || isEditing) {
    return (
      <PageWrapper title={isNew ? 'קבלה חדשה' : `עריכת ${receipt.number}`}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ReceiptForm
            initial={isNew ? initialOverrides : receipt}
            onSave={handleSave}
            onCancel={() => isNew ? navigate('/receipts') : setIsEditing(false)}
          />
        </div>
      </PageWrapper>
    )
  }

  // View mode
  const client = getClient(receipt.clientId)
  const total = calcReceiptTotal(receipt.items)
  const paymentLabel = PAYMENT_METHODS.find(m => m.value === receipt.paymentMethod)?.label || receipt.paymentMethod

  return (
    <PageWrapper
      title={receipt.number}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>הדפס</Button>
          <Button variant="secondary" size="sm" disabled={pdfLoading} onClick={handleDownloadPDF}>
            {pdfLoading ? 'מייצר...' : 'הורד PDF'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>ערוך</Button>
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>מחק</Button>
        </div>
      }
    >
      <div id="print-area" className="bg-white rounded-xl border border-gray-200 p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="text-end">
            <p className="text-xs text-gray-500">מס׳ קבלה</p>
            <p className="text-lg font-bold">{receipt.number}</p>
          </div>
          <div>
            {settings.logo && (
              <img src={settings.logo} alt="לוגו" className="h-16 object-contain mb-2" />
            )}
            <p className="font-bold text-xl text-brand-500">{settings.businessName || 'העסק שלי'}</p>
            {settings.taxId && <p className="text-sm text-gray-500">מס׳ עוסק: {settings.taxId}</p>}
          </div>
        </div>

        <div className="border-t-2 border-brand-500 mb-6" />

        {/* Date + client */}
        <div className="flex justify-between mb-8">
          {client && (
            <div className="text-end">
              <p className="text-xs text-gray-500 mb-1">התקבל מ</p>
              <p className="font-bold">{client.name}</p>
              {client.company && <p className="text-sm text-gray-600">{client.company}</p>}
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">תאריך</p>
            <p className="font-medium">{formatDate(receipt.date)}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-brand-500 text-white">
              <th className="px-3 py-2 text-end rounded-r-md">תיאור</th>
              <th className="px-3 py-2 text-end rounded-l-md">סכום</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="px-3 py-2 text-end">{item.description}</td>
                <td className="px-3 py-2 text-end font-mono">{formatCurrency(item.amount, receipt.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-start">
          <div className="border-t-2 border-brand-500 pt-2 w-48">
            <div className="flex justify-between">
              <span className="font-mono font-bold text-brand-500 text-lg">{formatCurrency(total, receipt.currency)}</span>
              <span className="font-bold text-brand-500 text-lg">סה"כ</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-brand-500 mb-1">אמצעי תשלום</p>
          <p className="text-sm text-gray-600">{paymentLabel}</p>
          {receipt.paymentReference && (
            <p className="text-sm text-gray-500">אסמכתא: {receipt.paymentReference}</p>
          )}
        </div>

        {receipt.notes && (
          <p className="mt-4 text-sm text-gray-500 whitespace-pre-line">{receipt.notes}</p>
        )}

        <p className="mt-8 text-center font-semibold text-brand-500">תודה על העסקה!</p>

        {settings.invoiceFooter && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">{settings.invoiceFooter}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="מחיקת קבלה"
        message={`האם למחוק את קבלה ${receipt.number}? פעולה זו אינה ניתנת לביטול.`}
        confirmLabel="מחק"
      />
    </PageWrapper>
  )
}
