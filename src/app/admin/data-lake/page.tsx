'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Database, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

interface DataLakeExport {
  id: string
  exportName: string
  entities: string
  scheduleType: string
  status: string
  lastExportAt: string | null
  rowsExported: number
}

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const SCHEDULE_STYLES: Record<string, string> = {
  continuous: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  daily: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  weekly: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  manual: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

export default function DataLakePage() {
  const [exports, setExports] = useState<DataLakeExport[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/data-lake')
      .then(r => r.json())
      .then(d => { setExports(d); setLoading(false) })
  }, [])

  async function toggle(exp: DataLakeExport) {
    setToggling(exp.id)
    const newStatus = exp.status === 'active' ? 'inactive' : 'active'
    const res = await fetch(`/api/admin/data-lake/${exp.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setExports(prev => prev.map(e => e.id === exp.id ? { ...e, ...updated } : e))
    }
    setToggling(null)
  }

  const active = exports.filter(e => e.status === 'active').length
  const entitySet = new Set(exports.flatMap(e => e.entities.split(',').map(s => s.trim()).filter(Boolean)))
  const totalRows = exports.reduce((s, e) => s + e.rowsExported, 0)

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="Data Lake"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <Link href="/admin/data-lake/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus className="w-3 h-3" /> New Export
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Exports', value: active, color: 'text-emerald-400' },
            { label: 'Entities Tracked', value: entitySet.size, color: 'text-blue-400' },
            { label: 'Rows Exported', value: totalRows.toLocaleString(), color: 'text-violet-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Export Name</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Entities</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Schedule</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Last Run</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Rows</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                ) : exports.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-zinc-600">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />No exports configured
                  </td></tr>
                ) : exports.map(e => (
                  <tr key={e.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/data-lake/${e.id}`} className="font-medium text-zinc-200 hover:text-blue-400 transition-colors">
                        {e.exportName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {e.entities.split(',').map(ent => ent.trim()).filter(Boolean).slice(0, 3).map(ent => (
                          <span key={ent} className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">{ent}</span>
                        ))}
                        {e.entities.split(',').length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-600 border border-zinc-700">+{e.entities.split(',').length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border capitalize', SCHEDULE_STYLES[e.scheduleType] ?? SCHEDULE_STYLES.manual)}>
                        {e.scheduleType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border capitalize', STATUS_STYLES[e.status] ?? STATUS_STYLES.inactive)}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {e.lastExportAt ? new Date(e.lastExportAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">{e.rowsExported.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggle(e)} disabled={toggling === e.id}
                        className="ml-auto block text-zinc-400 hover:text-zinc-200 disabled:opacity-50 transition-colors">
                        {e.status === 'active'
                          ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                          : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
