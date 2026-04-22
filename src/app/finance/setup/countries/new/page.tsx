export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewFinanceCountryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const existing = sp.id ? await prisma.financeCountry.findUnique({ where: { id: sp.id } }) : null

  async function save(formData: FormData) {
    'use server'
    const data = {
      code: (formData.get('code') as string).trim().toUpperCase(),
      name: formData.get('name') as string,
      euCountryCode: (formData.get('euCountryCode') as string) || null,
      vatScheme: (formData.get('vatScheme') as string) || null,
      intrastatCode: (formData.get('intrastatCode') as string) || null,
    }
    if (existing) {
      await prisma.financeCountry.update({ where: { id: existing.id }, data })
    } else {
      await prisma.financeCountry.create({ data })
    }
    redirect('/finance/setup/countries')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={existing ? `Country/Region — ${existing.code}` : 'New Country/Region'} />
      <main className="p-6 max-w-xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">General</h2>
          <p className="text-xs text-zinc-500 mb-5">Define a country/region for address and VAT purposes.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Code <span className="text-red-400">*</span></label>
                <input name="code" defaultValue={existing?.code ?? ''} required maxLength={10}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. US" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Name <span className="text-red-400">*</span></label>
                <input name="name" defaultValue={existing?.name ?? ''} required
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="United States" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">EU Country/Region Code</label>
                <input name="euCountryCode" defaultValue={existing?.euCountryCode ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  placeholder="e.g. DE for Germany" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">VAT Scheme</label>
                <input name="vatScheme" defaultValue={existing?.vatScheme ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Standard" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Intrastat Code</label>
                <input name="intrastatCode" defaultValue={existing?.intrastatCode ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. 276" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                {existing ? 'Save Changes' : 'Create'}
              </button>
              <Link href="/finance/setup/countries" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
