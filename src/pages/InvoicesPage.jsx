import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { useClientStore } from '../store/useClientStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { InvoiceList } from '../components/invoice/InvoiceList'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ExportModal } from '../components/ui/ExportModal'
import { getDerivedStatus } from '../utils/formatters'
import { exportInvoicesToCsv } from '../utils/exportCsv'

export function InvoicesPage() {
  const navigate = useNavigate()
  const invoices = useInvoiceStore(s => s.invoices)
  const deleteInvoice = useInvoiceStore(s => s.deleteInvoice)
  const clients  = useClientStore(s => s.clients)
  const getClient = useClientStore(s => s.getById)

  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [exportOpen, setExportOpen] = useState(false)

  const filtered = invoices
    .filter(inv => {
      if (statusFilter !== 'all' && getDerivedStatus(inv) !== statusFilter) return false
      if (search) {
        const client = getClient(inv.clientId)
        const q = search.toLowerCase()
        return (
          inv.number.toLowerCase().includes(q) ||
          (client?.name || '').toLowerCase().includes(q) ||
          (client?.company || '').toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <PageWrapper
      title="חשבוניות"
      actions={
        <>
          <Button variant="secondary" onClick={() => setExportOpen(true)}>📊 ייצוא ל-Sheets</Button>
          <Button onClick={() => navigate('/invoices/new')}>+ חשבונית חדשה</Button>
        </>
      }
    >
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="חיפוש לפי לקוח או מספר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40">
          <option value="all">כל הסטטוסים</option>
          <option value="draft">טיוטה</option>
          <option value="sent">נשלח</option>
          <option value="paid">שולם</option>
          <option value="overdue">באיחור</option>
          <option value="cancelled">בוטל</option>
        </Select>
      </div>

      <InvoiceList invoices={filtered} onDelete={deleteInvoice} />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="ייצוא חשבוניות ל-Google Sheets"
        onExport={(from, to) => exportInvoicesToCsv(invoices, clients, from, to)}
      />
    </PageWrapper>
  )
}
