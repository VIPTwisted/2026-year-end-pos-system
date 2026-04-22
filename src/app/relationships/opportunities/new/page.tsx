export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewOpportunityPage() {
  return (
    <>
      <TopBar title="New Opportunity" />
      <main className="flex-1 p-6 overflow-auto max-w-3xl space-y-5">

        <div className="flex items-center gap-2 text-sm">
          <Link href="/relationships/opportunities" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Opportunities
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">New</span>
        </div>

        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Opportunity Details</span>
          </div>
          <CardContent className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Description <span className="text-red-400">*</span></label>
              <input type="text" placeholder="Opportunity description" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Contact <span className="text-red-400">*</span></label>
              <input type="text" placeholder="Search contact..." className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Salesperson</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option value="">— Assign —</option>
                <option>JD</option>
                <option>BK</option>
                <option>TR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Stage</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option>Discovery</option>
                <option>Proposal</option>
                <option>Negotiation</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Status</label>
              <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300">
                <option>Open</option>
                <option>Won</option>
                <option>Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Close Date</label>
              <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Estimated Value ($)</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Probability (%)</label>
              <input type="number" min="0" max="100" placeholder="50" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Notes</label>
              <textarea rows={3} placeholder="Notes about this opportunity..." className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Save className="w-4 h-4" />
            Save Opportunity
          </Button>
          <Button variant="outline" asChild>
            <Link href="/relationships/opportunities">Cancel</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
