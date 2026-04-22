'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── Types ──────────────────────────────────────────────────────────────────
interface ChannelCard {
  name: string
  url?: string
  status: 'healthy' | 'warning' | 'error'
  lastSync: string
  frequency: string
  items: number
  errors: number
}

interface QueueItem {
  itemNo: string
  description: string
  action: string
  channel: string
  status: 'Pending' | 'Complete' | 'Failed' | 'In Progress'
  lastAttempt: string
  error?: string
}

interface ErrorLog {
  id: string
  channel: string
  item: string
  message: string
  timestamp: string
}

// ── Static data ────────────────────────────────────────────────────────────
const CHANNELS: ChannelCard[] = [
  { name: 'Website', url: 'novapos.com', status: 'healthy', lastSync: '2 min ago', frequency: 'Every 5 min', items: 2847, errors: 0 },
  { name: 'Mobile App', status: 'healthy', lastSync: '2 min ago', frequency: 'Every 5 min', items: 2847, errors: 0 },
  { name: 'Amazon', status: 'warning', lastSync: '45 min ago', frequency: 'Every 15 min', items: 1204, errors: 3 },
  { name: 'eBay', status: 'error', lastSync: '2 hrs ago', frequency: 'Every 30 min', items: 847, errors: 12 },
]

const QUEUE_ITEMS: QueueItem[] = [
  { itemNo: '1000', description: 'Widget Assembly A100',   action: 'Price Update',     channel: 'Amazon',   status: 'Pending',     lastAttempt: '—',       error: undefined },
  { itemNo: '1001', description: 'Motor Housing B200',     action: 'Inventory Update', channel: 'Website',  status: 'Complete',    lastAttempt: '2 min',   error: undefined },
  { itemNo: '1002', description: 'Control Panel C300',     action: 'New Listing',      channel: 'eBay',     status: 'Failed',      lastAttempt: '2 hrs',   error: 'API timeout' },
  { itemNo: '1003', description: 'Sensor Module D400',     action: 'Price Update',     channel: 'Website',  status: 'Complete',    lastAttempt: '5 min',   error: undefined },
  { itemNo: '1004', description: 'Cable Assembly E500',    action: 'Inventory Update', channel: 'Amazon',   status: 'Pending',     lastAttempt: '—',       error: undefined },
  { itemNo: '1005', description: 'Power Supply F600',      action: 'Price Update',     channel: 'eBay',     status: 'Failed',      lastAttempt: '2 hrs',   error: 'Auth error 401' },
  { itemNo: '1006', description: 'Display Unit G700',      action: 'New Listing',      channel: 'Amazon',   status: 'In Progress', lastAttempt: '1 min',   error: undefined },
  { itemNo: '1007', description: 'PCB Board H800',         action: 'Inventory Update', channel: 'Mobile',   status: 'Complete',    lastAttempt: '3 min',   error: undefined },
  { itemNo: '1008', description: 'Fan Assembly I900',      action: 'Price Update',     channel: 'Website',  status: 'Pending',     lastAttempt: '—',       error: undefined },
  { itemNo: '1009', description: 'Battery Pack J100',      action: 'New Listing',      channel: 'eBay',     status: 'Failed',      lastAttempt: '3 hrs',   error: 'Listing limit reached' },
  { itemNo: '1010', description: 'Switch Panel K200',      action: 'Inventory Update', channel: 'Amazon',   status: 'Complete',    lastAttempt: '10 min',  error: undefined },
  { itemNo: '1011', description: 'Relay Module L300',      action: 'Price Update',     channel: 'Website',  status: 'Complete',    lastAttempt: '12 min',  error: undefined },
]

