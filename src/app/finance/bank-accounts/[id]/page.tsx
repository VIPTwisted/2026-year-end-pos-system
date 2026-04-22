export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Edit2, Trash2, RefreshCw, ChevronDown } from 'lucide-react'

function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

export default async function BankAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const account = await prisma.bankAccount.findUnique({
    where: { id },
    include: {
      glAccount: { select: { code: true, name: true } },
      transactions: {
        orderBy: { date: 'desc' },
        take: 20,
      },
      reconciliations: {
        orderBy: { statementDate: 'desc' },
        take: 5,
      },
      _count: { select: { transactions: true } },
    },
  })

  if (!account) notFound()

  const unreconciledCount = account.transactions.filter(t => !t.isReconciled).length

  const actions = (
    <div className="flex items-center gap-2">
      <Link
        href={`/finance/bank-accounts/${id}/edit`}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <Link
        href={`/finance/bank-accounts/${id}/reconcile`}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reconcile
      </Link>
    </div>
  )

  return (
    <>
      <TopBar
        title={`${account.accountCode} · ${account.name ?? account.bankName}`}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Bank Accounts', href: '/finance/bank-accounts' },
        ]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        <main className="flex-1 p-6 overflow-auto space-y-4">

          {/* General FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">General</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="No." value={account.accountCode} />
              <Field label="Name" value={account.name ?? account.bankName} />
              <Field label="Bank Name" value={account.bankName} />
              <Field label="Account No." value={account.accountNumber} />
              <Field label="Routing No." value={account.routingNumber ?? '—'} />
              <Field label="Account Type" value={account.accountType.replace('_', ' ')} />
              <Field label="Currency Code" value={account.currency} />
              <Field label="Last Statement No." value={account.lastStatementNo ?? '—'} />
              <Field label="Last Statement Date" value={account.lastStatementDate ? formatDate(account.lastStatementDate) : '—'} />
              {account.glAccount && (
                <Field label="G/L Account">
                  <Link href={`/finance/chart-of-accounts`} className="text-blue-400 hover:text-blue-300">
                    {account.glAccount.code} · {account.glAccount.name}
                  </Link>
                </Field>
              )}
            </div>
          </details>

          {/* Communication FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Communication</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Contact Name" value={account.contactName ?? '—'} />
              <Field label="Phone No." value={account.phone ?? '—'} />
              <Field label="E-Mail" value={account.email ?? '—'} />
              <Field label="Address" value={account.address ?? '—'} />
              <Field label="City" value={account.city ?? '—'} />
              <Field label="State" value={account.state ?? '—'} />
              <Field label="ZIP Code" value={account.zip ?? '—'} />
              <Field label="Country/Region" value={account.country ?? '—'} />
            </div>
          </details>

          {/* Transfer FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Transfer</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="SWIFT Code" value={account.swiftCode ?? '—'} />
              <Field label="IBAN No." value={account.ibanNumber ?? '—'} />
            </div>
          </details>

          {/* Posting FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Posting</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Bank Acc. Posting Group" value="—" />
              <Field label="Currency Code" value={account.currency} />
              <Field label="Primary" value={account.isPrimary ? 'Yes' : 'No'} />
              <Field label="Blocked" value={account.isActive ? 'No' : 'Yes'} />
            </div>
          </details>

          {/* Recent Transactions */}
          {account.transactions.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
                <span className="text-[13px] font-semibold text-zinc-100">Recent Transactions</span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Date</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Description</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Reference</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Amount</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Balance</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Reconciled</th>
                  </tr>
                </thead>
                <tbody>
                  {account.transactions.map((tx, i) => (
                    <tr key={tx.id} className={`hover:bg-zinc-800/20 ${i !== account.transactions.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
                      <td className="px-4 py-2 text-zinc-400">{formatDate(tx.date)}</td>
                      <td className="px-4 py-2 text-zinc-300">{tx.description}</td>
                      <td className="px-4 py-2 text-zinc-500 font-mono text-[11px]">{tx.reference ?? '—'}</td>
                      <td className={`px-4 py-2 text-right tabular-nums font-semibold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(tx.amount, account.currency)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-400">
                        {formatCurrency(tx.runningBalance, account.currency)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          tx.isReconciled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {tx.isReconciled ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* FactBox Sidebar */}
        <aside className="w-72 shrink-0 border-l border-zinc-800/50 p-4 space-y-4 bg-[#0f0f1a]">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-900/30">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Statistics</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Current Balance</div>
                <div className={`text-xl font-bold tabular-nums ${account.currentBalance < 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                  {formatCurrency(account.currentBalance, account.currency)}
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-500">Total Transactions</span>
                  <span className="text-zinc-200 font-semibold">{account._count.transactions}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-500">Unreconciled</span>
                  <span className={`font-semibold ${unreconciledCount > 0 ? 'text-amber-400' : 'text-zinc-200'}`}>
                    {unreconciledCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-500">Last Statement</span>
                  <span className="text-zinc-200">{account.lastStatementNo ?? '—'}</span>
                </div>
              </div>
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
