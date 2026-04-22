export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewFinanceCurrencyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const existing = sp.id ? await prisma.financeCurrency.findUnique({ where: { id: sp.id } }) : null

  async function save(formData: FormData) {
    'use server'
    const data = {
      code: (formData.get('code') as string).trim().toUpperCase(),
      description: formData.get('description') as string,
      exchangeRateAmount: parseFloat(formData.get('exchangeRateAmount') as string) || 1,
      relationalExchRateAmt: parseFloat(formData.get('relationalExchRateAmt') as string) || 1,
      lastDateModified: new Date(),
    }
    if (existing) {
      await prisma.financeCurrency.update({ where: { id: existing.id }, data })
    } else {
      await prisma.financeCurrency.create({ data })
    }
    redirect('/finance/setup/currencies')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={existing ? `Currency — ${existing.code}` : 'New Currency'} />
      <main className="p-6 max-w-xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">General</h2>
          <p className="text-xs text-zinc-500 mb-5">Define a currency and its exchange rates against the local currency.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Code <span className="text-red-400">*</span></label>
                <input name="code" defaultValue={existing?.code ?? ''} required maxLength={10}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. EUR" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <input name="description" defaultValue={existing?.description ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Euro" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Exchange Rate Amount</label>
                <input name="exchangeRateAmount" type="number" step="0.000001" min="0"
                  defaultValue={existing?.exchangeRateAmount ?? 1}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
                <p className="text-[11px] text-zinc-600 mt-1">Amount in this currency</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Relational Exch. Rate Amount</label>
                <input name="relationalExchRateAmt" type="number" step="0.000001" min="0"
                  defaultValue={existing?.relationalExchRateAmt ?? 1}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
                <p className="text-[11px] text-zinc-600 mt-1">Equivalent in local currency (USD)</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                {existing ? 'Save Changes' : 'Create'}
              </button>
              <Link href="/finance/setup/currencies" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
