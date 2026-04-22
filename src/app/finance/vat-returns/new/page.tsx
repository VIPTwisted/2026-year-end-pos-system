export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewVatReturnPage() {
  async function save(formData: FormData) {
    'use server'
    await prisma.vatReturn.create({
      data: {
        returnPeriod: formData.get('returnPeriod') as string,
        startDate: new Date(formData.get('startDate') as string),
        endDate: new Date(formData.get('endDate') as string),
        status: 'Open',
        totalVatDue: 0,
        netVatDue: 0,
      },
    })
    redirect('/finance/vat-returns')
  }

  const today = new Date()
  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
  const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New VAT Return Period" />
      <main className="p-6 max-w-xl">
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">VAT Return Period</h2>
          <p className="text-xs text-zinc-500 mb-5">Open a new VAT return period for submission to tax authorities.</p>

          <form action={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1">Return Period <span className="text-red-400">*</span></label>
                <input name="returnPeriod" required
                  defaultValue={`Q${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. Q1 2026 or 2026-01" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Start Date <span className="text-red-400">*</span></label>
                <input name="startDate" type="date" required
                  defaultValue={quarterStart.toISOString().split('T')[0]}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">End Date <span className="text-red-400">*</span></label>
                <input name="endDate" type="date" required
                  defaultValue={quarterEnd.toISOString().split('T')[0]}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-700 rounded p-3 text-xs text-zinc-500">
              VAT amounts (Total VAT Due, Net VAT Due) will be calculated automatically from posted VAT entries when the period is processed.
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                Open Period
              </button>
              <Link href="/finance/vat-returns" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
