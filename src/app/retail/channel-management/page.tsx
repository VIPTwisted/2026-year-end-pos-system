'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
type ChannelType = 'Physical' | 'Online' | 'Mobile'
type ChannelStatus = 'Active' | 'Inactive' | 'Error'
type SyncStatus = 'Success' | 'Warning' | 'Error'

interface Channel {
  id: string
  name: string
  type: ChannelType
  status: ChannelStatus
  productsPublished: number
  productsTotal: number
  lastSync: string
  metricLabel: string
  metricValue: string
}

interface SyncEvent {
  id: string
  timestamp: string
  channel: string
  direction: string
  itemsSynced: number
  errors: number
  duration: string
  status: SyncStatus
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 10v4M12 10v4M16 10v4" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3c-2.5 3-3.9 5.8-3.9 9s1.4 6 3.9 9M12 3c2.5 3 3.9 5.8 3.9 9s-1.4 6-3.9 9" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ChannelIcon({ type }: { type: ChannelType }) {
  const color =
    type === 'Physical' ? '#10b981' :
    type === 'Online' ? '#6366f1' : '#f59e0b'
  return (
    <span style={{ color }} className="shrink-0">
      {type === 'Physical' ? <BuildingIcon /> : type === 'Online' ? <GlobeIcon /> : <PhoneIcon />}
    </span>
  )
}

function TypeBadge({ type }: { type: ChannelType }) {
  const styles: Record<ChannelType, string> = {
    Physical: 'bg-emerald-500/15 text-emerald-400',
    Online: 'bg-indigo-500/15 text-indigo-400',
    Mobile: 'bg-amber-500/15 text-amber-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[type]}`}>
      {type}
    </span>
  )
}

function StatusChip({ status }: { status: ChannelStatus }) {
  if (status === 'Active')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" /> Active
      </span>
    )
  if (status === 'Error')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" /> Error
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/60 px-2 py-0.5 text-xs font-medium text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 inline-block" /> Inactive
    </span>
  )
}

