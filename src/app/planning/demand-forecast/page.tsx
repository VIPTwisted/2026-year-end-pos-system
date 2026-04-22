export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Copy, TrendingUp, BarChart3 } from 'lucide-react'

const MOCK_FORECASTS = [
  { id: '1', forecastName: 'SPRING-2026', itemNo: 'ITEM-1001', description: 'Widget Assembly A', date: '2026-05-01', forecastQty: 1200, locationCode: 'MAIN', uom: 'PCS' },
  { id: '2', forecastName: 'SPRING-2026', itemNo: 'ITEM-1002', description: 'Component B', date: '2026-05-01', forecastQty: 3000, locationCode: 'MAIN', uom: 'PCS' },
  { id: '3', forecastName: 'SPRING-2026', itemNo: 'ITEM-1003', description: 'Raw Material C', date: '2026-06-01', forecastQty: 5000, locationCode: 'EAST', uom: 'KG' },
  { id: '4', forecastName: 'SUMMER-2026', itemNo: 'FG-5001', description: 'Finished Good Alpha', date: '2026-07-01', forecastQty: 800, locationCode: 'MAIN', uom: 'PCS' },
  { id: '5', forecastName: 'SUMMER-2026', itemNo: 'FG-5002', description: 'Finished Good Beta', date: '2026-07-01', forecastQty: 600, locationCode: 'WEST', uom: 'PCS' },
]

const FORECAST_NAMES = [...new Set(MOCK_FORECASTS.map(f => f.forecastName))]

export default function DemandForecastPage() {
  const totalQty = MOCK_FORECASTS.reduce((s, f) => s + f.forecastQty, 0)

  return (
    <>
      <TopBar title="Demand Forecast" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Entries</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_FORECASTS.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Forecast Names</p>
            <p className="text-2xl font-bold text-blue-400">{FORECAST_NAMES.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Forecasted Qty</p>
            <p className="text-2xl font-bold text-emerald-400">{totalQty.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Locations</p>
            <p className="text-2xl font-bold text-amber-400">{new Set(MOCK_FORECASTS.map(f => f.locationCode)).size}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Copy className="w-4 h-4" />
            Copy Forecast
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Import from History
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Forecast Chart
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <select className="text-xs bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-300">
              <option value="">All Forecasts</option>
              {FORECAST_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-xs text-zinc-500">Forecast Name</span>
          </div>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Forecast:</span>
          {['All', ...FORECAST_NAMES].map(f => (
            <Link
              key={f}
              href={f === 'All' ? '/planning/demand-forecast' : `/planning/demand-forecast?name=${encodeURIComponent(f)}`}
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Forecast Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Item No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Forecast Qty</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">UOM</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Location Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_FORECASTS.map(f => (
                    <tr key={f.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-blue-400">{f.forecastName}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{f.itemNo}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{f.description}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{f.date}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-zinc-200">{f.forecastQty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{f.uom}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{f.locationCode}</td>
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
