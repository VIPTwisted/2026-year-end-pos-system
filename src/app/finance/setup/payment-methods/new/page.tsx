export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const BAL_ACCOUNT_TYPES = ['G/L Account', 'Bank Account']

export default async function NewPaymentMethodPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const existing = sp.id ? await prisma.paymentMethod.findUnique({ where: { id: sp.id } }) : null

  async function save(formData: FormData) {
    'use server'
    const data = {
      code: (formData.get('code') as string).trim().toUpperCase(),
      description: formData.get('description') as string,
      balAccountType: (formData.get('balAccountType') as string) || null,
      balAccountNo: (formData.get('balAccountNo') as string) || null,
      directDebit: formData.get('directDebit') === 'on',
    }
    if (existing) {
      await prisma.paymentMethod.update({ where: { id: existing.id }, data })
    } else {
      await prisma.paymentMethod.create({ data })
    }
    redirect('/finance/setup/payment-methods')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={existing ? `Payment Method — ${existing.code}` : 'New Payment Method'} />
      <main className="p-6 max-w-xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">General</h2>
          <p className="text-xs text-zinc-500 mb-5">Define how payments are made and their balancing accounts.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Code <span className="text-red-400">*</span></label>
                <input name="code" defaultValue={existing?.code ?? ''} required maxLength={20}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. CASH" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <input name="description" defaultValue={existing?.description ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Cash Payment" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Bal. Account Type</label>
                <select name="balAccountType" defaultValue={existing?.balAccountType ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="">— None —</option>
                  {BAL_ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Bal. Account No.</label>
                <input name="balAccountNo" defaultValue={existing?.balAccountNo ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Account No." />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="directDebit" defaultChecked={existing?.directDebit ?? false} className="sr-only peer" />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
                <span className="text-xs text-zinc-400">Direct Debit</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                {existing ? 'Save Changes' : 'Create'}
              </button>
              <Link href="/finance/setup/payment-methods" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
