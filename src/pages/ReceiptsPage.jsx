import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReceiptStore } from '../store/useReceiptStore'
import { useClientStore } from '../store/useClientStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ReceiptList } from '../components/receipt/ReceiptList'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function ReceiptsPage() {
  const navigate = useNavigate()
  const receipts = useReceiptStore(s => s.receipts)
  const getClient = useClientStore(s => s.getById)
  const [search, setSearch] = useState('')

  const filtered = receipts
    .filter(r => {
      if (!search) return true
      const client = getClient(r.clientId)
      const q = search.toLowerCase()
      return (
        r.number.toLowerCase().includes(q) ||
        (client?.name || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <PageWrapper
      title="קבלות"
      actions={<Button onClick={() => navigate('/receipts/new')}>+ קבלה חדשה</Button>}
    >
      <div className="mb-6">
        <Input
          placeholder="חיפוש לפי לקוח או מספר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <ReceiptList receipts={filtered} />
    </PageWrapper>
  )
}
