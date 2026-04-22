export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calculator, Play, CheckSquare, RefreshCw, AlertTriangle } from 'lucide-react'

const ACTION_BADGE: Record<string, string> = {
  'New': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Change Qty': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Cancel': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Reschedule': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Reschedule & Change Qty': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const MOCK_LINES = [
  { id: '1', worksheetName: 'DEFAULT', itemNo: 'ITEM-1001', description: 'Widget Assembly A', actionMessage: 'New', refOrderType: 'Prod. Order', refOrderNo: 'PO-2026-0412', dueDate: '2026-05-01', qty: 150, location: 'MAIN' },
  { id: '2', worksheetName: 'DEFAULT', itemNo: 'ITEM-1002', description: 'Component B', actionMessage: 'Change Qty', refOrderType: 'Purchase', refOrderNo: 'PUR-2026-0088', dueDate: '2026-04-28', qty: 500, location: 'MAIN' },
  { id: '3', worksheetName: 'DEFAULT', itemNo: 'ITEM-1003', description: 'Raw Material C', actionMessage: 'Reschedule', refOrderType: 'Purchase', refOrderNo: 'PUR-2026-0089', dueDate: '2026-05-05', qty: 200, location: 'EAST' },
  { id: '4', worksheetName: 'DEFAULT', itemNo: 'ITEM-1004', description: 'Assembly Sub X', actionMessage: 'Cancel', refOrderType: 'Prod. Order', refOrderNo: 'PO-2026-0413', dueDate: '2026-04-30', qty: 75, location: 'MAIN' },
  { id: '5', worksheetName: 'DEFAULT', itemNo: 'ITEM-1005', description: 'Packing Material', actionMessage: 'New', refOrderType: 'Purchase', refOrderNo: '', dueDate: '2026-05-10', qty: 1000, location: 'MAIN' },
]

export default function MRPWorksheetPage() {
  const newCount = MOCK_LINES.filter(l => l.actionMessage === 'New').length
  const changeCount = MOCK_LINES.filter(l => l.actionMessage === 'Change Qty').length
  const cancelCount = MOCK_LINES.filter(l => l.actionMessage === 'Cancel').length

  return (
    <>
      <TopBar title="MRP Worksheet" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPI bar */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Lines</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_LINES.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">New Orders</p>
            <p className="text-2xl font-bold text-emerald-400">{newCount}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Change Qty</p>
            <p className="text-2xl font-bold text-amber-400">{changeCount}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Cancellations</p>
            <p className="text-2xl font-bold text-red-400">{cancelCount}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Calculator className="w-4 h-4" />
            Calculate Plan
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Play className="w-4 h-4" />
            Carry Out Action Messages
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <CheckSquare className="w-4 h-4" />
            Accept All
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <select className="text-xs bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-300">
              <option>DEFAULT</option>
              <option>PRODUCTION</option>
              <option>SEASONAL</option>
            </select>
            <span className="text-xs text-zinc-500">Worksheet Name</span>
          </div>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Filter:</span>
          {['All', 'New', 'Change Qty', 'Cancel', 'Reschedule'].map(f => (
            <Link
              key={f}
              href={f === 'All' ? '/planning/mrp' : `/planning/mrp?action=${encodeURIComponent(f)}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {f}
            </Link>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Worksheet Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Item No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Action Message</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Ref. Order Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Ref. Order No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Due Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Qty</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_LINES.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{line.worksheetName}</td>
                      <td className="px-4 py-3 text-xs font-mono text-blue-400">{line.itemNo}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{line.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${ACTION_BADGE[line.actionMessage] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {line.actionMessage === 'Cancel' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {line.actionMessage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{line.refOrderType}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{line.refOrderNo || '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{line.dueDate}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-zinc-200">{line.qty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{line.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-zinc-600">
          MRP Worksheet — Material Requirements Planning. Run &quot;Calculate Plan&quot; to regenerate suggestions from demand and supply. Use &quot;Carry Out Action Messages&quot; to convert suggestions to actual orders.
        </p>
      </main>
    </>
  )
}
