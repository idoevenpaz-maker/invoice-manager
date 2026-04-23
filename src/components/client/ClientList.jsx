import { useInvoiceStore } from '../../store/useInvoiceStore'
import { useReceiptStore } from '../../store/useReceiptStore'
import { formatCurrency } from '../../utils/formatters'
import { calcTotal } from '../../utils/calculations'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'

export function ClientList({ clients, onEdit, onDelete, onNew, onNewInvoice, onNewReceipt }) {
  const invoices = useInvoiceStore(s => s.invoices)
  const receipts = useReceiptStore(s => s.receipts)

  if (clients.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="אין לקוחות עדיין"
        description="הוסף לקוח ראשון"
        action={onNew}
        actionLabel="לקוח חדש"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {clients.map(client => {
        const clientInvoices = invoices.filter(inv => inv.clientId === client.id)
        const clientReceipts = receipts.filter(r => r.clientId === client.id)
        const totalBilled = clientInvoices.reduce((sum, inv) => {
          const { total } = calcTotal(inv.lineItems, inv.taxRate, inv.discountType, inv.discountValue)
          return sum + total
        }, 0)

        return (
          <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="text-start">
                <div className="font-bold text-gray-900">{client.name}</div>
                {client.company && <div className="text-sm text-gray-500">{client.company}</div>}
                {client.taxId && <div className="text-xs text-gray-400">מס' עוסק: {client.taxId}</div>}
                {client.email && <div className="text-xs text-gray-400">{client.email}</div>}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Button size="sm" variant="secondary" onClick={() => onEdit(client)}>ערוך</Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(client)}>מחק</Button>
                {onNewInvoice && (
                  <Button size="sm" variant="secondary" onClick={() => onNewInvoice(client.id)}>+ חשבונית</Button>
                )}
                {onNewReceipt && (
                  <Button size="sm" variant="secondary" onClick={() => onNewReceipt(client.id)}>+ קבלה</Button>
                )}
              </div>
            </div>
            <div className="flex gap-6 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 justify-end">
              <span>{clientReceipts.length} קבלות</span>
              <span>{clientInvoices.length} חשבוניות</span>
              <span className="font-mono font-semibold text-gray-700">
                {formatCurrency(totalBilled, 'ILS')}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
