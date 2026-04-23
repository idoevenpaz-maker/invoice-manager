import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReceiptStore } from '../store/useReceiptStore'
import { useClientStore } from '../store/useClientStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ReceiptList } from '../components/receipt/ReceiptList'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ExportModal } from '../components/ui/ExportModal'
import { exportReceiptsToCsv } from '../utils/exportCsv'

export function ReceiptsPage() {
  const navigate  = useNavigate()
  const receipts  = useReceiptStore(s => s.receipts)
  const deleteReceipt = useReceiptStore(s => s.deleteReceipt)
  const clients   = useClientStore(s => s.clients)
  const getClient = useClientStore(s => s.getById)

  const [search, setSearch]       = useState('')
  const [exportOpen, setExportOpen] = useState(false)

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
      actions={
        <>
          <Button variant="secondary" onClick={() => setExportOpen(true)}>📊 ייצוא ל-Sheets</Button>
          <Button onClick={() => navigate('/receipts/new')}>+ קבלה חדשה</Button>
        </>
      }
    >
      <div className="mb-6">
        <Input
          placeholder="חיפוש לפי לקוח או מספר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      <ReceiptList receipts={filtered} onDelete={deleteReceipt} />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="ייצוא קבלות ל-Google Sheets"
        onExport={(from, to) => exportReceiptsToCsv(receipts, clients, from, to)}
      />
    </PageWrapper>
  )
}
