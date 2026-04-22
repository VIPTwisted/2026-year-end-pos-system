export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const CALC_TYPES = ['Normal', 'ReverseCharge', 'FullVAT', 'NoTaxableVAT']

export default async function NewVatPostingSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const existing = sp.id ? await prisma.vatPostingSetup.findUnique({ where: { id: sp.id } }) : null

  async function save(formData: FormData) {
    'use server'
    const data = {
      vatBusPostingGroup: (formData.get('vatBusPostingGroup') as string).trim().toUpperCase(),
      vatProdPostingGroup: (formData.get('vatProdPostingGroup') as string).trim().toUpperCase(),
      vatPercent: parseFloat(formData.get('vatPercent') as string) || 0,
      vatCalculationType: formData.get('vatCalculationType') as string,
      salesVatAccount: (formData.get('salesVatAccount') as string) || null,
      purchaseVatAccount: (formData.get('purchaseVatAccount') as string) || null,
    }
    if (existing) {
      await prisma.vatPostingSetup.update({ where: { id: existing.id }, data })
    } else {
      await prisma.vatPostingSetup.create({ data })
    }
    redirect('/finance/setup/vat-posting')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={existing ? 'Edit VAT Posting Setup' : 'New VAT Posting Setup'} />
      <main className="p-6 max-w-2xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">VAT Posting Setup</h2>
          <p className="text-xs text-zinc-500 mb-5">Define VAT calculation for a bus/product posting group combination.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">VAT Bus. Posting Group <span className="text-red-400">*</span></label>
                <input name="vatBusPostingGroup" defaultValue={existing?.vatBusPostingGroup ?? ''} required maxLength={20}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. DOMESTIC" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">VAT Prod. Posting Group <span className="text-red-400">*</span></label>
                <input name="vatProdPostingGroup" defaultValue={existing?.vatProdPostingGroup ?? ''} required maxLength={20}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. STANDARD" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">VAT %</label>
                <input name="vatPercent" type="number" step="0.01" min="0" max="100"
                  defaultValue={existing?.vatPercent ?? 0}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">VAT Calculation Type</label>
                <select name="vatCalculationType" defaultValue={existing?.vatCalculationType ?? 'Normal'}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {CALC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Sales VAT Account</label>
                <input name="salesVatAccount" defaultValue={existing?.salesVatAccount ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="G/L Account No." />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Purchase VAT Account</label>
                <input name="purchaseVatAccount" defaultValue={existing?.purchaseVatAccount ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="G/L Account No." />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                {existing ? 'Save Changes' : 'Create'}
              </button>
              <Link href="/finance/setup/vat-posting" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
