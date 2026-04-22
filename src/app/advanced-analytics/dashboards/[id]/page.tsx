'use client'
import { useState, useEffect, use } from 'react'
import { Plus, Save, Trash2, ChevronUp, ChevronDown, X, Check } from 'lucide-react'

type Widget = { id: string; widgetType: string; title: string; dataSource: string; config: string; position: number; width: string }
type Dashboard = { id: string; name: string; isDefault: boolean; widgets: Widget[] }

const WIDGET_TYPES = ['metric-card', 'bar-chart', 'line-chart', 'pie-chart', 'table']
const DATA_SOURCES = [
  { value: 'sales-by-day', label: 'Sales by Day', desc: 'Daily revenue + transaction trend' },
  { value: 'top-products', label: 'Top Products', desc: 'Best-selling products by revenue' },
  { value: 'sales-by-category', label: 'Sales by Category', desc: '8 product categories breakdown' },
  { value: 'sales-by-hour', label: 'Sales by Hour', desc: 'Hourly transaction volume' },
  { value: 'sales-by-store', label: 'Sales by Store', desc: 'Per-location performance' },
  { value: 'employee-performance', label: 'Employee Performance', desc: 'Revenue per associate' },
  { value: 'inventory-health', label: 'Inventory Health', desc: 'Stock levels and risk' },
]
const WIDTHS = ['1/4', '1/2', '3/4', 'full']

