'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Mail, Plus, RefreshCw, Send } from 'lucide-react'

interface EReceipt {
  id: string
  receiptNumber: string
  transactionId: string | null
  customerEmail: string | null
  customerPhone: string | null
  deliveryMethod: string
  status: string
  storeName: string | null
  subtotal: number
  tax: number
  total: number
  paymentMethod: string | null
  sentAt: string | null
  deliveredAt: string | null
  createdAt: string
}

const TABS = ['all', 'pending', 'sent', 'delivered', 'failed']

function MethodBadge({ method }: { method: string }) {
  const cfg: Record<string, string> = {
    email: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    sms: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'qr-code': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    'app-push': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  }
  return <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${cfg[method] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>{method}</span>
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    sent: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/15 text-red-400 border-red-500/20',
    'opted-out': 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  }
  return <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${cfg[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>{status}</span>
}

export default function EReceiptsPage() {
  const [receipts, setReceipts] = useState<EReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [resending, setResending] = useState<string | null>(null)
  const [form, setForm] = useState({
    transactionId: '', customerEmail: '', customerPhone: '',
    deliveryMethod: 'email', storeName: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = tab !== 'all' ? `?status=${tab}` : ''
    const res = await fetch(`/api/fiscal/receipts${params}`)
    const data = await res.json()
    setReceipts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  const handleResend = async (id: string) => {
    setResending(id)
    await fetch(`/api/fiscal/receipts/${id}/resend`, { method: 'POST' })
    await load()
    setResending(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/fiscal/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: form.transactionId || null,
        customerEmail: form.customerEmail || null,
        customerPhone: form.customerPhone || null,
        deliveryMethod: form.deliveryMethod,
        storeName: form.storeName || null,
      }),
    })
    await load()
    setShowForm(false)
    setForm({ transactionId: '', customerEmail: '', customerPhone: '', deliveryMethod: 'email', storeName: '' })
    setSaving(false)
  }

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const sentToday = receipts.filter(r => r.sentAt && new Date(r.sentAt) >= todayStart).length
  const delivered = receipts.filter(r => r.status === 'delivered').length
  const deliveryRate = receipts.length > 0 ? Math.round((delivered / receipts.length) * 100) : 0
  const failed = receipts.filter(r => r.status === 'failed').length
  const optedOut = receipts.filter(r => r.status === 'opted-out').length

  const fmt = (d: string | null) => d ? new Date(d).toLocaleString() : '—'
  const fmtCur = (n: number) => `$${n.toFixed(2)}`

  return (
    <>
      <TopBar title="Electronic Receipts" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Electronic Receipts</h2>
            <p className="text-xs text-zinc-500">{receipts.length} receipt(s)</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New E-Receipt
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-zinc-100">{sentToday}</p>
            <p className="text-xs text-zinc-500 mt-1">Sent Today</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-400">{deliveryRate}%</p>
            <p className="text-xs text-zinc-500 mt-1">Delivery Rate</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className={`text-2xl font-bold ${failed > 0 ? 'text-red-400' : 'text-zinc-100'}`}>{failed}</p>
            <p className="text-xs text-zinc-500 mt-1">Failed</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-zinc-400">{optedOut}</p>
            <p className="text-xs text-zinc-500 mt-1">Opted Out</p>
          </div>
        </div>

        {/* New Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">New Electronic Receipt</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Transaction ID</label>
                <input value={form.transactionId} onChange={e => setForm(p => ({ ...p, transactionId: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="ORD-123456" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Delivery Method</label>
                <select value={form.deliveryMethod} onChange={e => setForm(p => ({ ...p, deliveryMethod: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="qr-code">QR Code</option>
                  <option value="app-push">App Push</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Customer Email</label>
                <input type="email" value={form.customerEmail} onChange={e => setForm(p => ({ ...p, customerEmail: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="customer@email.com" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Customer Phone</label>
                <input value={form.customerPhone} onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Store Name</label>
                <input value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Main Street Store" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Creating...' : 'Create Receipt'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-800">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'text-blue-400 border-blue-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-zinc-600 text-sm">Loading receipts...</div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No e-receipts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-600 uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Receipt #</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Method</th>
                  <th className="text-left pb-3 font-medium">Store</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Sent</th>
                  <th className="text-left pb-3 font-medium">Delivered</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {receipts.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-900/40">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{r.receiptNumber}</td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-zinc-300">{r.customerEmail ?? r.customerPhone ?? '—'}</p>
                    </td>
                    <td className="py-3 pr-4"><MethodBadge method={r.deliveryMethod} /></td>
                    <td className="py-3 pr-4 text-xs text-zinc-400">{r.storeName ?? '—'}</td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{fmtCur(r.total)}</td>
                    <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">{fmt(r.sentAt)}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">{fmt(r.deliveredAt)}</td>
                    <td className="py-3 text-right">
                      {(r.status === 'failed' || r.status === 'pending') && (
                        <button onClick={() => handleResend(r.id)} disabled={resending === r.id}
                          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors ml-auto">
                          {resending === r.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {resending === r.id ? 'Queuing...' : 'Resend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
