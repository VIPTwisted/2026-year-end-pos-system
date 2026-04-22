export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, Wrench } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Active':        'bg-emerald-500/10 text-emerald-400',
  'In Use':        'bg-blue-500/10 text-blue-400',
  'Under Repair':  'bg-amber-500/10 text-amber-400',
  'Retired':       'bg-zinc-700 text-zinc-400',
  'Decommissioned':'bg-red-500/10 text-red-400',
}

const SAMPLE_ASSETS = [
  { id: '1', assetId: 'AST-00001', name: 'CNC Mill Machine',     type: 'Machinery',      manufacturer: 'Haas',       location: 'Building A - Bay 2',  status: 'In Use',       lastService: '2026-02-10' },
  { id: '2', assetId: 'AST-00002', name: 'Industrial Forklift',  type: 'Material Handling', manufacturer: 'Toyota',  location: 'Warehouse - Zone C',  status: 'Active',       lastService: '2026-01-20' },
  { id: '3', assetId: 'AST-00003', name: 'Air Compressor 50HP',  type: 'Utility',         manufacturer: 'Ingersoll', location: 'Building B - Utility', status: 'Under Repair', lastService: '2025-12-05' },
  { id: '4', assetId: 'AST-00004', name: 'Server Rack A',         type: 'IT Equipment',   manufacturer: 'Dell',       location: 'Server Room 1',       status: 'Active',       lastService: '2026-03-15' },
  { id: '5', assetId: 'AST-00005', name: 'Welding Station #3',   type: 'Machinery',      manufacturer: 'Lincoln',    location: 'Building A - Bay 5',  status: 'Active',       lastService: '2026-03-01' },
]

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; search?: string }>
}) {
  const sp = await searchParams
  const filtered = SAMPLE_ASSETS.filter(a =>
    (!sp.status || a.status === sp.status) &&
    (!sp.type   || a.type === sp.type) &&
    (!sp.search || a.name.toLowerCase().includes(sp.search.toLowerCase()) || a.assetId.toLowerCase().includes(sp.search.toLowerCase()))
  )

  const actions = (
    <div className="flex items-center gap-2">
      <Link
        href="/assets/new"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New Asset
      </Link>
      <Link
        href="/assets/work-orders"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
      >
        <Wrench className="w-3.5 h-3.5" /> Work Orders
      </Link>
    </div>
  )

  return (
    <>
      <TopBar title="Asset Management" actions={actions} />
      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        {/* Filter Pane */}
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Search</div>
            <form>
              <input
                name="search"
                defaultValue={sp.search ?? ''}
                placeholder="Asset ID or Name…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <input type="hidden" name="status" value={sp.status ?? ''} />
              <input type="hidden" name="type"   value={sp.type   ?? ''} />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Status</div>
            <div className="space-y-1">
              {['', 'Active', 'In Use', 'Under Repair', 'Retired', 'Decommissioned'].map(s => (
                <Link
                  key={s}
                  href={`/assets?status=${s}&type=${sp.type ?? ''}&search=${sp.search ?? ''}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    (sp.status ?? '') === s
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {s || 'All'}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Asset Type</div>
            <div className="space-y-1">
              {['', 'Machinery', 'Material Handling', 'IT Equipment', 'Utility', 'Vehicle', 'Tooling'].map(t => (
                <Link
                  key={t}
                  href={`/assets?type=${t}&status=${sp.status ?? ''}&search=${sp.search ?? ''}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    (sp.type ?? '') === t
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t || 'All Types'}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800/50 space-y-1">
            <Link href="/assets/work-orders" className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">Work Orders</Link>
            <Link href="/assets/maintenance-schedules" className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">Maintenance Schedules</Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Assets</div>
              <div className="text-2xl font-bold text-zinc-100">{SAMPLE_ASSETS.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Active / In Use</div>
              <div className="text-2xl font-bold text-emerald-400">{SAMPLE_ASSETS.filter(a => a.status === 'Active' || a.status === 'In Use').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Under Repair</div>
              <div className="text-2xl font-bold text-amber-400">{SAMPLE_ASSETS.filter(a => a.status === 'Under Repair').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Retired</div>
              <div className="text-2xl font-bold text-zinc-400">{SAMPLE_ASSETS.filter(a => a.status === 'Retired').length}</div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Asset ID</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Asset Type</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Manufacturer</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Location</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Service</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-zinc-500">
                      No assets.{' '}
                      <Link href="/assets/new" className="text-blue-400 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((asset, idx) => (
                    <tr key={asset.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                      <td className="px-4 py-2.5">
                        <Link href={`/assets/${asset.id}`} className="font-mono text-[12px] text-blue-400 hover:text-blue-300">{asset.assetId}</Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-200 font-medium">
                        <Link href={`/assets/${asset.id}`} className="hover:text-zinc-100">{asset.name}</Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{asset.type}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{asset.manufacturer}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{asset.location}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{asset.lastService}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[asset.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[12px] text-zinc-500">{filtered.length} records</div>
        </main>
      </div>
    </>
  )
}
