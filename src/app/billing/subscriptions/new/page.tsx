export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewSubscriptionPage() {
  return (
    <>
      <TopBar title="New Subscription Contract" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/billing/subscriptions" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Billing Subscriptions
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">New Contract</span>
        </div>

        {/* FastTab: General */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200">General</span>
          </div>
          <CardContent className="p-5 grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Contract No.</label>
              <input
                type="text"
                placeholder="Auto-generated"
                disabled
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Status</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option>Pending</option>
                <option>Active</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Customer <span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="Search customer..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Item No. <span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. PRO-PLAN-001"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Description</label>
              <input
                type="text"
                placeholder="Plan description"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* FastTab: Billing */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Billing</span>
          </div>
          <CardContent className="p-5 grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Billing Period <span className="text-red-400">*</span></label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Billing Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Start Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">End Date</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Payment Terms</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option>Net 30</option>
                <option>Net 15</option>
                <option>Due on Receipt</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Billing Group</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option value="">— None —</option>
                <option>MONTHLY-BATCH</option>
                <option>ANNUAL-BATCH</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* FastTab: Notes */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Notes</span>
          </div>
          <CardContent className="p-5">
            <textarea
              rows={4}
              placeholder="Internal notes about this subscription contract..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Save className="w-4 h-4" />
            Save Contract
          </Button>
          <Button variant="outline" asChild>
            <Link href="/billing/subscriptions">Cancel</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
