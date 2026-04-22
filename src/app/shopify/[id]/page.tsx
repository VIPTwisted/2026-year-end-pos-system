import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShoppingBag, ArrowLeft, RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import ShopifyStoreActions from './ShopifyStoreActions'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    connected:    { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Connected' },
    syncing:      { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Syncing' },
    error:        { cls: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Error' },
    disconnected: { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: 'Disconnected' },
    success:      { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Success' },
    running:      { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Running' },
  }
  const s = map[status] ?? map.disconnected
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  )
}

export default async function ShopifyStorePage({ params }: { params: { id: string } }) {
  const store = await prisma.shopifyStore.findUnique({
    where: { id: params.id },
    include: {
      store: { select: { id: true, name: true } },
      syncLogs: { orderBy: { startedAt: 'desc' }, take: 20 },
    },
  })
  if (!store) notFound()

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6 space-y-6">
      <div>
        <Link href="/shopify" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Shopify
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{store.shopDomain}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={store.status} />
                {store.store && <span className="text-xs text-zinc-500">{store.store.name}</span>}
              </div>
            </div>
          </div>
          <ShopifyStoreActions storeId={store.id} status={store.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Products', value: store.productCount },
          { label: 'Customers', value: store.customerCount },
          { label: 'Orders', value: store.orderCount },
        ].map(item => (
          <div key={item.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-zinc-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Info */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Connection Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Domain</span>
              <span className="text-zinc-200 font-mono">{store.shopDomain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Access Token</span>
              <span className="text-zinc-200">{store.accessToken ? '●●●●●●●●' : 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Webhook Secret</span>
              <span className="text-zinc-200">{store.webhookSecret ? '●●●●●●●●' : 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Last Sync</span>
              <span className="text-zinc-200">{store.lastSyncAt ? new Date(store.lastSyncAt).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Sync Settings</h2>
          <div className="space-y-3">
            {[
              { label: 'Products', val: store.syncProducts },
              { label: 'Customers', val: store.syncCustomers },
              { label: 'Orders', val: store.syncOrders },
              { label: 'Inventory', val: store.syncInventory },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{item.label}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${item.val ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {item.val ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {item.val ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Logs */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/50">
          <h2 className="text-sm font-semibold text-zinc-300">Sync Log</h2>
        </div>
        {store.syncLogs.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-zinc-600 text-sm">No sync history yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Records</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Started</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Ended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {store.syncLogs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-3 text-zinc-300 capitalize">{log.syncType}</td>
                  <td className="px-5 py-3"><StatusBadge status={log.status} /></td>
                  <td className="px-5 py-3 text-zinc-400">{log.recordsSync}</td>
                  <td className="px-5 py-3 text-zinc-500">{new Date(log.startedAt).toLocaleString()}</td>
                  <td className="px-5 py-3 text-zinc-500">{log.endedAt ? new Date(log.endedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
