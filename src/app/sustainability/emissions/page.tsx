export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Wind, ArrowLeft, Plus } from 'lucide-react'

// TODO: Add EmissionEntry model to prisma schema then replace mock data
// model EmissionEntry {
//   id             String   @id @default(cuid())
//   date           DateTime
//   scope          Int      // 1, 2, or 3
//   category       String   // fuel | electricity | travel | supply_chain | waste | other
//   description    String?
//   quantity       Float
//   unit           String   // liters, kWh, km, kg, etc.
//   emissionFactor Float    // kgCO2e per unit
//   co2eKg         Float    // quantity * emissionFactor
//   source         String?  // data source / meter
//   storeId        String?
//   createdAt      DateTime @default(now())
//   updatedAt      DateTime @updatedAt
// }

const MOCK_ENTRIES = [
  { id: '1', date: '2026-04-01', scope: 1, category: 'Fuel', description: 'Fleet diesel — April', quantity: 1200, unit: 'liters', emissionFactor: 2.68, co2eKg: 3216 },
  { id: '2', date: '2026-04-01', scope: 2, category: 'Electricity', description: 'Site A grid power', quantity: 48000, unit: 'kWh', emissionFactor: 0.45, co2eKg: 21600 },
  { id: '3', date: '2026-04-05', scope: 3, category: 'Travel', description: 'Business flights Q1', quantity: 12400, unit: 'km', emissionFactor: 0.255, co2eKg: 3162 },
  { id: '4', date: '2026-04-10', scope: 1, category: 'Fuel', description: 'Generator — backup', quantity: 340, unit: 'liters', emissionFactor: 2.68, co2eKg: 911 },
  { id: '5', date: '2026-04-15', scope: 3, category: 'Supply Chain', description: 'Inbound freight emissions', quantity: 5600, unit: 'tonne-km', emissionFactor: 0.062, co2eKg: 347 },
]

const SCOPE_CHIP: Record<number, string> = {
  1: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  2: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  3: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
}

const ALL_SCOPES = ['1', '2', '3']
const ALL_CATEGORIES = ['Fuel', 'Electricity', 'Travel', 'Supply Chain', 'Waste', 'Other']

export default async function EmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; category?: string }>
}) {
  const { scope, category } = await searchParams

  const filtered = MOCK_ENTRIES.filter(e => {
    if (scope && e.scope !== parseInt(scope)) return false
    if (category && e.category !== category) return false
    return true
  })

  const totalCO2e = filtered.reduce((s, e) => s + e.co2eKg, 0)
  const scope1 = filtered.filter(e => e.scope === 1).reduce((s, e) => s + e.co2eKg, 0)
  const scope2 = filtered.filter(e => e.scope === 2).reduce((s, e) => s + e.co2eKg, 0)
  const scope3 = filtered.filter(e => e.scope === 3).reduce((s, e) => s + e.co2eKg, 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Emission Entries" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <Link href="/sustainability" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Sustainability
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Emission Entries</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {filtered.length}
            </span>
          </div>
          <Link href="/sustainability/emissions/new">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3 h-3" /> Log Entry
            </button>
          </Link>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total CO₂e', value: (totalCO2e / 1000).toFixed(1), unit: 'tCO₂e', color: 'text-zinc-200' },
            { label: 'Scope 1', value: (scope1 / 1000).toFixed(1), unit: 'tCO₂e', color: 'text-orange-400' },
            { label: 'Scope 2', value: (scope2 / 1000).toFixed(1), unit: 'tCO₂e', color: 'text-amber-400' },
            { label: 'Scope 3', value: (scope3 / 1000).toFixed(1), unit: 'tCO₂e', color: 'text-zinc-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}
                <span className="text-sm font-normal text-zinc-500 ml-1">{k.unit}</span>
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Scope filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-600 uppercase tracking-wide">Scope:</span>
            {['', ...ALL_SCOPES].map(s => (
              <Link
                key={s}
                href={s
                  ? `/sustainability/emissions?scope=${s}${category ? `&category=${category}` : ''}`
                  : `/sustainability/emissions${category ? `?category=${category}` : ''}`}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  (s === '' && !scope) || scope === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {s ? `Scope ${s}` : 'All'}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-zinc-600 uppercase tracking-wide">Category:</span>
            {['', ...ALL_CATEGORIES].map(c => (
              <Link
                key={c}
                href={c
                  ? `/sustainability/emissions?category=${c}${scope ? `&scope=${scope}` : ''}`
                  : `/sustainability/emissions${scope ? `?scope=${scope}` : ''}`}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  (c === '' && !category) || category === c
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {c || 'All'}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Date', 'Scope', 'Category', 'Description', 'Quantity', 'Unit', 'Factor (kgCO₂e/unit)', 'CO₂e (kg)', 'CO₂e (t)'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No entries.{' '}
                    <Link href="/sustainability/emissions/new" className="text-blue-400 hover:text-blue-300 hover:underline">Log one</Link>
                  </td>
                </tr>
              ) : (
                filtered.map(e => (
                  <tr key={e.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-400 font-mono text-[11px]">{e.date}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${SCOPE_CHIP[e.scope]}`}>
                        Scope {e.scope}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400">{e.category}</td>
                    <td className="px-4 py-2.5 text-zinc-300">{e.description}</td>
                    <td className="px-4 py-2.5 text-zinc-300 text-right">{e.quantity.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-zinc-500">{e.unit}</td>
                    <td className="px-4 py-2.5 text-zinc-500 text-right">{e.emissionFactor}</td>
                    <td className="px-4 py-2.5 text-zinc-300 text-right font-medium">{e.co2eKg.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-orange-400 text-right font-semibold">
                      {(e.co2eKg / 1000).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-zinc-700/50 bg-zinc-900/40">
                  <td colSpan={7} className="px-4 py-2 text-[11px] text-zinc-500 uppercase tracking-wide font-medium">
                    Totals ({filtered.length} entries)
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-zinc-200">
                    {totalCO2e.toLocaleString()} kg
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-orange-400">
                    {(totalCO2e / 1000).toFixed(2)} t
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

      </main>
    </div>
  )
}
