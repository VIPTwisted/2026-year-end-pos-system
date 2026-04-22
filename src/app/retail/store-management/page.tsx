'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Store, Monitor, DollarSign, AlertTriangle,
  Plus, Edit2, Tv2, ArrowLeftRight, FileBarChart, XCircle,
  Clock, MapPin, CheckCircle2, AlertCircle, Wrench,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoreRecord {
  id: string
  number: string
  name: string
  manager: string
  city: string
  state: string
  status: 'Open' | 'Closed' | 'Maintenance'
  openHours: string
  todaySales: number
  terminalsOnline: number
  terminalsTotal: number
}

interface Alert {
  id: string
  storeId: string
  storeNumber: string
  type: string
  message: string
  severity: 'warning' | 'error'
  time: string
}

interface ApiData {
  stores: StoreRecord[]
  kpis: {
    totalStores: number
    terminalsOnline: number
    terminalsTotal: number
    todayRevenue: number
    alertCount: number
  }
  alerts: Alert[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatusChip({ status }: { status: StoreRecord['status'] }) {
  if (status === 'Open')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> Open
      </span>
    )
  if (status === 'Maintenance')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
        <Wrench className="h-3 w-3" /> Maintenance
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700/60 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
      <XCircle className="h-3 w-3" /> Closed
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StoreManagementPage() {
  const [data, setData] = useState<ApiData | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/retail/store-management')
      .then(r => r.json())
      .then((d: ApiData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function toggleRow(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  if (loading) {
    return (
      <>
        <TopBar title="Retail Store Management" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-zinc-400 text-sm animate-pulse">Loading store data…</p>
        </main>
      </>
    )
  }

  const { stores = [], kpis, alerts = [] } = data ?? {}

  return (
    <>
      <TopBar title="Retail Store Management" />
      <main className="flex-1 overflow-auto p-6 space-y-6">

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Stores</p>
              <Store className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold text-zinc-100">{kpis?.totalStores}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Online Terminals</p>
              <Monitor className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {kpis?.terminalsOnline}
              <span className="text-lg font-normal text-zinc-500">/{kpis?.terminalsTotal}</span>
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Today's Revenue</p>
              <DollarSign className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold text-zinc-100">{fmt(kpis?.todayRevenue ?? 0)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Alerts</p>
              <AlertTriangle className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold text-red-400">{kpis?.alertCount}</p>
          </div>
        </div>

        {/* Action Ribbon */}
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors">
            <Plus className="h-3.5 w-3.5" /> New Store
          </button>
          <button disabled={selected.length !== 1} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors">
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </button>
          <button disabled={selected.length !== 1} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors">
            <Tv2 className="h-3.5 w-3.5" /> View Terminals
          </button>
          <button disabled={selected.length !== 1} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors">
            <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer Inventory
          </button>
          <button disabled={selected.length !== 1} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors">
            <FileBarChart className="h-3.5 w-3.5" /> Run Report
          </button>
          <button disabled={selected.length !== 1} className="inline-flex items-center gap-1.5 rounded-lg border border-red-900 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-40 transition-colors">
            <XCircle className="h-3.5 w-3.5" /> Close Store
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Store Table */}
          <div className="xl:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100">All Stores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Store #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Manager</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Hours</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Today's Sales</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">Terminals</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store, i) => (
                    <tr
                      key={store.id}
                      onClick={() => toggleRow(store.id)}
                      className={`cursor-pointer border-b border-zinc-800/60 transition-colors last:border-0 ${
                        selected.includes(store.id) ? 'bg-blue-600/10' : i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'
                      } hover:bg-zinc-800/50`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(store.id)}
                          onChange={() => toggleRow(store.id)}
                          className="accent-blue-500"
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-300">{store.number}</td>
                      <td className="px-4 py-3 font-medium text-zinc-100">{store.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{store.manager}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-zinc-400">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {store.city}, {store.state}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusChip status={store.status} /></td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                          <Clock className="h-3 w-3 shrink-0" />
                          {store.openHours}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-100">{fmt(store.todaySales)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${store.terminalsOnline === store.terminalsTotal ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {store.terminalsOnline}/{store.terminalsTotal}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Alerts + Store Map */}
          <div className="space-y-6">
            {/* Store Alerts */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-100">Store Alerts</h2>
                {alerts.length > 0 && (
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                    {alerts.length}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No active alerts</p>
                ) : alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`rounded-lg p-3 border ${
                      alert.severity === 'error'
                        ? 'border-red-900/50 bg-red-950/30'
                        : 'border-amber-900/50 bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200">{alert.type}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{alert.message}</p>
                        <p className="text-xs text-zinc-600 mt-1">Today {alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Map — CSS Grid */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-100">Store Network</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {stores.map(store => (
                  <div
                    key={store.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      store.status === 'Open'
                        ? 'border-emerald-900/50 bg-emerald-950/20'
                        : store.status === 'Maintenance'
                        ? 'border-amber-900/50 bg-amber-950/20'
                        : 'border-zinc-800 bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-medium text-zinc-400">#{store.number}</span>
                      <span className={`h-2 w-2 rounded-full ${
                        store.status === 'Open' ? 'bg-emerald-400' :
                        store.status === 'Maintenance' ? 'bg-amber-400' : 'bg-zinc-600'
                      }`} />
                    </div>
                    <p className="text-xs font-medium text-zinc-200 leading-tight">{store.city}</p>
                    <p className="text-xs text-zinc-500 mt-1">{fmt(store.todaySales)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