const ERROR_LOG: ErrorLog[] = [
  { id: '1',  channel: 'eBay',   item: '1002', message: 'API timeout after 30s',       timestamp: 'Apr 22 08:15' },
  { id: '2',  channel: 'eBay',   item: '1005', message: 'Authentication error 401',    timestamp: 'Apr 22 08:15' },
  { id: '3',  channel: 'eBay',   item: '1009', message: 'Listing limit reached (250)', timestamp: 'Apr 22 07:40' },
  { id: '4',  channel: 'Amazon', item: '1000', message: 'Rate limit exceeded',         timestamp: 'Apr 22 09:45' },
  { id: '5',  channel: 'Amazon', item: '1004', message: 'Invalid UPC code',            timestamp: 'Apr 22 09:44' },
  { id: '6',  channel: 'Amazon', item: '1006', message: 'Category not permitted',      timestamp: 'Apr 22 09:43' },
  { id: '7',  channel: 'eBay',   item: '1012', message: 'Image URL unreachable',       timestamp: 'Apr 22 07:20' },
  { id: '8',  channel: 'eBay',   item: '1013', message: 'Description length exceeded', timestamp: 'Apr 22 07:18' },
  { id: '9',  channel: 'eBay',   item: '1014', message: 'Price below minimum threshold', timestamp: 'Apr 22 07:10' },
  { id: '10', channel: 'eBay',   item: '1015', message: 'Condition field required',    timestamp: 'Apr 22 06:55' },
]

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_ICON: Record<string, string> = { healthy: '✅', warning: '⚠️', error: '❌' }
const STATUS_COLOR: Record<string, string> = {
  healthy: 'text-emerald-400',
  warning: 'text-amber-400',
  error:   'text-red-400',
}
const QUEUE_STATUS_BADGE: Record<string, string> = {
  'Pending':     'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Complete':    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Failed':      'bg-red-500/15 text-red-300 border-red-500/30',
  'In Progress': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
}

