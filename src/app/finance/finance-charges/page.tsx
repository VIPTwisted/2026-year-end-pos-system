'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, RefreshCw, ChevronRight, AlertCircle, Printer, Send } from 'lucide-react'

interface FinanceChargeMemo {
  id: string
  memoNo: string
  customerNo: string | null
  customerName: string | null
  postingDate: string | null
  status: string
  amount: number
  interestAmount: number
  financeChargeFee: number
  currency: string
  createdAt: string
}

const STATUS_CLS: Record<string, string> = {
  Draft: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
  Issued: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Canceled: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function FinanceChargesPage() {
  const [memos, setMemos] = useState<FinanceChargeMemo[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    fetch(`/api/finance/finance-charges?${p}`)
      .then(r => r.json())
      .then(d => setMemos(Array.isArray(d) ? d : []))
      .catch(() => setMemos([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const totalAmount = memos.reduce((s, m) => s + Number(m.amount), 0)
  const draftCount = memos.filter(m => m.status === 'Draft').length
  const issuedCount = memos.filter(m => m.status === 'Issued').length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Finance Charge Memos"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link href="/finance/finance-charges/new"
              className="flex items-center gap-1.5 h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />New
            </Link>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Draft</div>
            <div className="text-2xl font-bold text-zinc-300 tabular-nums">{draftCount}</div>
            <div className="text-xs text-zinc-500 mt-1">awaiting issue</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Issued</div>
            <div className="text-2xl font-bold text-blue-400 tabular-nums">{issuedCount}</div>
            <div className="text-xs text-zinc-500 mt-1">sent to customers</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Amount</div>
            <div className="text-xl font-bold text-red-400 tabular-nums">{fmt(totalAmount)}</div>
            <div className="text-xs text-zinc-500 mt-1">finance charges outstanding</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['', 'Draft', 'Issued', 'Canceled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`h-7 px-3 rounded text-[11px] font-medium transition-colors border ${
                statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : memos.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-600">
              <AlertCircle className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm mb-3">No finance charge memos found</p>
              <Link href="/finance/finance-charges/new" className="text-xs text-blue-400 hover:text-blue-300">Create first memo →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['No.', 'Customer No.', 'Name', 'Posting Date', 'Status', 'Amount', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {memos.map(m => (
                    <tr key={m.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/finance/finance-charges/${m.id}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300">
                          {m.memoNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{m.customerNo || '—'}</td>
                      <td className="px-4 py-3 text-sm text-zinc-200 font-medium">{m.customerName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(m.postingDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLS[m.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-sm font-bold text-red-400">{fmt(Number(m.amount))}</td>
                      <td className="px-4 py-3">
                        <Link href={`/finance/finance-charges/${m.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">{memos.length} record{memos.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  )
}
