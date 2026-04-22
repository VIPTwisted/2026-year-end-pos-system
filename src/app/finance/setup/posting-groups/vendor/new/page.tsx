export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewVendorPostingGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const existing = sp.id ? await prisma.vendorPostingGroup.findUnique({ where: { id: sp.id } }) : null

  async function save(formData: FormData) {
    'use server'
    const data = {
      code: (formData.get('code') as string).trim().toUpperCase(),
      description: formData.get('description') as string,
      payablesAccount: (formData.get('payablesAccount') as string) || null,
      paymentDiscDebitAcc: (formData.get('paymentDiscDebitAcc') as string) || null,
      paymentDiscCreditAcc: (formData.get('paymentDiscCreditAcc') as string) || null,
      invoiceRoundingAccount: (formData.get('invoiceRoundingAccount') as string) || null,
    }
    if (existing) {
      await prisma.vendorPostingGroup.update({ where: { id: existing.id }, data })
    } else {
      await prisma.vendorPostingGroup.create({ data })
    }
    redirect('/finance/setup/posting-groups/vendor')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={existing ? `Vendor Posting Group — ${existing.code}` : 'New Vendor Posting Group'} />
      <main className="p-6 max-w-2xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">General</h2>
          <p className="text-xs text-zinc-500 mb-5">Map vendor transactions to G/L accounts.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Code <span className="text-red-400">*</span></label>
                <input name="code" defaultValue={existing?.code ?? ''} required maxLength={20}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. DOMESTIC" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <input name="description" defaultValue={existing?.description ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              {[
                ['payablesAccount', 'Payables Account', existing?.payablesAccount],
                ['paymentDiscDebitAcc', 'Payment Disc. Debit Acc.', existing?.paymentDiscDebitAcc],
                ['paymentDiscCreditAcc', 'Payment Disc. Credit Acc.', existing?.paymentDiscCreditAcc],
                ['invoiceRoundingAccount', 'Invoice Rounding Account', existing?.invoiceRoundingAccount],
              ].map(([name, label, val]) => (
                <div key={name as string}>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">{label as string}</label>
                  <input name={name as string} defaultValue={(val as string) ?? ''}
                    className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder={label as string} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                {existing ? 'Save Changes' : 'Create'}
              </button>
              <Link href="/finance/setup/posting-groups/vendor" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
