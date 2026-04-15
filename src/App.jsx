import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { InvoicesPage } from './pages/InvoicesPage'
import { InvoiceDetailPage } from './pages/InvoiceDetailPage'
import { ReceiptsPage } from './pages/ReceiptsPage'
import { ReceiptDetailPage } from './pages/ReceiptDetailPage'
import { ClientsPage } from './pages/ClientsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
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
        <Sidebar />
      </div>
    </BrowserRouter>
  )
}
