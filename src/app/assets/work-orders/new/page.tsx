export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewWorkOrderPage() {
  return (
    <>
      <TopBar
        title="New Work Order"
        breadcrumb={[
          { label: 'Assets', href: '/assets' },
          { label: 'Work Orders', href: '/assets/work-orders' },
        ]}
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <form action="/api/assets/work-orders" method="POST" className="max-w-3xl space-y-6">
          <div className="flex items-center justify-between mb-2">
            <Link href="/assets/work-orders" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-[13px] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Work Orders
            </Link>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded transition-colors">
              <Save className="w-3.5 h-3.5" /> Save Work Order
            </button>
          </div>

          {/* FastTab: General */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">General</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Asset ID *</label>
                <input name="assetId" required placeholder="e.g. AST-00001" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Description *</label>
                <input name="description" required placeholder="Brief description of work required" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Work Order Type *</label>
                <select name="type" required className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500">
                  <option value="">— Select —</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Modification">Modification</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Priority</label>
                <select name="priority" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500">
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Assigned To</label>
                <input name="assignedTo" placeholder="Technician name" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Start Date</label>
                <input type="date" name="startDate" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">End Date</label>
                <input type="date" name="endDate" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Estimated Hours</label>
                <input type="number" step="0.5" name="estimatedHours" className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* FastTab: Notes */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">Notes</h2>
            </div>
            <div className="p-5">
              <textarea
                name="notes"
                rows={4}
                placeholder="Detailed instructions, safety notes, parts required…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
