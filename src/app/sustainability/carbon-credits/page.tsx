export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Leaf, ArrowLeft, Plus } from 'lucide-react'

// TODO: Add CarbonCredit model to prisma schema
// model CarbonCredit {
//   id           String   @id @default(cuid())
//   creditType   String   // VCU | GS | ACR | CAR | other
//   project      String?  // project name
//   vintage      Int      // year of credit
//   quantity     Float    // number of credits (1 credit = 1 tCO2e)
//   pricePerCredit Float
//   totalCost    Float
//   currency     String   @default("USD")
//   status       String   @default("active") // active | retired | pending | expired
//   retiredFor   String?  // what activity/period it was retired for
//   purchaseDate DateTime?
//   retiredDate  DateTime?
//   registry     String?
//   serialRange  String?
//   notes        String?
//   createdAt    DateTime @default(now())
//   updatedAt    DateTime @updatedAt
// }

const MOCK_CREDITS = [
  { id: '1', creditType: 'VCU', project: 'Amazon Rainforest REDD+', vintage: 2025, quantity: 150, pricePerCredit: 18.50, totalCost: 2775, currency: 'USD', status: 'active', purchaseDate: '2026-01-15', registry: 'Verra' },
  { id: '2', creditType: 'GS', project: 'Kenya Wind Energy', vintage: 2024, quantity: 80, pricePerCredit: 22.00, totalCost: 1760, currency: 'USD', status: 'active', purchaseDate: '2026-02-10', registry: 'Gold Standard' },
  { id: '3', creditType: 'ACR', project: 'California Forest Offset', vintage: 2023, quantity: 200, pricePerCredit: 15.00, totalCost: 3000, currency: 'USD', status: 'retired', purchaseDate: '2025-11-01', retiredDate: '2026-03-31', registry: 'ACR' },
  { id: '4', creditType: 'VCU', project: 'Cookstove Program Nepal', vintage: 2025, quantity: 100, pricePerCredit: 12.75, totalCost: 1275, currency: 'USD', status: 'pending', purchaseDate: '2026-04-01', registry: 'Verra' },
]

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  retired: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  expired: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const ALL_STATUSES = ['active', 'pending', 'retired', 'expired']

export default async function CarbonCreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filtered = MOCK_CREDITS.filter(c => !status || c.status === status)

  const activeCredits = MOCK_CREDITS.filter(c => c.status === 'active').reduce((s, c) => s + c.quantity, 0)
  const retiredCredits = MOCK_CREDITS.filter(c => c.status === 'retired').reduce((s, c) => s + c.quantity, 0)
  const pendingCredits = MOCK_CREDITS.filter(c => c.status === 'pending').reduce((s, c) => s + c.quantity, 0)
  const totalValue = MOCK_CREDITS.filter(c => c.status === 'active').reduce((s, c) => s + c.totalCost, 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Carbon Credits" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <Link href="/sustainability" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Sustainability
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Carbon Credit Register</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {filtered.length}
            </span>
          </div>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            <Plus className="w-3 h-3" /> Add Credits
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Credits', value: activeCredits, unit: 'tCO₂e', color: 'text-emerald-400' },
            { label: 'Retired Credits', value: retiredCredits, unit: 'tCO₂e', color: 'text-zinc-400' },
            { label: 'Pending', value: pendingCredits, unit: 'tCO₂e', color: 'text-amber-400' },
            {
              label: 'Active Portfolio Value',
              value: `$${totalValue.toLocaleString()}`,
              unit: '',
              color: 'text-blue-400',
            },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className={`text-2xl font-bold ${k.color}`}>
                {k.value}
                {k.unit && <span className="text-sm font-normal text-zinc-500 ml-1">{k.unit}</span>}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', ...ALL_STATUSES].map(s => (
            <Link
              key={s}
              href={s ? `/sustainability/carbon-credits?status=${s}` : '/sustainability/carbon-credits'}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                (s === '' && !status) || status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Type', 'Project', 'Registry', 'Vintage', 'Qty (tCO₂e)', 'Price/Credit', 'Total Cost', 'Purchase Date', 'Retired Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No credits found.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex rounded px-2 py-0.5 text-[11px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {c.creditType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 max-w-[200px] truncate">{c.project}</td>
                    <td className="px-4 py-2.5 text-zinc-500 text-[11px]">{c.registry}</td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono">{c.vintage}</td>
                    <td className="px-4 py-2.5 text-zinc-200 font-semibold text-right">{c.quantity.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-right">${c.pricePerCredit.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-zinc-300 text-right font-medium">${c.totalCost.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-zinc-500 text-[11px]">{c.purchaseDate ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-500 text-[11px]">
                      {'retiredDate' in c && c.retiredDate ? c.retiredDate : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${STATUS_CHIP[c.status] ?? STATUS_CHIP.active}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
