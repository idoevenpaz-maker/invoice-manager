import { useEffect } from 'react'
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useInvoiceStore } from './store/useInvoiceStore'
import { useReceiptStore } from './store/useReceiptStore'
import { useClientStore } from './store/useClientStore'
import { useSettingsStore } from './store/useSettingsStore'
import { LoginScreen } from './components/auth/LoginScreen'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { InvoicesPage } from './pages/InvoicesPage'
import { InvoiceDetailPage } from './pages/InvoiceDetailPage'
import { ReceiptsPage } from './pages/ReceiptsPage'
import { ReceiptDetailPage } from './pages/ReceiptDetailPage'
import { ClientsPage } from './pages/ClientsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const { user, login, logout, loading } = useAuth()

  const initInvoices  = useInvoiceStore(s => s.init)
  const initReceipts  = useReceiptStore(s => s.init)
  const initClients   = useClientStore(s => s.init)
  const initSettings  = useSettingsStore(s => s.init)

  // Init / cleanup all stores when auth changes
  useEffect(() => {
    const uid = user?.uid ?? null
    initSettings(uid)
    initInvoices(uid)
    initReceipts(uid)
    initClients(uid)
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">טוען...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={login} />
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<InvoiceDetailPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/receipts" element={<ReceiptsPage />} />
            <Route path="/receipts/new" element={<ReceiptDetailPage />} />
            <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <Sidebar onLogout={logout} user={user} />
      </div>
    </BrowserRouter>
  )
}
