'use client'

// TODO: Add RebateAgreement model to Prisma schema when ready.
// Static mock data used until schema is defined.

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronRight, DollarSign, Calendar, ArrowLeft,
  CheckCircle, Clock, AlertCircle, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RebateAgreement {
  id: string
  name: string
  party: string
  partyType: 'vendor' | 'customer'
  type: 'vendor-funded' | 'customer-earned'
  rebatePct: number
  threshold: number
  accrued: number
  claimed: number
  status: 'active' | 'pending' | 'expired' | 'closed'
  startDate: string
  endDate: string
  description: string
}

interface AccrualEntry {
  id: string
  date: string
  invoiceRef: string
  invoiceAmount: number
  rebateAmount: number
  type: 'accrual' | 'claim' | 'reversal'
}

const MOCK_AGREEMENTS: Record<string, RebateAgreement> = {
  r001: {
    id: 'r001',
    name: 'Q2 Vendor Volume Rebate',
    party: 'Apex Electronics Inc.',
    partyType: 'vendor',
    type: 'vendor-funded',
    rebatePct: 3.5,
    threshold: 50000,
    accrued: 4312.50,
    claimed: 1750.00,
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    description: 'Volume-based quarterly rebate from Apex Electronics for reaching $50K spend threshold.',
  },
  r002: {
    id: 'r002',
    name: 'Gold Customer Loyalty Rebate',
    party: 'MegaRetail Corp',
    partyType: 'customer',
    type: 'customer-earned',
    rebatePct: 2.0,
    threshold: 100000,
    accrued: 8750.00,
    claimed: 0,
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Annual loyalty rebate for Gold-tier customers who exceed $100K in purchases.',
  },
}

const MOCK_ACCRUALS: Record<string, AccrualEntry[]> = {
  r001: [
    { id: 'a1', date: '2026-01-15', invoiceRef: 'INV-2026-0042', invoiceAmount: 18500, rebateAmount: 647.50, type: 'accrual' },
    { id: 'a2', date: '2026-02-03', invoiceRef: 'INV-2026-0081', invoiceAmount: 22000, rebateAmount: 770.00, type: 'accrual' },
    { id: 'a3', date: '2026-02-28', invoiceRef: 'CLAIM-2026-001', invoiceAmount: 0,     rebateAmount: -1750.00, type: 'claim' },
    { id: 'a4', date: '2026-03-12', invoiceRef: 'INV-2026-0124', invoiceAmount: 14200, rebateAmount: 497.00, type: 'accrual' },
    { id: 'a5', date: '2026-04-01', invoiceRef: 'INV-2026-0175', invoiceAmount: 31500, rebateAmount: 1102.50, type: 'accrual' },
    { id: 'a6', date: '2026-04-18', invoiceRef: 'INV-2026-0201', invoiceAmount: 30000, rebateAmount: 1050.00, type: 'accrual' },
    { id: 'a7', date: '2026-04-20', invoiceRef: 'INV-2026-0210', invoiceAmount: 500,   rebateAmount: -17.50, type: 'reversal' },
  ],
  r002: [
    { id: 'b1', date: '2026-01-20', invoiceRef: 'PO-2026-0011', invoiceAmount: 42000, rebateAmount: 840.00, type: 'accrual' },
    { id: 'b2', date: '2026-02-14', invoiceRef: 'PO-2026-0039', invoiceAmount: 55000, rebateAmount: 1100.00, type: 'accrual' },
    { id: 'b3', date: '2026-03-05', invoiceRef: 'PO-2026-0067', invoiceAmount: 61000, rebateAmount: 1220.00, type: 'accrual' },
    { id: 'b4', date: '2026-04-10', invoiceRef: 'PO-2026-0102', invoiceAmount: 279500, rebateAmount: 5590.00, type: 'accrual' },
  ],
}

const STATUS_STYLE: Record<string, string> = {
  active:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  expired: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  closed:  'bg-zinc-700/20 text-zinc-500 border-zinc-700/30',
}

const ACCRUAL_STYLE: Record<string, string> = {
  accrual:  'text-emerald-400',
  claim:    'text-amber-400',
  reversal: 'text-red-400',
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RebateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  const agreement = MOCK_AGREEMENTS[id]
  const accruals   = MOCK_ACCRUALS[id] ?? []

  if (!agreement) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Agreement not found</p>
          <Link href="/rebates" className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">
            Back to Rebates
          </Link>
        </div>
      </div>
    )
  }

  const pendingBalance = agreement.accrued - agreement.claimed

  async function handleProcess(action: 'claim' | 'close') {
    setProcessing(true)
    // Stub: would POST to /api/rebates/${id}/process
    await new Promise(r => setTimeout(r, 900))
    setProcessing(false)
    if (action === 'close') router.push('/rebates')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/rebates" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Rebates
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <span className="text-zinc-100 font-medium">{agreement.name}</span>
      </div>

      {/* Header Card */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{agreement.name}</h1>
            <p className="text-zinc-400 text-sm mt-1">{agreement.description}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={cn('text-xs px-2.5 py-1 rounded-full border capitalize', STATUS_STYLE[agreement.status])}>
                {agreement.status}
              </span>
              <span className="text-xs text-zinc-500 capitalize">{agreement.type.replace('-', ' ')}</span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-500 capitalize">{agreement.partyType}: {agreement.party}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleProcess('claim')}
              disabled={processing || pendingBalance <= 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors',
                (processing || pendingBalance <= 0) && 'opacity-40 cursor-not-allowed'
              )}
            >
              <CheckCircle className="w-4 h-4" />
              {processing ? 'Processing...' : 'Process Claim'}
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Financials Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Rebate Rate</p>
            <p className="text-lg font-bold text-zinc-100 font-mono">{agreement.rebatePct.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Threshold</p>
            <p className="text-lg font-bold text-zinc-100 font-mono">{fmtMoney(agreement.threshold)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Total Accrued</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">{fmtMoney(agreement.accrued)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Pending Balance</p>
            <p className="text-lg font-bold text-amber-400 font-mono">{fmtMoney(pendingBalance)}</p>
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
          <Calendar className="w-3.5 h-3.5" />
          {fmtDate(agreement.startDate)} → {fmtDate(agreement.endDate)}
        </div>
      </div>

      {/* Accrual History */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
          <Clock className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-zinc-100">Accrual History</span>
          <span className="text-zinc-500 text-sm">({accruals.length} entries)</span>
        </div>
        {accruals.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No accrual entries yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Reference</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Invoice Amount</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Rebate Amount</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {accruals.map(entry => (
                  <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(entry.date)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">{entry.invoiceRef}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                      {entry.invoiceAmount !== 0 ? fmtMoney(entry.invoiceAmount) : '—'}
                    </td>
                    <td className={cn('px-4 py-3 text-right font-mono text-sm font-medium', ACCRUAL_STYLE[entry.type])}>
                      {entry.rebateAmount > 0 ? '+' : ''}{fmtMoney(entry.rebateAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border capitalize',
                        entry.type === 'accrual'  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        entry.type === 'claim'    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                      )}>
                        {entry.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