function useDataSource(source: string) {
  const [data, setData] = useState<Record<string, number | string>[]>([])
  useEffect(() => {
    const map: Record<string, string> = {
      'sales-by-day': '/api/analytics/data/sales-trend?days=30',
      'top-products': '/api/analytics/data/top-products?limit=8',
      'sales-by-category': '/api/analytics/data/sales-by-category',
      'sales-by-hour': '/api/analytics/data/sales-by-hour',
      'sales-by-store': '/api/analytics/data/sales-by-store',
      'employee-performance': '/api/analytics/data/employee-performance',
      'inventory-health': '/api/analytics/data/inventory-health',
    }
    const url = map[source]
    if (url) fetch(url).then(r => r.json()).then(setData)
  }, [source])
  return data
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

function BarChart({ data, labelKey, valueKey }: { data: Record<string, number | string>[]; labelKey: string; valueKey: string }) {
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0)) || 1
  return (
    <div className="space-y-1.5 mt-2">
      {data.slice(0, 8).map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-24 truncate shrink-0">{String(d[labelKey] ?? '')}</span>
          <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(Number(d[valueKey]) / max) * 100}%` }} />
          </div>
          <span className="text-xs text-zinc-400 w-16 text-right shrink-0">
            {Number(d[valueKey]) >= 1000 ? `$${(Number(d[valueKey]) / 1000).toFixed(1)}K` : String(d[valueKey])}
          </span>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data, valueKey }: { data: Record<string, number | string>[]; valueKey: string }) {
  if (!data.length) return null
  const W = 400, H = 100, PAD = 8
  const vals = data.map(d => Number(d[valueKey]) || 0)
  const min = Math.min(...vals), max = Math.max(...vals)
  const range = max - min || 1
  const pts = vals.map((v, i) => {
    const x = PAD + (i / Math.max(vals.length - 1, 1)) * (W - PAD * 2)
    const y = PAD + ((max - v) / range) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24 mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`lg-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={`M${pts[0]} L${pts.join(' L')} L${PAD + (W - PAD * 2)},${H} L${PAD},${H} Z`} fill={`url(#lg-${valueKey})`} />
      <polyline points={pts.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PieChart({ data, labelKey, valueKey }: { data: Record<string, number | string>[]; labelKey: string; valueKey: string }) {
  const slices = data.slice(0, 8)
  const total = slices.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0) || 1
  let cum = 0
  const gradient = slices.map((d, i) => {
    const pct = (Number(d[valueKey]) / total) * 100
    const from = cum, to = cum + pct
    cum += pct
    return `${PIE_COLORS[i]} ${from.toFixed(1)}% ${to.toFixed(1)}%`
  }).join(', ')
  return (
    <div className="flex gap-4 mt-2 items-center">
      <div className="w-24 h-24 rounded-full shrink-0" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="space-y-1 flex-1">
        {slices.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
            <span className="text-xs text-zinc-400 truncate flex-1">{String(d[labelKey] ?? '')}</span>
            <span className="text-xs text-zinc-500">{((Number(d[valueKey]) / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniTable({ data }: { data: Record<string, number | string>[] }) {
  if (!data.length) return null
  const keys = Object.keys(data[0]).slice(0, 4)
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="border-b border-zinc-800">{keys.map(k => <th key={k} className="text-left text-zinc-500 pb-1.5 pr-3 font-medium capitalize">{k}</th>)}</tr></thead>
        <tbody>
          {data.slice(0, 6).map((row, i) => (
            <tr key={i} className="border-b border-zinc-900">
              {keys.map(k => <td key={k} className="py-1.5 pr-3 text-zinc-300">{typeof row[k] === 'number' && row[k] > 1000 ? `$${(Number(row[k]) / 1000).toFixed(1)}K` : String(row[k] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MetricCard({ data, valueKey }: { data: Record<string, number | string>[]; valueKey: string }) {
  const val = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0)
  return (
    <div className="mt-2">
      <div className="text-3xl font-bold text-zinc-100">
        {val >= 1_000_000 ? `$${(val / 1_000_000).toFixed(2)}M` : val >= 1_000 ? `$${(val / 1_000).toFixed(1)}K` : val.toLocaleString()}
      </div>
      <div className="text-xs text-zinc-500 mt-1">Aggregated · {data.length} data points</div>
    </div>
  )
}

function WidgetContent({ widget }: { widget: Widget }) {
  const data = useDataSource(widget.dataSource)
  if (!data.length) return <div className="text-zinc-600 text-xs mt-2">Loading...</div>
  const keys = Object.keys(data[0])
  const valueKey = keys.find(k => typeof data[0][k] === 'number') ?? keys[1] ?? ''
  const labelKey = keys[0] ?? ''
  switch (widget.widgetType) {
    case 'metric-card': return <MetricCard data={data} valueKey={valueKey} />
    case 'bar-chart': return <BarChart data={data} labelKey={labelKey} valueKey={valueKey} />
    case 'line-chart': return <LineChart data={data} valueKey={valueKey} />
    case 'pie-chart': return <PieChart data={data} labelKey={labelKey} valueKey={valueKey} />
    default: return <MiniTable data={data} />
  }
}

function AddWidgetModal({ onAdd, onClose }: { onAdd: (w: Partial<Widget>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ widgetType: 'bar-chart', title: '', dataSource: 'sales-by-category', width: '1/2' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-zinc-100">Add Widget</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Widget Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="My Widget"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Widget Type</label>
            <select value={form.widgetType} onChange={e => set('widgetType', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
              {WIDGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Data Source</label>
            <select value={form.dataSource} onChange={e => set('dataSource', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
              {DATA_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Width</label>
            <div className="flex gap-2">
              {WIDTHS.map(w => (
                <button key={w} onClick={() => set('width', w)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${form.width === w ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm hover:text-zinc-100 transition-colors">Cancel</button>
          <button onClick={() => { if (form.title) onAdd(form) }}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">Add Widget</button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/analytics/dashboards/${id}`).then(r => r.json()).then(d => { setDashboard(d); setNameVal(d.name); setLoading(false) })
  }, [id])

  const saveName = async () => {
    if (!nameVal.trim() || !dashboard) return
    await fetch(`/api/analytics/dashboards/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameVal.trim() }) })
    setDashboard(d => d ? { ...d, name: nameVal.trim() } : d)
    setEditingName(false)
  }

  const addWidget = async (form: Partial<Widget>) => {
    const res = await fetch(`/api/analytics/dashboards/${id}/widgets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const w = await res.json()
    setDashboard(d => d ? { ...d, widgets: [...d.widgets, w] } : d)
    setShowAddModal(false)
  }

  const deleteWidget = async (wid: string) => {
    await fetch(`/api/analytics/dashboards/${id}/widgets/${wid}`, { method: 'DELETE' })
    setDashboard(d => d ? { ...d, widgets: d.widgets.filter(w => w.id !== wid) } : d)
  }

  const moveWidget = async (wid: string, dir: 'up' | 'down') => {
    if (!dashboard) return
    const sorted = [...dashboard.widgets].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(w => w.id === wid)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === sorted.length - 1) return
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const [a, b] = [sorted[idx], sorted[swapIdx]]
    await Promise.all([
      fetch(`/api/analytics/dashboards/${id}/widgets/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: b.position }) }),
      fetch(`/api/analytics/dashboards/${id}/widgets/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: a.position }) }),
    ])
    setDashboard(d => d ? { ...d, widgets: d.widgets.map(w => w.id === a.id ? { ...a, position: b.position } : w.id === b.id ? { ...b, position: a.position } : w) } : d)
  }

  const changeWidth = async (wid: string, width: string) => {
    await fetch(`/api/analytics/dashboards/${id}/widgets/${wid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ width }) })
    setDashboard(d => d ? { ...d, widgets: d.widgets.map(w => w.id === wid ? { ...w, width } : w) } : d)
  }

  const saveLayout = async () => {
    setSaving(true)
    await fetch(`/api/analytics/dashboards/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: JSON.stringify(dashboard?.widgets.map(w => ({ id: w.id, position: w.position, width: w.width }))) }),
    })
    setSaving(false)
  }

  const widthClass = (w: string) => ({ '1/4': 'lg:col-span-1', '1/2': 'lg:col-span-2', '3/4': 'lg:col-span-3', 'full': 'lg:col-span-4' }[w] ?? 'lg:col-span-2')

  if (loading) return <div className="p-6 text-zinc-500 text-sm">Loading dashboard...</div>
  if (!dashboard) return <div className="p-6 text-red-400 text-sm">Dashboard not found.</div>

  const sorted = [...dashboard.widgets].sort((a, b) => a.position - b.position)

  return (
    <>
      {showAddModal && <AddWidgetModal onAdd={addWidget} onClose={() => setShowAddModal(false)} />}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {editingName ? (
              <>
                <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                  className="text-2xl font-bold bg-transparent border-b border-blue-500 text-zinc-100 outline-none" />
                <button onClick={saveName} className="text-blue-400 hover:text-blue-300"><Check className="w-5 h-5" /></button>
                <button onClick={() => setEditingName(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
              </>
            ) : (
              <h1 className="text-2xl font-bold text-zinc-100 cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setEditingName(true)}>
                {dashboard.name}
              </h1>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Widget
            </button>
            <button onClick={saveLayout}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-colors">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-xl">
            <div className="text-zinc-500 text-sm mb-3">No widgets yet</div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors mx-auto">
              <Plus className="w-4 h-4" /> Add Your First Widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {sorted.map((widget, idx) => (
              <div key={widget.id} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 ${widthClass(widget.width)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-100">{widget.title}</span>
                  <div className="flex items-center gap-0.5">
                    <select value={widget.width} onChange={e => changeWidth(widget.id, e.target.value)}
                      className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 rounded px-1 py-0.5 outline-none mr-1">
                      {WIDTHS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <button onClick={() => moveWidget(widget.id, 'up')} disabled={idx === 0}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveWidget(widget.id, 'down')} disabled={idx === sorted.length - 1}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteWidget(widget.id)} className="p-1 hover:bg-red-500/10 rounded text-zinc-600 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-zinc-600 mb-2">{widget.widgetType} · {widget.dataSource}</div>
                <WidgetContent widget={widget} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
