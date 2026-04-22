'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, Monitor, Store, RefreshCw, Edit2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface CommerceStore {
  id: string
  storeNo: string
  name: string
  channelType: string
  currency: string
  taxGroup: string | null
  taxRate: number
  timeZone: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
  email: string | null
  statementMethod: string
  status: string
  terminalCount: number
  createdAt: string
  terminals: Terminal[]
}

interface Terminal {
  id: string
  terminalId: string
  name: string
  hardwareProfile: string | null
  screenLayout: string | null
  status: string
}

type Tab = 'general' | 'terminals' | 'statement'

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [store, setStore] = useState<CommerceStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<CommerceStore>>({})

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/commerce/stores/${id}`)
      if (!res.ok) { router.push('/commerce/stores'); return }
      const data = await res.json()
      setStore(data)
      setEditForm(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) load() }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/commerce/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const data = await res.json()
        setStore(prev => prev ? { ...prev, ...data } : prev)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Store" />
        <main className="flex-1 p-6 flex items-center justify-center text-zinc-600">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading store…
        </main>
      </>
    )
  }

  if (!store) return null

  return (
    <>
      <TopBar title={store.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/commerce/stores" className="hover:text-zinc-300">Stores</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">{store.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Store className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{store.name}</h1>
              <p className="text-xs font-mono text-zinc-500">{store.storeNo} · {store.channelType}</p>
            </div>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded border ${
              store.status === 'Active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
            }`}>{store.status}</span>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); setEditForm(store) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="xl:col-span-2 space-y-4">
            {/* FastTabs */}
            <div className="flex gap-0 border-b border-zinc-800">
              {(['general', 'terminals', 'statement'] as Tab[]).map(tab => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                    activeTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'general' && (
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="grid grid-cols-2 gap-4">
                    {editing ? (
                      <>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Store Name</label>
                          <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                            value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Status</label>
                          <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                            value={editForm.status ?? 'Active'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                          <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                            value={editForm.phone ?? ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Email</label>
                          <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                            value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                      </>
                    ) : (
                      <>
                        {[
                          ['Store Number', store.storeNo],
                          ['Channel Type', store.channelType],
                          ['Currency', store.currency],
                          ['Time Zone', store.timeZone],
                          ['Phone', store.phone ?? '—'],
                          ['Email', store.email ?? '—'],
                          ['Address', [store.address, store.city, store.state, store.zip].filter(Boolean).join(', ') || '—'],
                        ].map(([label, value]) => (
                          <div key={label as string}>
                            <p className="text-xs text-zinc-500">{label}</p>
                            <p className="text-sm text-zinc-200 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'terminals' && (
              <Card>
                <CardContent className="px-0 py-0">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-200">POS Terminals</h3>
                    <Link href={`/commerce/terminals/new?storeId=${store.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      + Add Terminal
                    </Link>
                  </div>
                  {store.terminals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
                      <Monitor className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">No terminals assigned to this store.</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-5 py-2">Terminal ID</th>
                          <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Name</th>
                          <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Hardware Profile</th>
                          <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.terminals.map(t => (
                          <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                            <td className="px-5 py-2.5">
                              <span className="font-mono text-xs bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded">{t.terminalId}</span>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-200">{t.name}</td>
                            <td className="px-4 py-2.5 text-zinc-500 text-xs">{t.hardwareProfile ?? '—'}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded border ${
                                t.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
                              }`}>{t.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'statement' && (
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">Statement Method</p>
                      <p className="text-sm text-zinc-200 mt-0.5">{store.statementMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Tax Group</p>
                      <p className="text-sm text-zinc-200 mt-0.5">{store.taxGroup ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Tax Rate</p>
                      <p className="text-sm text-zinc-200 mt-0.5">{store.taxRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* FactBox */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Store Facts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Terminals</span>
                    <span className="text-sm font-bold text-zinc-200">{store.terminals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Currency</span>
                    <span className="text-sm text-zinc-300">{store.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Tax Rate</span>
                    <span className="text-sm text-zinc-300">{store.taxRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Status</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      store.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
                    }`}>{store.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Created</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href={`/commerce/terminals/new?storeId=${store.id}`}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm transition-colors">
                    <Monitor className="w-4 h-4" /> Add Terminal
                  </Link>
                  <Link href="/commerce/cdx"
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" /> Run CDX Sync
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
