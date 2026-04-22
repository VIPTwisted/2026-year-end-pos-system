export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Edit2, Trash2, Printer, ChevronDown } from 'lucide-react'

const TYPE_BADGE: Record<string, string> = {
  asset:     'bg-blue-500/10 text-blue-400',
  liability: 'bg-red-500/10 text-red-400',
  equity:    'bg-purple-500/10 text-purple-400',
  revenue:   'bg-emerald-500/10 text-emerald-400',
  expense:   'bg-amber-500/10 text-amber-400',
}

function normalBalance(type: string) {
  return type === 'asset' || type === 'expense' ? 'Debit (DR)' : 'Credit (CR)'
}

export default async function GLAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      journalLines: {
        include: { entry: true },
        orderBy: { entry: { date: 'desc' } },
        take: 20,
      },
    },
  })

  if (!account) notFound()

  const totalDebit = account.journalLines.reduce((s, l) => s + l.debit, 0)
  const totalCredit = account.journalLines.reduce((s, l) => s + l.credit, 0)

  const actions = (
    <div className="flex items-center gap-2">
      <Link
        href={`/finance/chart-of-accounts/${id}/edit`}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Printer className="w-3.5 h-3.5" /> Print
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title={`${account.code} · ${account.name}`}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Chart of Accounts', href: '/finance/chart-of-accounts' },
        ]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        {/* ── Main FastTabs ────────────────────────────────────────────────── */}
        <main className="flex-1 p-6 overflow-auto space-y-4">

          {/* General FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">General</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="No." value={account.code} />
              <Field label="Name" value={account.name} />
              <Field label="Account Type">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${TYPE_BADGE[account.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                  {account.type}
                </span>
              </Field>
              <Field label="Direct Posting">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                  account.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {account.isActive ? 'Yes' : 'No'}
                </span>
              </Field>
              <Field label="Blocked">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-400">
                  No
                </span>
              </Field>
              <Field label="Normal Balance" value={normalBalance(account.type)} />
              <Field label="Subtype" value={account.subtype ?? '—'} />
              <Field label="Main Account Type" value={account.mainAccountType ?? '—'} />
            </div>
          </details>

          {/* Posting FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Posting</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Gen. Posting Type" value="—" />
              <Field label="Gen. Bus. Posting Group" value="—" />
              <Field label="Gen. Prod. Posting Group" value="—" />
              <Field label="VAT Bus. Posting Group" value="—" />
              <Field label="VAT Prod. Posting Group" value="—" />
            </div>
          </details>

          {/* Consolidation FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Consolidation</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Consol. Debit Acc." value="—" />
              <Field label="Consol. Credit Acc." value="—" />
              <Field label="Opening Account" value={account.openingAccountId ?? '—'} />
            </div>
          </details>

          {/* Journal Lines (recent entries) */}
          {account.journalLines.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
                <span className="text-[13px] font-semibold text-zinc-100">G/L Entries (last 20)</span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Date</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Reference</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Description</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Debit</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {account.journalLines.map((l, i) => (
                    <tr key={l.id} className={`hover:bg-zinc-800/20 ${i !== account.journalLines.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
                      <td className="px-4 py-2 text-zinc-400">{formatDate(l.entry.date)}</td>
                      <td className="px-4 py-2 text-zinc-400 font-mono text-[11px]">{l.entry.reference}</td>
                      <td className="px-4 py-2 text-zinc-300">{l.memo ?? l.entry.description ?? '—'}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">{l.debit > 0 ? formatCurrency(l.debit) : ''}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">{l.credit > 0 ? formatCurrency(l.credit) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* ── FactBox Sidebar ───────────────────────────────────────────────── */}
        <aside className="w-72 shrink-0 border-l border-zinc-800/50 p-4 space-y-4 bg-[#0f0f1a]">
          {/* Account Balance FactBox */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-900/30">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Account Balance</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Balance</div>
                <div className={`text-xl font-bold tabular-nums ${(account.balance ?? 0) >= 0 ? 'text-zinc-100' : 'text-red-400'}`}>
                  {formatCurrency(account.balance ?? 0)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/50">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Debit</div>
                  <div className="text-sm font-semibold text-zinc-200 tabular-nums">{formatCurrency(totalDebit)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Credit</div>
                  <div className="text-sm font-semibold text-zinc-200 tabular-nums">{formatCurrency(totalCredit)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Entries FactBox */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-900/30">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Entries</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-zinc-500">Journal Lines</span>
                <span className="text-zinc-200 font-semibold">{account.journalLines.length}</span>
              </div>
              <Link
                href={`/finance/gl-entries?accountId=${account.id}`}
                className="block text-center mt-2 py-1.5 text-[12px] text-blue-400 hover:text-blue-300 bg-zinc-900/40 rounded transition-colors"
              >
                View G/L Entries →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

function Field({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
      <div className="text-[13px] text-zinc-200">{children ?? value ?? '—'}</div>
    </div>
  )
}
