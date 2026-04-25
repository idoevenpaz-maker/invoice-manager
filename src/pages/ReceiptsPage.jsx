import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReceiptStore } from '../store/useReceiptStore'
import { useClientStore } from '../store/useClientStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ReceiptList } from '../components/receipt/ReceiptList'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ExportModal } from '../components/ui/ExportModal'
import { exportReceiptsToCsv } from '../utils/exportCsv'

export function ReceiptsPage() {
  const navigate = useNavigate()
  const receipts = useReceiptStore(s => s.receipts)
  const deleteReceipt = useReceiptStore(s => s.deleteReceipt)
  const clients = useClientStore(s => s.clients)
  const getClient = useClientStore(s => s.getById)

  const [search, setSearch] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const toggleOne = id => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleAll = () => {
    const allSelected = filtered.every(r => selected.has(r.id))
    setSelected(allSelected ? new Set() : new Set(filtered.map(r => r.id)))
  }

  const deleteSelected = () => {
    selected.forEach(id => deleteReceipt(id))
    setSelected(new Set())
    setConfirmDelete(false)
  }

  return (
    <PageWrapper
      title="קבלות"
      actions={
        <>
          {selected.size > 0 && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              מחק נבחרים ({selected.size})
            </Button>
          )}
          <Button variant="secondary" onClick={() => setExportOpen(true)}>📊 ייצוא ל-Sheets</Button>
          <Button onClick={() => navigate('/receipts/new')}>+ קבלה חדשה</Button>
        </>
      }
    >
      <div dir="rtl" className="mb-6">
        <Input
          placeholder="חיפוש לפי לקוח או מספר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      <ReceiptList
        receipts={filtered}
        selected={selected}
        onToggle={toggleOne}
        onToggleAll={toggleAll}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
        title="מחיקת קבלות"
        message={`האם למחוק ${selected.size} קבלות? פעולה זו אינה ניתנת לביטול.`}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="ייצוא קבלות ל-Google Sheets"
        onExport={(from, to) => exportReceiptsToCsv(receipts, clients, from, to)}
      />
    </PageWrapper>
  )
}
