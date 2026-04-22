export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const COSTING_METHODS = ['FIFO', 'LIFO', 'Average', 'Standard', 'Specific']

export default async function NewGenProductPostingGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const existing = sp.id ? await prisma.genProductPostingGroup.findUnique({ where: { id: sp.id } }) : null

  async function save(formData: FormData) {
    'use server'
    const code = (formData.get('code') as string).trim().toUpperCase()
    const description = formData.get('description') as string
    const defVatProdPostingGroup = (formData.get('defVatProdPostingGroup') as string) || null
    const costingMethodOverride = (formData.get('costingMethodOverride') as string) || null

    if (existing) {
      await prisma.genProductPostingGroup.update({
        where: { id: existing.id },
        data: { code, description, defVatProdPostingGroup, costingMethodOverride },
      })
    } else {
      await prisma.genProductPostingGroup.create({
        data: { code, description, defVatProdPostingGroup, costingMethodOverride },
      })
    }
    redirect('/finance/setup/posting-groups/gen-product')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={existing ? `Gen. Prod. Posting Group — ${existing.code}` : 'New Gen. Product Posting Group'} />
      <main className="p-6 max-w-2xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">General</h2>
          <p className="text-xs text-zinc-500 mb-5">Define a Gen. Product Posting Group for items and G/L accounts.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Code <span className="text-red-400">*</span></label>
                <input
                  name="code"
                  defaultValue={existing?.code ?? ''}
                  required
                  maxLength={20}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. RETAIL"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <input
                  name="description"
                  defaultValue={existing?.description ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Def. VAT Prod. Posting Group</label>
                <input
                  name="defVatProdPostingGroup"
                  defaultValue={existing?.defVatProdPostingGroup ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. STANDARD"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Costing Method Override</label>
                <select
                  name="costingMethodOverride"
                  defaultValue={existing?.costingMethodOverride ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— None —</option>
                  {COSTING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                {existing ? 'Save Changes' : 'Create'}
              </button>
              <Link href="/finance/setup/posting-groups/gen-product" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
