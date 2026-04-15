import { useState } from 'react'
import { useClientStore } from '../store/useClientStore'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ClientList } from '../components/client/ClientList'
import { ClientForm } from '../components/client/ClientForm'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function ClientsPage() {
  const clients = useClientStore(s => s.clients)
  const addClient = useClientStore(s => s.addClient)
  const updateClient = useClientStore(s => s.updateClient)
  const deleteClient = useClientStore(s => s.deleteClient)
  const invoices = useInvoiceStore(s => s.invoices)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleSave = (formData) => {
    if (editingClient) {
      updateClient(editingClient.id, formData)
    } else {
      addClient(formData)
    }
    setModalOpen(false)
    setEditingClient(null)
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setModalOpen(true)
  }

  const handleNew = () => {
    setEditingClient(null)
    setModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    const clientInvoices = invoices.filter(inv => inv.clientId === deleteTarget.id)
    if (clientInvoices.length > 0) {
      alert(`ללקוח זה ${clientInvoices.length} חשבוניות. לא ניתן למחוק לקוח עם חשבוניות קיימות.`)
      setDeleteTarget(null)
      return
    }
    deleteClient(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <PageWrapper
      title="לקוחות"
      actions={<Button onClick={handleNew}>+ לקוח חדש</Button>}
    >
      <ClientList
        clients={clients}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onNew={handleNew}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null) }}
        title={editingClient ? 'עריכת לקוח' : 'לקוח חדש'}
        size="lg"
      >
        <ClientForm
          initial={editingClient || {}}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditingClient(null) }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="מחיקת לקוח"
        message={`האם למחוק את ${deleteTarget?.name}?`}
        confirmLabel="מחק"
      />
    </PageWrapper>
  )
}