// ── Component ──────────────────────────────────────────────────────────────
export default function EcommerceSyncPage() {
  const [channels, setChannels] = useState<ChannelCard[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ecommerce/sync')
      .then(r => r.json())
      .then(() => {
        setChannels(CHANNELS)
        setQueue(QUEUE_ITEMS)
        setErrors(ERROR_LOG)
        setLoading(false)
      })
      .catch(() => {
        setChannels(CHANNELS)
        setQueue(QUEUE_ITEMS)
        setErrors(ERROR_LOG)
        setLoading(false)
      })
  }, [])

  const handleSyncChannel = (name: string) => {
    setSyncing(name)
    setTimeout(() => setSyncing(null), 2000)
  }

  const handleRetry = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }

  const actions = (
    <>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors" onClick={() => handleSyncChannel('All')}>
        {syncing === 'All' ? 'Syncing…' : 'Sync All Channels'}
      </button>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">
        Publish Products
      </button>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">
        View Errors
      </button>
    </>
  )

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0d0e24' }}>
      <TopBar
        title="Channel Sync"
        breadcrumb={[{ label: 'eCommerce', href: '/ecommerce' }, { label: 'Channel Sync', href: '/ecommerce/sync' }]}
        actions={actions}
      />

      <main className="flex-1 p-6 space-y-6">

        {/* Channel Status Cards */}
        <section>
          <p className="text-[11px] text-[#94a3b8] uppercase tracking-widest mb-3">Channel Status</p>
          <div className="grid grid-cols-4 gap-4">
            {channels.map(ch => (
              <div key={ch.name} className="rounded-lg p-4 space-y-3" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#e2e8f0] font-medium text-[13px]">{ch.name}</p>
                    {ch.url && <p className="text-[#94a3b8] text-[11px]">{ch.url}</p>}
                  </div>
                  <span className="text-lg">{STATUS_ICON[ch.status]}</span>
                </div>
                <div>
                  <span className={`text-[12px] font-medium capitalize ${STATUS_COLOR[ch.status]}`}>
                    {ch.status.charAt(0).toUpperCase() + ch.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-[#94a3b8]">
                  <div className="flex justify-between">
                    <span>Last sync</span>
                    <span className="text-[#e2e8f0]">{ch.lastSync}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequency</span>
                    <span className="text-[#e2e8f0]">{ch.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items synced</span>
                    <span className="text-[#e2e8f0] tabular-nums">{ch.items.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors</span>
                    <span className={ch.errors > 0 ? 'text-red-400 font-medium' : 'text-[#e2e8f0]'} >{ch.errors}</span>
                  </div>
                </div>
                <button
                  className="w-full px-2 py-1.5 rounded-md text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  onClick={() => handleSyncChannel(ch.name)}
                >
                  {syncing === ch.name ? 'Syncing…' : 'Sync Now'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Sync Queue */}
        <section>
          <p className="text-[11px] text-[#94a3b8] uppercase tracking-widest mb-3">Sync Queue ({queue.length})</p>
          <div className="rounded-lg overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
            {loading ? (
              <div className="py-12 text-center text-[#94a3b8] text-sm">Loading queue…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                      {['Item No.', 'Description', 'Action', 'Channel', 'Status', 'Last Attempt', 'Error'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item, idx) => (
                      <tr
                        key={item.itemNo}
                        className="hover:bg-[rgba(99,102,241,0.05)] transition-colors"
                        style={{ borderBottom: idx < queue.length - 1 ? '1px solid rgba(99,102,241,0.08)' : undefined }}
                      >
                        <td className="px-4 py-3 font-mono text-indigo-400 text-[12px]">{item.itemNo}</td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{item.description}</td>
                        <td className="px-4 py-3 text-[#94a3b8]">{item.action}</td>
                        <td className="px-4 py-3 text-[#94a3b8]">{item.channel}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${QUEUE_STATUS_BADGE[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#94a3b8] tabular-nums">{item.lastAttempt}</td>
                        <td className="px-4 py-3 text-red-400 text-[11px]">{item.error ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Sync Error Log FastTab */}
        <details className="rounded-lg overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
          <summary className="px-4 py-3 cursor-pointer text-[13px] font-medium text-[#e2e8f0] flex items-center justify-between select-none hover:bg-[rgba(99,102,241,0.05)] transition-colors">
            <span>Sync Error Log <span className="ml-2 text-[11px] text-red-400">({errors.length} errors)</span></span>
            <span className="text-[#94a3b8] text-xs">▼</span>
          </summary>
          <div className="px-4 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                    {['Channel', 'Item', 'Error Message', 'Timestamp', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {errors.map((e, idx) => (
                    <tr
                      key={e.id}
                      className="hover:bg-[rgba(99,102,241,0.05)]"
                      style={{ borderBottom: idx < errors.length - 1 ? '1px solid rgba(99,102,241,0.08)' : undefined }}
                    >
                      <td className="px-3 py-2 text-amber-400">{e.channel}</td>
                      <td className="px-3 py-2 font-mono text-indigo-400">{e.item}</td>
                      <td className="px-3 py-2 text-red-400">{e.message}</td>
                      <td className="px-3 py-2 text-[#94a3b8] tabular-nums">{e.timestamp}</td>
                      <td className="px-3 py-2">
                        <button
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                          onClick={() => handleRetry(e.id)}
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* Product Publishing Rules FastTab */}
        <details className="rounded-lg overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
          <summary className="px-4 py-3 cursor-pointer text-[13px] font-medium text-[#e2e8f0] flex items-center justify-between select-none hover:bg-[rgba(99,102,241,0.05)] transition-colors">
            <span>Product Publishing Rules</span>
            <span className="text-[#94a3b8] text-xs">▼</span>
          </summary>
          <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-4">
            {[
              {
                channel: 'Website',
                icon: '🌐',
                rules: [
                  'All Active items published',
                  'Excludes: In Store Only flag',
                  'Real-time inventory sync',
                  'Full product descriptions',
                ],
              },
              {
                channel: 'Mobile App',
                icon: '📱',
                rules: [
                  'Same catalog as Website',
                  'Optimized image sizes',
                  'Push notification on restock',
                  'Mobile-only flash deals enabled',
                ],
              },
              {
                channel: 'Amazon',
                icon: '📦',
                rules: [
                  'Finished Goods category only',
                  'Price markup: 15%',
                  'ASIN mapping required',
                  'FBA fulfillment preferred',
                ],
              },
              {
                channel: 'eBay',
                icon: '🏷️',
                rules: [
                  'Clearance items only',
                  'Auction + Buy It Now format',
                  'Min price = cost + 10%',
                  'Auto-relist after 30 days',
                ],
              },
            ].map(r => (
              <div key={r.channel} className="rounded-md p-3" style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p className="text-[#e2e8f0] font-medium text-[13px] mb-2">{r.icon} {r.channel}</p>
                <ul className="space-y-1">
                  {r.rules.map(rule => (
                    <li key={rule} className="text-[11px] text-[#94a3b8] flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">›</span>
                      {rule}
                    </li>
                  ))}
                </ul>
                <button className="mt-3 px-2 py-1 rounded text-[11px] font-medium bg-[rgba(99,102,241,0.15)] hover:bg-[rgba(99,102,241,0.3)] text-indigo-300 border border-[rgba(99,102,241,0.3)] transition-colors">
                  Edit Rules
                </button>
              </div>
            ))}
          </div>
        </details>

      </main>
    </div>
  )
}
