export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewBankReconciliationPage() {
  const bankAccounts = await prisma.bankAccount.findMany({ orderBy: { accountNo: 'asc' } })

  // Seed lines for demo
  const seedLines = [
    { transactionDate: new Date(), description: 'Opening deposit', statementAmount: 0, appliedAmount: 0, difference: 0, matched: false },
  ]

  async function save(formData: FormData) {
    'use server'
    const bankAccountId = formData.get('bankAccountId') as string
    const statementNo = formData.get('statementNo') as string
    const statementDate = new Date(formData.get('statementDate') as string)
    const openingBalance = parseFloat(formData.get('openingBalance') as string) || 0
    const closingBalance = parseFloat(formData.get('closingBalance') as string) || 0

    await prisma.bankReconciliation.create({
      data: {
        bankAccountId,
        statementNo,
        statementDate,
        openingBalance,
        closingBalance,
        status: 'open',
      },
    })
    redirect('/finance/bank-reconciliation')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Bank Reconciliation" />
      <main className="p-6 max-w-4xl space-y-6">

        {/* Header Card */}
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">Reconciliation Header</h2>
          <p className="text-xs text-zinc-500 mb-5">Match bank statement transactions against posted entries.</p>

          <form id="recon-form" action={save} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Bank Account <span className="text-red-400">*</span></label>
                <select name="bankAccountId" required
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="">— Select Bank Account —</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.accountNo} — {b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Statement No.</label>
                <input name="statementNo"
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. STMT-2026-001" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Statement Date <span className="text-red-400">*</span></label>
                <input name="statementDate" type="date" required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Balance Last Statement</label>
                <input name="openingBalance" type="number" step="0.01" defaultValue="0"
                  className="w-full bg-zinc-900 border border-zinc-600 bg-zinc-900/50 rounded px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-blue-500 text-right font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Statement Ending Balance <span className="text-red-400">*</span></label>
                <input name="closingBalance" type="number" step="0.01" required defaultValue="0"
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
              </div>
            </div>
          </form>
        </div>

        {/* Lines Table */}
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-200">Statement Lines</h3>
            <p className="text-xs text-zinc-500">Lines will be added after creating the reconciliation</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Transaction Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Description</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Statement Amount</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Applied Amount</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Difference</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-zinc-400">Match</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-600 text-xs italic">
                  Statement lines will appear here after saving the reconciliation header.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <button form="recon-form" type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
            Create Reconciliation
          </button>
          <Link href="/finance/bank-reconciliation" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
            Cancel
          </Link>
        </div>
      </main>
    </div>
  )
}
