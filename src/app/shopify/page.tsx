import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ShoppingBag, Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    connected:    { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Connected' },
    syncing:      { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Syncing' },
    error:        { cls: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Error' },
    disconnected: { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: 'Disconnected' },
  }
  const s = map[status] ?? map.disconnected
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {status === 'connected' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'syncing' && <RefreshCw className="w-3 h-3 animate-spin" />}
      {status === 'error' && <AlertCircle className="w-3 h-3" />}
      {status === 'disconnected' && <XCircle className="w-3 h-3" />}
      {s.label}
    </span>
  )
}

export default async function ShopifyPage() {
  const stores = await prisma.shopifyStore.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      store: { select: { name: true } },
      syncLogs: { orderBy: { startedAt: 'desc' }, take: 1 },
    },
  })

  const connected = stores.filter(s => s.status === 'connected').length
  const syncing = stores.filter(s => s.status === 'syncing').length
  const errors = stores.filter(s => s.status === 'error').length
  const pendingOrders = stores.reduce((acc, s) => acc + s.orderCount, 0)

  const kpis = [
    { label: 'Connected Stores', value: connected, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Last Sync', value: stores[0]?.lastSyncAt ? new Date(stores[0].lastSyncAt).toLocaleTimeString() : '—', icon: Clock, color: 'text-blue-400' },
    { label: 'Pending Orders', value: pendingOrders, icon: ShoppingBag, color: 'text-violet-400' },
    { label: 'Sync Errors', value: errors, icon: AlertCircle, color: 'text-red-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            Shopify Integration
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage connected Shopify stores and sync settings</p>
        </div>
        <Link
          href="/shopify/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Connect New Store
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Stores List */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/50">
          <h2 className="text-sm font-semibold text-zinc-300">Connected Stores ({stores.length})</h2>
        </div>

        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingBag className="w-10 h-10 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No Shopify stores connected yet</p>
            <Link href="/shopify/new" className="text-emerald-400 text-sm hover:underline">Connect your first store</Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {stores.map(s => (
              <div key={s.id} className="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-100 truncate">{s.shopDomain}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500">
                      {s.store && <span>{s.store.name}</span>}
                      <span>{s.productCount} products</span>
                      <span>{s.orderCount} orders</span>
                      {s.lastSyncAt && <span>Last sync: {new Date(s.lastSyncAt).toLocaleString()}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
                    {s.syncProducts && <span className="px-1.5 py-0.5 bg-zinc-800 rounded">Products</span>}
                    {s.syncOrders && <span className="px-1.5 py-0.5 bg-zinc-800 rounded">Orders</span>}
                    {s.syncCustomers && <span className="px-1.5 py-0.5 bg-zinc-800 rounded">Customers</span>}
                    {s.syncInventory && <span className="px-1.5 py-0.5 bg-zinc-800 rounded">Inventory</span>}
                  </div>
                  <Link
                    href={`/shopify/${s.id}`}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
