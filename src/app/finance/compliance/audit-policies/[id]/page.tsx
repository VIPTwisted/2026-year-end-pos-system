import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

const MOCK_POLICIES: Record<string, {
  id: string; name: string; ruleType: string; entityType: string
  threshold: number | null; severity: string; isActive: boolean
  description: string; lastRun: string
}> = {
  p1: {
    id: 'p1', name: 'High-Value Expense Threshold', ruleType: 'amount_threshold',
    entityType: 'expenses', threshold: 5000, severity: 'high', isActive: true,
    description: 'Flags any expense claim or reimbursement exceeding $5,000 for secondary review.',
    lastRun: '2026-04-20',
  },
  p2: {
    id: 'p2', name: 'Duplicate Invoice Detection', ruleType: 'duplicate_detection',
    entityType: 'invoices', threshold: null, severity: 'high', isActive: true,
    description: 'Detects invoices with identical vendor, amount, and date within a 30-day window.',
    lastRun: '2026-04-19',
  },
  p3: {
    id: 'p3', name: 'PO Approval Bypass Alert', ruleType: 'approval_bypass',
    entityType: 'purchase_orders', threshold: null, severity: 'critical', isActive: true,
    description: 'Triggers when a purchase order is posted without completing the required approval chain.',
    lastRun: '2026-04-18',
  },
  p4: {
    id: 'p4', name: 'Unusual Vendor Payment Pattern', ruleType: 'unusual_pattern',
    entityType: 'invoices', threshold: 10000, severity: 'medium', isActive: false,
    description: 'Detects vendor payments that are statistically anomalous compared to historical averages.',
    lastRun: '2026-04-01',
  },
}

const MOCK_VIOLATIONS: Record<string, Array<{
  date: string; ref: string; amount: number | null; severity: string; status: string; description: string
}>> = {
  p1: [
    { date: '2026-04-15', ref: 'EXP-2026-0312', amount: 7250, severity: 'high', status: 'open', description: 'Travel expense exceeds $5,000 threshold' },
    { date: '2026-04-10', ref: 'EXP-2026-0289', amount: 6100, severity: 'high', status: 'resolved', description: 'Equipment purchase — approved by CFO' },
    { date: '2026-04-03', ref: 'EXP-2026-0241', amount: 12400, severity: 'high', status: 'waived', description: 'Trade show sponsorship — pre-approved' },
  ],
  p2: [
    { date: '2026-04-17', ref: 'INV-2026-0540', amount: 3200, severity: 'high', status: 'open', description: 'Possible duplicate of INV-2026-0519 from same vendor' },
  ],
  p3: [],
  p4: [],
}

const RULE_TYPE_LABELS: Record<string, string> = {
  amount_threshold: 'Amount Threshold',
  duplicate_detection: 'Duplicate Detection',
  approval_bypass: 'Approval Bypass',
  unusual_pattern: 'Unusual Pattern',
}

function severityCls(s: string) {
  if (s === 'critical') return 'bg-red-600/20 text-red-300'
  if (s === 'high') return 'bg-red-500/20 text-red-400'
  if (s === 'medium') return 'bg-amber-500/20 text-amber-400'
  return 'bg-zinc-700 text-zinc-400'
}

function statusCls(s: string) {
  if (s === 'resolved') return 'bg-emerald-500/20 text-emerald-400'
  if (s === 'waived') return 'bg-zinc-700 text-zinc-400'
  return 'bg-red-500/20 text-red-400'
}

export default async function AuditPolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const policy = MOCK_POLICIES[id]
  if (!policy) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Policy Not Found" />
        <main className="flex-1 p-6">
          <div className="text-zinc-500 text-[13px]">Policy &ldquo;{id}&rdquo; not found.</div>
        </main>
      </div>
    )
  }

  const violations = MOCK_VIOLATIONS[id] ?? []
  const openCount = violations.filter(v => v.status === 'open').length
  const resolvedCount = violations.filter(v => v.status === 'resolved').length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={policy.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center gap-3">
          <Link
            href="/finance/compliance/audit-policies"
            className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Audit Policies
          </Link>
        </div>

        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-zinc-100">{policy.name}</h2>
                <p className="text-[13px] text-zinc-500 mt-0.5">{policy.description}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-[12px] font-medium
              ${policy.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
              {policy.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Rule Type</p>
              <p className="text-[13px] text-zinc-200 font-medium">{RULE_TYPE_LABELS[policy.ruleType]}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Entity</p>
              <p className="text-[13px] text-zinc-200 font-medium capitalize">{policy.entityType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Threshold</p>
              <p className="text-[13px] text-zinc-200 font-medium">
                {policy.threshold != null ? `$${policy.threshold.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Severity</p>
              <span className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${severityCls(policy.severity)}`}>
                {policy.severity}
              </span>
            </div>
          </div>
        </div>

        {/* Violation Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Open Violations</p>
            </div>
            <p className="text-2xl font-bold text-red-400 tabular-nums">{openCount}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Resolved</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">{resolvedCount}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-zinc-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Waived</p>
            </div>
            <p className="text-2xl font-bold text-zinc-400 tabular-nums">
              {violations.filter(v => v.status === 'waived').length}
            </p>
          </div>
        </div>

        {/* Violations Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-[13px] font-semibold text-zinc-100">Violations History</span>
            <span className="ml-auto text-[11px] text-zinc-500">Last run: {policy.lastRun}</span>
          </div>
          {violations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-600 opacity-50" />
              <p className="text-[13px]">No violations found for this policy</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Entity Ref</th>
                  <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="text-center py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Severity</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {violations.map((v, i) => (
                  <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-400 text-[12px]">{v.date}</td>
                    <td className="py-3.5 pr-4 font-mono text-[12px] text-zinc-300">{v.ref}</td>
                    <td className="py-3.5 pr-4 text-right text-zinc-300 tabular-nums text-[13px]">
                      {v.amount != null ? `$${v.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 pr-4 text-zinc-400 text-[12px] max-w-[280px]">{v.description}</td>
                    <td className="py-3.5 text-center">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${severityCls(v.severity)}`}>
                        {v.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusCls(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  )
}
