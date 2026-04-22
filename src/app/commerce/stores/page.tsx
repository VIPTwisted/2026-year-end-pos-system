import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Store, Plus, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface CommerceStore {
  id: string
  storeNo: string
  name: string
  channelType: string
  currency: string
  taxGroup: string | null
  terminalCount: number
  status: string
}

async function getStores(): Promise<CommerceStore[]> {
  try {
    const rows = await prisma.$queryRaw<CommerceStore[]>`
      SELECT id, storeNo, name, channelType, currency, taxGroup, terminalCount, status
      FROM "CommerceStore"
      ORDER BY storeNo ASC
    `
    return rows
  } catch {
    return []
  }
}

export default async function CommerceStoresPage() {
  const stores = await getStores()

  return (
    <>
      <TopBar title="Stores" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Stores</h1>
            <p className="text-sm text-zinc-500">{stores.length} store(s) configured</p>
          </div>
          <Link href="/commerce/stores/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Store
          </Link>
        </div>

        {stores.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Store className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No stores configured yet.</p>
              <Link href="/commerce/stores/new" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">
                Create your first store
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-3">Store No.</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Name</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Channel Type</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Currency</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Tax Group</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Terminals</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
                      <th className="text-right px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map(store => (
                      <tr key={store.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-mono text-xs bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded">{store.storeNo}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/commerce/stores/${store.id}`} className="font-medium text-zinc-200 hover:text-indigo-400 transition-colors">
                            {store.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{store.channelType}</td>
                        <td className="px-4 py-3 text-zinc-400">{store.currency}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{store.taxGroup ?? '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-zinc-300">{store.terminalCount ?? 0}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            store.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
                          }`}>
                            {store.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/commerce/stores/${store.id}`}>
                            <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
