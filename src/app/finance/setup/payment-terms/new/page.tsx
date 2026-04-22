export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewPaymentTermPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const existing = sp.id ? await prisma.paymentTerm.findUnique({ where: { id: sp.id } }) : null

  async function save(formData: FormData) {
    'use server'
    const data = {
      code: (formData.get('code') as string).trim().toUpperCase(),
      description: formData.get('description') as string,
      dueDateCalculation: (formData.get('dueDateCalculation') as string) || null,
      discountDateCalculation: (formData.get('discountDateCalculation') as string) || null,
      discountPercent: parseFloat(formData.get('discountPercent') as string) || 0,
    }
    if (existing) {
      await prisma.paymentTerm.update({ where: { id: existing.id }, data })
    } else {
      await prisma.paymentTerm.create({ data })
    }
    redirect('/finance/setup/payment-terms')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={existing ? `Payment Term — ${existing.code}` : 'New Payment Term'} />
      <main className="p-6 max-w-xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">General</h2>
          <p className="text-xs text-zinc-500 mb-5">Define payment due date formula and early payment discount.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Code <span className="text-red-400">*</span></label>
                <input name="code" defaultValue={existing?.code ?? ''} required maxLength={20}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. NET30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <input name="description" defaultValue={existing?.description ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Net 30 Days" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Due Date Calculation</label>
                <input name="dueDateCalculation" defaultValue={existing?.dueDateCalculation ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. 30D or CM+30D" />
                <p className="text-[11px] text-zinc-600 mt-1">D=days, M=months, CM=current month end</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Discount Date Calculation</label>
                <input name="discountDateCalculation" defaultValue={existing?.discountDateCalculation ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. 10D" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Discount %</label>
                <input name="discountPercent" type="number" step="0.01" min="0" max="100"
                  defaultValue={existing?.discountPercent ?? 0}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                {existing ? 'Save Changes' : 'Create'}
              </button>
              <Link href="/finance/setup/payment-terms" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
