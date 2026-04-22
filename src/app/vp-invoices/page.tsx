'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Receipt, Clock, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react'

type Invoice = {
  id: string; invoiceNumber: string; invoiceDate: string; dueDate: string | null
  total: number; paidAmount: number; status: string
  vendor: { id: string; name: string; vendorNumber: string }
  po: { id: string; poNumber: string } | null
}

const TABS = ['all','under-review','received','approved','disputed','paid','partial-paid']

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    received:     'bg-zinc-700/40 text-zinc-300',
    'under-review':'bg-blue-500/15 text-blue-400',
    approved:     'bg-emerald-500/15 text-emerald-400',
    disputed:     'bg-red-500/15 text-red-400',
    paid:         'bg-emerald-600/20 text-emerald-300',
    'partial-paid':'bg-amber-500/15 text-amber-400',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${map[s] ?? 'text-zinc-400'}`}>
      {s.replace(/-/g,' ')}
    </span>
  )
}

function AgingBadge({ dueDate, status }: { dueDate: string | null; status: string }) {
  if (!dueDate || status === 'paid') return <span className="text-zinc-600 text-xs">—</span>
  const due  = new Date(dueDate)
  const now  = new Date()
  const diff = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0)  return <span className="text-xs font-medium text-red-400">{Math.abs(diff)}d overdue</span>
  if (diff <= 7) return <span className="text-xs font-medium text-amber-400">Due in {diff}d</span>
  return <span className="text-xs text-emerald-400">Due in {diff}d</span>
}

export default function VpInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]  = useState(true)
  const [tab, setTab]          = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab !== 'all') params.set('status', tab)
    const res = await fetch(`/api/vp-invoices?${params}`)
    setInvoices(await res.json())
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  const now = new Date()
  const pendingApproval = invoices.filter(i => ['received','under-review'].includes(i.status)).length
  const disputed        = invoices.filter(i => i.status === 'disputed').length
  const dueThisWeek     = invoices.filter(i => {
    if (!i.dueDate || i.status === 'paid') return false
    const d = new Date(i.dueDate)
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }).length
  const outstanding = invoices
    .filter(i => i.status !== 'paid')
    .reduce((s, i) => s + (i.total - i.paidAmount), 0)

  async function approve(id: string) {
    const approvedBy = prompt('Approved by:') ?? 'Admin'
    await fetch(`/api/vp-invoices/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy }),
    })
    load()
  }

  async function dispute(id: string) {
    const reason = prompt('Dispute reason:')
    if (!reason) return
    await fetch(`/api/vp-invoices/${id}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    load()
  }

  async function pay(id: string, total: number, paid: number) {
    const amt = prompt(`Amount to pay (balance: ${formatCurrency(total - paid)}):`)
    if (!amt) return
    const method = prompt('Payment method (ACH/Check/Wire):') ?? 'ACH'
    const ref    = prompt('Payment reference:') ?? ''
    await fetch(`/api/vp-invoices/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amt), method, ref }),
    })
    load()
  }

  return (
    <>
      <TopBar title="Vendor Invoices" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Pending Approval</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{pendingApproval}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Disputed</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{disputed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Due This Week</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{dueThisWeek}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Outstanding</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(outstanding)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-800 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors whitespace-nowrap ${
                tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >{t.replace(/-/g,' ')}</button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-zinc-600">
              <Receipt className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No invoices found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Invoice #</th>
                  <th className="text-left pb-3 font-medium">Vendor</th>
                  <th className="text-left pb-3 font-medium">PO #</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Due</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-right pb-3 font-medium">Paid</th>
                  <th className="text-right pb-3 font-medium">Balance</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-center pb-3 font-medium">Aging</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {invoices.map(inv => {
                  const balance = inv.total - inv.paidAmount
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-900/30">
                      <td className="py-3 pr-3 font-mono text-xs text-zinc-300">
                        <Link href={`/vp-invoices/${inv.id}`} className="hover:text-blue-400">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="py-3 pr-3">
                        <Link href={`/vp-vendors/${inv.vendor.id}`} className="text-zinc-100 hover:text-blue-400 text-sm">{inv.vendor.name}</Link>
                        <div className="text-xs text-zinc-500">{inv.vendor.vendorNumber}</div>
                      </td>
                      <td className="py-3 pr-3 font-mono text-xs text-zinc-500">
                        {inv.po ? <Link href={`/vp-pos/${inv.po.id}`} className="hover:text-blue-400">{inv.po.poNumber}</Link> : '—'}
                      </td>
                      <td className="py-3 pr-3 text-zinc-400 text-xs">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td className="py-3 pr-3 text-zinc-400 text-xs">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold text-zinc-100">{formatCurrency(inv.total)}</td>
                      <td className="py-3 pr-3 text-right text-emerald-400">{formatCurrency(inv.paidAmount)}</td>
                      <td className={`py-3 pr-3 text-right font-semibold ${balance > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-3 pr-3 text-center"><StatusBadge s={inv.status} /></td>
                      <td className="py-3 pr-3 text-center">
                        <AgingBadge dueDate={inv.dueDate} status={inv.status} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {['received','under-review'].includes(inv.status) && (
                            <button onClick={() => approve(inv.id)} className="text-xs text-emerald-400 hover:text-emerald-300">Approve</button>
                          )}
                          {['received','under-review','approved'].includes(inv.status) && (
                            <button onClick={() => dispute(inv.id)} className="text-xs text-red-400 hover:text-red-300">Dispute</button>
                          )}
                          {['approved'].includes(inv.status) && (
                            <button onClick={() => pay(inv.id, inv.total, inv.paidAmount)} className="text-xs text-blue-400 hover:text-blue-300">Pay</button>
                          )}
                          <Link href={`/vp-invoices/${inv.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
