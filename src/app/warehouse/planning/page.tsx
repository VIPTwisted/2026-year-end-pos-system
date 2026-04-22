export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PackageCheck, Boxes, RefreshCw, ChevronDown } from 'lucide-react'

const DOC_TYPE_COLOR: Record<string, string> = {
  'Sales Order': 'text-blue-400',
  'Purchase Order': 'text-emerald-400',
  'Transfer Order': 'text-purple-400',
  'Prod. Order': 'text-amber-400',
}

const MOCK_LINES = [
  { id: '1', sourceDocument: 'SO-2026-0501', sourceDocType: 'Sales Order', itemNo: 'ITEM-1001', description: 'Widget Assembly A', qtyOutstanding: 100, qtyToHandle: 100, location: 'MAIN', zone: 'PICK', bin: 'BIN-A-01' },
  { id: '2', sourceDocument: 'SO-2026-0502', sourceDocType: 'Sales Order', itemNo: 'ITEM-1002', description: 'Component B', qtyOutstanding: 250, qtyToHandle: 250, location: 'MAIN', zone: 'PICK', bin: 'BIN-A-03' },
  { id: '3', sourceDocument: 'PO-2026-0088', sourceDocType: 'Purchase Order', itemNo: 'ITEM-1003', description: 'Raw Material C', qtyOutstanding: 500, qtyToHandle: 500, location: 'EAST', zone: 'RECEIVE', bin: 'BIN-R-01' },
  { id: '4', sourceDocument: 'TO-2026-0012', sourceDocType: 'Transfer Order', itemNo: 'FG-5001', description: 'Finished Good Alpha', qtyOutstanding: 75, qtyToHandle: 75, location: 'WEST', zone: 'SHIP', bin: 'BIN-S-02' },
  { id: '5', sourceDocument: 'PO-PROD-0413', sourceDocType: 'Prod. Order', itemNo: 'ITEM-1004', description: 'Assembly Sub X', qtyOutstanding: 200, qtyToHandle: 200, location: 'MAIN', zone: 'PROD', bin: 'BIN-P-01' },
]

export default function WarehousePlanningPage() {
  const totalOutstanding = MOCK_LINES.reduce((s, l) => s + l.qtyOutstanding, 0)
  const pickLines = MOCK_LINES.filter(l => l.zone === 'PICK').length
  const putAwayLines = MOCK_LINES.filter(l => l.zone === 'RECEIVE').length

  return (
    <>
      <TopBar title="Warehouse Planning" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Lines</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_LINES.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Qty Outstanding</p>
            <p className="text-2xl font-bold text-amber-400">{totalOutstanding.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Pick Lines</p>
            <p className="text-2xl font-bold text-blue-400">{pickLines}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Put-Away Lines</p>
            <p className="text-2xl font-bold text-emerald-400">{putAwayLines}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <PackageCheck className="w-4 h-4" />
            Create Picks
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Boxes className="w-4 h-4" />
            Create Put-aways
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <select className="text-xs bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-300">
              <option value="">All Locations</option>
              <option>MAIN</option>
              <option>EAST</option>
              <option>WEST</option>
            </select>
          </div>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Zone:</span>
          {['All', 'PICK', 'RECEIVE', 'SHIP', 'PROD'].map(z => (
            <Link
              key={z}
              href={z === 'All' ? '/warehouse/planning' : `/warehouse/planning?zone=${z}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {z}
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Source Document</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Doc Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Item No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Qty Outstanding</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Qty to Handle</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Zone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Bin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_LINES.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{line.sourceDocument}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${DOC_TYPE_COLOR[line.sourceDocType] ?? 'text-zinc-400'}`}>
                          {line.sourceDocType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{line.itemNo}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{line.description}</td>
                      <td className="px-4 py-3 text-right font-medium text-amber-400">{line.qtyOutstanding.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-200">{line.qtyToHandle.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{line.location}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{line.zone}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{line.bin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
