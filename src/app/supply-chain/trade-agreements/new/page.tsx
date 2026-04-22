export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

export default function NewTradeAgreementPage() {
  return (
    <>
      <TopBar
        title="New Trade Agreement Journal"
        breadcrumb={[
          { label: 'Supply Chain', href: '/supply-chain' },
          { label: 'Trade Agreements', href: '/supply-chain/trade-agreements' },
        ]}
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <form action="/api/trade-agreements" method="POST" className="max-w-5xl space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <Link href="/supply-chain/trade-agreements" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-[13px] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Trade Agreements
            </Link>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded transition-colors">
              <Save className="w-3.5 h-3.5" /> Save Journal
            </button>
          </div>

          {/* FastTab: General */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">General</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Journal Number</label>
                <input
                  name="journalNumber"
                  placeholder="Auto-generated"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Description</label>
                <input
                  name="description"
                  placeholder="Agreement description"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Relation *</label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— Select —</option>
                  <option value="sales_price">Sales Price</option>
                  <option value="purchase_price">Purchase Price</option>
                  <option value="sales_line_disc">Sales Line Disc.</option>
                  <option value="purch_line_disc">Purch. Line Disc.</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Item Code</label>
                <select
                  name="itemCode"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="group">Group</option>
                  <option value="table">Table (Specific)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Account Code</label>
                <select
                  name="accountCode"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="group">Group</option>
                  <option value="table">Table (Specific)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Currency</label>
                <input
                  name="currency"
                  defaultValue="USD"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Starting Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Ending Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 accent-blue-500" />
                  <span className="text-[13px] text-zinc-300">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* FastTab: Lines */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-zinc-200">Agreement Lines</h2>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/20">
                    <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item No.</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item Name</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Min. Qty</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount / %</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Unit of Measure</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Starting Date</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Ending Date</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-500 text-[12px]">
                      Add lines above to define agreement terms
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </form>
      </div>
    </>
  )
}
