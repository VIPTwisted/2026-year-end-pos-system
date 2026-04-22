export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, RotateCcw, AlertTriangle } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  Available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Lent: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  'In Repair': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const MOCK_LOANERS = [
  { id: 'LOAN-001', lenderCode: 'LOAN-001', itemNo: 'ITEM-LOANER-001', description: 'Replacement Laptop', serialNo: 'SN-LAP-001', status: 'Lent', lentToCustomer: 'Acme Corp', lentDate: '2026-04-10', expectedReturn: '2026-04-24' },
  { id: 'LOAN-002', lenderCode: 'LOAN-002', itemNo: 'ITEM-LOANER-002', description: 'Barcode Scanner', serialNo: 'SN-SCN-002', status: 'Available', lentToCustomer: '', lentDate: '', expectedReturn: '' },
  { id: 'LOAN-003', lenderCode: 'LOAN-003', itemNo: 'ITEM-LOANER-001', description: 'Replacement Laptop', serialNo: 'SN-LAP-003', status: 'Overdue', lentToCustomer: 'Globex Industries', lentDate: '2026-04-01', expectedReturn: '2026-04-15' },
  { id: 'LOAN-004', lenderCode: 'LOAN-004', itemNo: 'ITEM-LOANER-003', description: 'Thermal Printer', serialNo: 'SN-PRT-004', status: 'In Repair', lentToCustomer: '', lentDate: '', expectedReturn: '' },
  { id: 'LOAN-005', lenderCode: 'LOAN-005', itemNo: 'ITEM-LOANER-002', description: 'Barcode Scanner', serialNo: 'SN-SCN-005', status: 'Lent', lentToCustomer: 'Springfield LLC', lentDate: '2026-04-18', expectedReturn: '2026-04-30' },
]

export default function LoanerItemsPage() {
  const available = MOCK_LOANERS.filter(l => l.status === 'Available').length
  const lent = MOCK_LOANERS.filter(l => l.status === 'Lent').length
  const overdue = MOCK_LOANERS.filter(l => l.status === 'Overdue').length

  return (
    <>
      <TopBar title="Loaner Items" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Items</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_LOANERS.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Available</p>
            <p className="text-2xl font-bold text-emerald-400">{available}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Currently Lent</p>
            <p className="text-2xl font-bold text-amber-400">{lent}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Overdue</p>
            <p className={`text-2xl font-bold ${overdue > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{overdue}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4" />
            Lend Item
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Receive Return
          </Button>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          {['All', 'Available', 'Lent', 'Overdue', 'In Repair'].map(s => (
            <Link
              key={s}
              href={s === 'All' ? '/service/loaner-items' : `/service/loaner-items?status=${encodeURIComponent(s)}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {s}
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Lender Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Item No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Serial No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Lent to Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Lent Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Expected Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_LOANERS.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{l.lenderCode}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{l.itemNo}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{l.description}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{l.serialNo}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[l.status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {l.status === 'Overdue' && <AlertTriangle className="w-3 h-3" />}
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{l.lentToCustomer || '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{l.lentDate || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {l.expectedReturn ? (
                          <span className={l.status === 'Overdue' ? 'text-red-400 font-medium' : 'text-zinc-400'}>
                            {l.expectedReturn}
                          </span>
                        ) : '—'}
                      </td>
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
