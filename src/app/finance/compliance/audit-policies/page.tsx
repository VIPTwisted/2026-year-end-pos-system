export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Shield, Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

// Static data until AuditPolicy model is added to Prisma schema
const MOCK_POLICIES = [
  {
    id: 'p1',
    name: 'High-Value Expense Threshold',
    ruleType: 'amount_threshold',
    entityType: 'expenses',
    threshold: 5000,
    isActive: true,
    lastRun: '2026-04-20',
    violations: 3,
  },
  {
    id: 'p2',
    name: 'Duplicate Invoice Detection',
    ruleType: 'duplicate_detection',
    entityType: 'invoices',
    threshold: null,
    isActive: true,
    lastRun: '2026-04-19',
    violations: 1,
  },
  {
    id: 'p3',
    name: 'PO Approval Bypass Alert',
    ruleType: 'approval_bypass',
    entityType: 'purchase_orders',
    threshold: null,
    isActive: true,
    lastRun: '2026-04-18',
    violations: 0,
  },
  {
    id: 'p4',
    name: 'Unusual Vendor Payment Pattern',
    ruleType: 'unusual_pattern',
    entityType: 'invoices',
    threshold: 10000,
    isActive: false,
    lastRun: '2026-04-01',
    violations: 0,
  },
]

const RULE_TYPE_LABELS: Record<string, string> = {
  amount_threshold: 'Amount Threshold',
  duplicate_detection: 'Duplicate Detection',
  approval_bypass: 'Approval Bypass',
  unusual_pattern: 'Unusual Pattern',
}

function ruleTypeCls(t: string) {
  if (t === 'amount_threshold') return 'bg-amber-500/20 text-amber-400'
  if (t === 'duplicate_detection') return 'bg-blue-500/20 text-blue-400'
  if (t === 'approval_bypass') return 'bg-red-500/20 text-red-400'
  return 'bg-purple-500/20 text-purple-400'
}

const totalViolations = MOCK_POLICIES.reduce((s, p) => s + p.violations, 0)
const activeCount = MOCK_POLICIES.filter(p => p.isActive).length

export default function AuditPoliciesPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Audit Policies" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">Audit Policies</h2>
            <p className="text-[13px] text-zinc-500">Automated compliance rules to detect anomalies and policy violations</p>
          </div>
          <Link
            href="/finance/compliance/audit-policies/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 h-9 text-[13px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Total Policies</p>
            </div>
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{MOCK_POLICIES.length}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Active</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">{activeCount}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Open Violations</p>
            </div>
            <p className="text-2xl font-bold text-red-400 tabular-nums">{totalViolations}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Last Run</p>
            </div>
            <p className="text-[16px] font-bold text-amber-400">2026-04-20</p>
          </div>
        </div>

        {/* Policy Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-[13px] font-semibold text-zinc-100">Policy List</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Policy Name</th>
                <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rule Type</th>
                <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Entity</th>
                <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Threshold</th>
                <th className="text-center py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Run</th>
                <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Violations</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {MOCK_POLICIES.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-zinc-200 text-[13px]">{p.name}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${ruleTypeCls(p.ruleType)}`}>
                      {RULE_TYPE_LABELS[p.ruleType]}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-zinc-400 text-[12px] capitalize">{p.entityType.replace('_', ' ')}</td>
                  <td className="py-3.5 pr-4 text-right text-zinc-300 tabular-nums text-[13px]">
                    {p.threshold != null ? `$${p.threshold.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium
                      ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-zinc-500 text-[12px]">{p.lastRun}</td>
                  <td className="py-3.5 pr-4 text-right">
                    {p.violations > 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[13px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {p.violations}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-[12px]">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/finance/compliance/audit-policies/${p.id}`}
                      className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