function SyncBadge({ status }: { status: SyncStatus }) {
  if (status === 'Success')
    return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">Success</span>
  if (status === 'Warning')
    return <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400">Warning</span>
  return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">Error</span>
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const CHANNELS: Channel[] = [
  { id: 'c1', name: 'Chicago Flagship Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$8,420' },
  { id: 'c2', name: 'New York Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$6,230' },
  { id: 'c3', name: 'Los Angeles Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$5,810' },
  { id: 'c4', name: 'Dallas Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$4,120' },
  { id: 'c5', name: 'Miami Store', type: 'Physical', status: 'Active', productsPublished: 2847, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sales today', metricValue: '$3,840' },
  { id: 'c6', name: 'NovaPOS Online Store', type: 'Online', status: 'Active', productsPublished: 2341, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Orders today', metricValue: '47 orders' },
  { id: 'c7', name: 'Mobile App', type: 'Mobile', status: 'Active', productsPublished: 2341, productsTotal: 2847, lastSync: '14 min ago', metricLabel: 'Sessions today', metricValue: '1,240' },
  { id: 'c8', name: 'B2B Portal', type: 'Online', status: 'Inactive', productsPublished: 847, productsTotal: 2847, lastSync: '3 days ago', metricLabel: '', metricValue: '—' },
]

const SYNC_LOG: SyncEvent[] = [
  { id: 's1', timestamp: 'Apr 22 10:45 AM', channel: 'NovaPOS Online Store', direction: 'Outbound', itemsSynced: 2341, errors: 0, duration: '1m 12s', status: 'Success' },
  { id: 's2', timestamp: 'Apr 22 10:30 AM', channel: 'Mobile App', direction: 'Outbound', itemsSynced: 2341, errors: 0, duration: '58s', status: 'Success' },
  { id: 's3', timestamp: 'Apr 22 10:00 AM', channel: 'Chicago Flagship Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '2m 04s', status: 'Success' },
  { id: 's4', timestamp: 'Apr 22 9:45 AM', channel: 'New York Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '1m 58s', status: 'Success' },
  { id: 's5', timestamp: 'Apr 22 9:30 AM', channel: 'Los Angeles Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '2m 01s', status: 'Success' },
  { id: 's6', timestamp: 'Apr 22 9:00 AM', channel: 'Dallas Store', direction: 'Bidirectional', itemsSynced: 2844, errors: 3, duration: '2m 15s', status: 'Warning' },
  { id: 's7', timestamp: 'Apr 22 8:45 AM', channel: 'Miami Store', direction: 'Bidirectional', itemsSynced: 2847, errors: 0, duration: '1m 48s', status: 'Success' },
  { id: 's8', timestamp: 'Apr 22 8:00 AM', channel: 'B2B Portal', direction: 'Outbound', itemsSynced: 0, errors: 5, duration: '0m 12s', status: 'Error' },
]

const PRICE_LISTS = [
  { channel: 'Chicago Flagship Store', priceList: 'Retail USD', currency: 'USD', effective: 'Jan 1, 2026' },
  { channel: 'New York Store', priceList: 'Retail USD', currency: 'USD', effective: 'Jan 1, 2026' },
  { channel: 'NovaPOS Online Store', priceList: 'Web Pricing', currency: 'USD', effective: 'Jan 1, 2026' },
  { channel: 'Mobile App', priceList: 'Web Pricing', currency: 'USD', effective: 'Jan 1, 2026' },
  { channel: 'B2B Portal', priceList: 'B2B Wholesale', currency: 'USD', effective: 'Mar 1, 2026' },
]

const CATEGORIES = ['Electronics', 'Apparel', 'Home & Garden', 'Tools', 'Food & Beverage']

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChannelManagementPage() {
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const kpis = [
    { label: 'Active Channels', value: '8', color: '#e2e8f0' },
    { label: 'Online Channels', value: '3', color: '#6366f1' },
    { label: 'Physical Stores', value: '5', color: '#10b981' },
    { label: 'Products Published', value: '2,847', color: '#e2e8f0' },
    { label: 'Last Sync', value: '14 min ago', color: '#10b981' },
  ]

  const actions = (
    <>
      <button onClick={() => showToast('New Channel wizard opened')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
        New Channel
      </button>
      <button onClick={() => showToast('Publishing catalog…')} className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] px-3 py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[#16213e] transition-colors">
        Publish Catalog
      </button>
      <button onClick={() => showToast('Sync initiated for all channels')} className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] px-3 py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[#16213e] transition-colors">
        Sync Now
      </button>
    </>
  )

  if (!mounted) return null

  return (
    <>
      <TopBar
        title="Channel Management"
        breadcrumb={[{ label: 'Retail', href: '/retail' }]}
        actions={actions}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 rounded-lg border border-[rgba(99,102,241,0.3)] bg-[#16213e] px-4 py-2.5 text-xs text-[#e2e8f0] shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      <main className="flex-1 overflow-auto p-6 space-y-6" style={{ background: '#0d0e24', minHeight: '100dvh' }}>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map(k => (
            <div key={k.label} className="rounded-xl border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8] mb-2">{k.label}</p>
              <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Channel Cards Grid */}
        <section>
          <h2 className="text-sm font-semibold text-[#e2e8f0] mb-4">Channels</h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {CHANNELS.map(ch => (
              <div
                key={ch.id}
                className="rounded-xl border p-5 flex flex-col gap-3 transition-colors"
                style={{
                  background: ch.status === 'Inactive' ? 'rgba(22,33,62,0.5)' : '#16213e',
                  borderColor: ch.status === 'Inactive' ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.15)',
                  opacity: ch.status === 'Inactive' ? 0.7 : 1,
                  width: '100%',
                  maxWidth: '420px',
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="rounded-lg p-2 shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <ChannelIcon type={ch.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#e2e8f0] leading-tight truncate">{ch.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <TypeBadge type={ch.type} />
                      <StatusChip status={ch.status} />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(99,102,241,0.07)' }}>
                    <p className="text-[#94a3b8] mb-0.5">Products</p>
                    <p className="font-semibold text-[#e2e8f0]">
                      {ch.productsPublished.toLocaleString()} <span className="text-[#94a3b8] font-normal">/ {ch.productsTotal.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(99,102,241,0.07)' }}>
                    <p className="text-[#94a3b8] mb-0.5">Last Sync</p>
                    <p className="font-semibold text-[#e2e8f0]">{ch.lastSync}</p>
                  </div>
                </div>

                {ch.metricValue !== '—' && (
                  <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <span className="text-[#94a3b8]">{ch.metricLabel}: </span>
                    <span className="font-semibold text-emerald-400">{ch.metricValue}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => showToast(`Managing ${ch.name}`)} className="flex-1 rounded-lg border py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[rgba(99,102,241,0.1)] transition-colors" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
                    Manage
                  </button>
                  <button onClick={() => showToast(`Syncing ${ch.name}…`)} disabled={ch.status === 'Inactive'} className="flex-1 rounded-lg border py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[rgba(99,102,241,0.1)] transition-colors disabled:opacity-40" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
                    Sync
                  </button>
                  <button onClick={() => showToast(`Settings: ${ch.name}`)} className="flex-1 rounded-lg border py-1.5 text-xs font-medium text-[#94a3b8] hover:bg-[rgba(99,102,241,0.1)] transition-colors" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
                    Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Catalog Configuration */}
        <details className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none hover:bg-[rgba(99,102,241,0.05)] transition-colors">
            <span className="text-sm font-semibold text-[#e2e8f0]">Catalog Configuration</span>
            <ChevronDownIcon />
          </summary>
          <div className="border-t p-5 space-y-6" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>

            {/* Price Lists */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Price Lists by Channel</h3>
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                      {['Channel', 'Price List', 'Currency', 'Effective'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[#94a3b8]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRICE_LISTS.map((row, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                        <td className="px-4 py-2.5 text-[#e2e8f0]">{row.channel}</td>
                        <td className="px-4 py-2.5 text-[#94a3b8]">{row.priceList}</td>
                        <td className="px-4 py-2.5 text-[#94a3b8]">{row.currency}</td>
                        <td className="px-4 py-2.5 text-[#94a3b8]">{row.effective}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Visibility */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Category Visibility</h3>
              <div className="grid gap-2">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="flex items-center justify-between rounded-lg px-4 py-2.5 border" style={{ borderColor: 'rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.04)' }}>
                    <span className="text-xs text-[#e2e8f0]">{cat}</span>
                    <div className="flex gap-3">
                      {CHANNELS.slice(0, 4).map(ch => (
                        <label key={ch.id} className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" defaultChecked={ch.status === 'Active'} className="accent-indigo-500 w-3 h-3" />
                          <span className="text-[10px] text-[#94a3b8]">{ch.name.split(' ')[0]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel Promotions */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Channel-Specific Promotions</h3>
              <div className="space-y-2">
                {[
                  { name: 'Summer Sale 20% Off', channels: ['NovaPOS Online Store', 'Mobile App'] },
                  { name: 'In-Store Weekend Blowout', channels: ['Chicago Flagship Store', 'New York Store', 'Los Angeles Store'] },
                  { name: 'B2B Volume Discount 15%', channels: ['B2B Portal'] },
                ].map(promo => (
                  <div key={promo.name} className="flex items-center gap-3 rounded-lg px-4 py-2.5 border" style={{ borderColor: 'rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.04)' }}>
                    <span className="text-xs font-medium text-[#e2e8f0] flex-1">{promo.name}</span>
                    <div className="flex flex-wrap gap-1">
                      {promo.channels.map(c => (
                        <span key={c} className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-400">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>

        {/* Sync Log */}
        <section>
          <h2 className="text-sm font-semibold text-[#e2e8f0] mb-4">Sync Log</h2>
          <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                    {['Timestamp', 'Channel', 'Direction', 'Items Synced', 'Errors', 'Duration', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-[#94a3b8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SYNC_LOG.map((row, i) => (
                    <tr key={row.id} className="border-t transition-colors hover:bg-[rgba(99,102,241,0.05)]" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                      <td className="px-4 py-3 font-mono text-[#94a3b8]">{row.timestamp}</td>
                      <td className="px-4 py-3 text-[#e2e8f0]">{row.channel}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.direction}</td>
                      <td className="px-4 py-3 text-[#e2e8f0]">{row.itemsSynced.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={row.errors > 0 ? 'text-red-400 font-semibold' : 'text-[#94a3b8]'}>{row.errors}</span>
                      </td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.duration}</td>
                      <td className="px-4 py-3"><SyncBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
