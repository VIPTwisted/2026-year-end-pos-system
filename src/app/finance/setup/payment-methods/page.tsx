export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'

export default async function PaymentMethodsPage() {
  const methods = await prisma.paymentMethod.findMany({ orderBy: { code: 'asc' } })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Payment Methods" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/setup/payment-methods/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">{methods.length} Payment Method{methods.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Description</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Bal. Account Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Bal. Account No.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Direct Debit</th>
              </tr>
            </thead>
            <tbody>
              {methods.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500 text-sm">No payment methods found.</td></tr>
              )}
              {methods.map((m, i) => (
                <tr key={m.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/setup/payment-methods/new?id=${m.id}`} className="text-blue-400 hover:underline font-mono text-xs">{m.code}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{m.description ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{m.balAccountType ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{m.balAccountNo ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${m.directDebit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
                      {m.directDebit ? 'Yes' : 'No'}
                    </span>
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
