import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calcReceiptTotal } from '../../utils/calculations'
import { useClientStore } from '../../store/useClientStore'
import { PAYMENT_METHODS } from '../../constants'

export function ReceiptCard({ receipt }) {
  const navigate = useNavigate()
  const getClient = useClientStore(s => s.getById)
  const client = getClient(receipt.clientId)
  const total = calcReceiptTotal(receipt.items)
  const paymentLabel = PAYMENT_METHODS.find(m => m.value === receipt.paymentMethod)?.label || receipt.paymentMethod

  return (
    <div
      onClick={() => navigate(`/receipts/${receipt.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-brand-500 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          קבלה
        </span>
        <span className="text-sm font-semibold text-gray-800">{receipt.number}</span>
      </div>

      <div className="text-base font-bold text-gray-900 mb-1 text-end">
        {client ? client.name : <span className="text-gray-400 text-sm">ללא לקוח</span>}
      </div>
      <div className="text-sm text-gray-500 text-end">{paymentLabel}</div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-400">{formatDate(receipt.date)}</div>
        <div className="text-lg font-bold font-mono text-brand-500">
          {formatCurrency(total, receipt.currency)}
        </div>
      </div>
    </div>
  )
}
