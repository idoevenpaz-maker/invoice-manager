import { InvoiceCard } from './InvoiceCard'
import { EmptyState } from '../ui/EmptyState'
import { useNavigate } from 'react-router-dom'

export function InvoiceList({ invoices }) {
  const navigate = useNavigate()

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        title="אין חשבוניות עדיין"
        description="צור חשבונית ראשונה לעסק שלך"
        action={() => navigate('/invoices/new')}
        actionLabel="חשבונית חדשה"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {invoices.map(inv => (
        <InvoiceCard key={inv.id} invoice={inv} />
      ))}
    </div>
  )
}
