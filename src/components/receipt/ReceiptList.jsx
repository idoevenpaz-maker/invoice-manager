import { useNavigate } from 'react-router-dom'
import { ReceiptCard } from './ReceiptCard'
import { EmptyState } from '../ui/EmptyState'

export function ReceiptList({ receipts }) {
  const navigate = useNavigate()

  if (receipts.length === 0) {
    return (
      <EmptyState
        icon="📄"
        title="אין קבלות עדיין"
        description="צור קבלה ראשונה"
        action={() => navigate('/receipts/new')}
        actionLabel="קבלה חדשה"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {receipts.map(r => (
        <ReceiptCard key={r.id} receipt={r} />
      ))}
    </div>
  )
}
