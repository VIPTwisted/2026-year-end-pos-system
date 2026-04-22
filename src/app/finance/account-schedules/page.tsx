export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, FileBarChart, Eye } from 'lucide-react'

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

const TYPE_LABELS: Record<string, string> = {
  income_statement: 'Income Statement',
  balance_sheet:    'Balance Sheet',
  cash_flow:        'Cash Flow',
  trial_balance:    'Trial Balance',
  custom:           'Custom',
}

export default async function AccountSchedulesPage() {
  const schedules = await prisma.financialReportDefinition.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  const actions = (
    <div className="flex items-center gap-2">
      <Link href="/finance/account-schedules/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium rounded transition-colors">
        <Plus className="w-3.5 h-3.5" /> New
      </Link>
    </div>
  )

  return (
    <>
      <TopBar title="Account Schedules" breadcrumb={[{ label: 'Finance', href: '/finance' }]} actions={actions} />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Schedules</div>
            <div className="text-2xl font-bold text-zinc-100">{schedules.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Published</div>
            <div className="text-2xl font-bold text-emerald-400">{schedules.filter(s => s.isPublished).length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Draft</div>
            <div className="text-2xl font-bold text-zinc-500">{schedules.filter(s => !s.isPublished).length}</div>
          </div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Default Column Layout</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Modified</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-600">
                    <FileBarChart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No account schedules found. Click <strong>New</strong> to create one.
                  </td>
                </tr>
              )}
              {schedules.map((s, i) => (
                <tr key={s.id} className="border-b border-zinc-800/30 transition-colors" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/account-schedules/${s.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">{s.name}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">{s.description ?? '–'}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{TYPE_LABELS[s.reportType] ?? s.reportType}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${s.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {s.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500 text-[12px]">{formatDate(s.updatedAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/finance/account-schedules/${s.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded transition-colors" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <Eye className="w-3 h-3" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
