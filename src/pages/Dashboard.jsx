import { useNavigate } from 'react-router-dom'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { useReceiptStore } from '../store/useReceiptStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, formatDate, getDerivedStatus } from '../utils/formatters'
import { calcTotal, calcReceiptTotal } from '../utils/calculations'
import { useClientStore } from '../store/useClientStore'

function StatCard({ label, value, sub, color = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const invoices = useInvoiceStore(s => s.invoices)
  const receipts = useReceiptStore(s => s.receipts)
  const getClient = useClientStore(s => s.getById)

  const withTotals = invoices.map(inv => ({
    ...inv,
    derivedStatus: getDerivedStatus(inv),
    total: calcTotal(inv.lineItems, inv.taxRate, inv.discountType, inv.discountValue).total,
  }))

  const paid = withTotals.filter(i => i.status === 'paid')
  const outstanding = withTotals.filter(i => ['sent', 'overdue'].includes(i.derivedStatus))
  const overdue = withTotals.filter(i => i.derivedStatus === 'overdue')

  const totalPaid = paid.reduce((s, i) => s + i.total, 0)
  const totalOutstanding = outstanding.reduce((s, i) => s + i.total, 0)

  const recentInvoices = [...invoices]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  const recentReceipts = [...receipts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  return (
    <PageWrapper
      title="לוח בקרה"
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={() => navigate('/receipts/new')}>+ קבלה חדשה</Button>
          <Button size="sm" onClick={() => navigate('/invoices/new')}>+ חשבונית חדשה</Button>
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="סה״כ חשבוניות" value={invoices.length} />
        <StatCard label="שולם" value={formatCurrency(totalPaid)} color="text-green-700" sub={`${paid.length} חשבוניות`} />
        <StatCard label="ממתין לתשלום" value={formatCurrency(totalOutstanding)} color="text-blue-700" sub={`${outstanding.length} חשבוניות`} />
        <StatCard label="באיחור" value={overdue.length} color={overdue.length > 0 ? 'text-red-600' : 'text-gray-900'} />
      </div>

      {/* Recent invoices */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>כל החשבוניות</Button>
          <h2 className="text-lg font-semibold text-gray-800">חשבוניות אחרונות</h2>
        </div>
        {recentInvoices.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">אין חשבוניות עדיין</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">מספר</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">לקוח</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">תאריך</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">סטטוס</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">סכום</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, i) => {
                  const client = getClient(inv.clientId)
                  const { total } = calcTotal(inv.lineItems, inv.taxRate, inv.discountType, inv.discountValue)
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className={`cursor-pointer hover:bg-gray-50 ${i < recentInvoices.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-end">{inv.number}</td>
                      <td className="px-4 py-3 text-gray-600 text-end">{client?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-end">{formatDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 text-end"><Badge status={getDerivedStatus(inv)} /></td>
                      <td className="px-4 py-3 font-mono font-semibold text-end">{formatCurrency(total, inv.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent receipts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/receipts')}>כל הקבלות</Button>
          <h2 className="text-lg font-semibold text-gray-800">קבלות אחרונות</h2>
        </div>
        {recentReceipts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">אין קבלות עדיין</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">מספר</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">לקוח</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">תאריך</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500">סכום</th>
                </tr>
              </thead>
              <tbody>
                {recentReceipts.map((r, i) => {
                  const client = getClient(r.clientId)
                  const total = calcReceiptTotal(r.items)
                  return (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/receipts/${r.id}`)}
                      className={`cursor-pointer hover:bg-gray-50 ${i < recentReceipts.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-end">{r.number}</td>
                      <td className="px-4 py-3 text-gray-600 text-end">{client?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-end">{formatDate(r.date)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-end">{formatCurrency(total, r.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
