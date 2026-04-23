import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { formatCurrency, formatDate, getDerivedStatus } from '../../utils/formatters'
import { calcTotal } from '../../utils/calculations'
import { useClientStore } from '../../store/useClientStore'

export function InvoiceCard({ invoice, onDelete }) {
  const navigate = useNavigate()
  const getClient = useClientStore(s => s.getById)
  const client = getClient(invoice.clientId)
  const derivedStatus = getDerivedStatus(invoice)
  const { total } = calcTotal(invoice.lineItems, invoice.taxRate, invoice.discountType, invoice.discountValue)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div
        onClick={() => navigate(`/invoices/${invoice.id}`)}
        className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-brand-500 transition-all"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-semibold text-gray-800">{invoice.number}</span>
          <Badge status={derivedStatus} />
        </div>

        <div className="text-base font-bold text-gray-900 mb-1 text-start">
          {client ? client.name : <span className="text-gray-400 text-sm">ללא לקוח</span>}
        </div>
        {client?.company && (
          <div className="text-sm text-gray-500 mb-2 text-start">{client.company}</div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-lg font-bold font-mono text-brand-500">
            {formatCurrency(total, invoice.currency)}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">{formatDate(invoice.issueDate)}</div>
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); setShowConfirm(true) }}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                title="מחק"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); onDelete(invoice.id) }}
        title="מחיקת חשבונית"
        message={`האם למחוק את חשבונית ${invoice.number}? פעולה זו אינה ניתנת לביטול.`}
      />
    </>
  )
}
