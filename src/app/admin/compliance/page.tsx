'use client'
import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, Clock, CheckCircle, Plus, Edit, UserCheck, X, Download, FileText } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

interface ComplianceItem {
  id: string
  category: string
  description: string
  owner: string
  dueDate: string
  priority: string
  status: string
  riskLevel: string
  likelihood: number
  impact: number
}

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  'Open': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Pending Review': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Closed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const PRIORITY_STYLES: Record<string, string> = {
  'Critical': 'bg-red-500/10 text-red-400 border-red-500/20',
  'High': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Low': 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

const RISK_STYLES: Record<string, string> = {
  'High': 'text-red-400',
  'Medium': 'text-yellow-400',
  'Low': 'text-emerald-400',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Financial': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Data Privacy': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Tax': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Employment': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Safety': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Environmental': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

// 5×5 risk matrix zone color
function riskZoneColor(likelihood: number, impact: number): string {
  const score = likelihood * impact
  if (score >= 16) return '#ef4444'
  if (score >= 9) return '#f97316'
  if (score >= 4) return '#eab308'
  return '#22c55e'
}

function RiskMatrix({ items }: { items: ComplianceItem[] }) {
  const activeItems = items.filter(i => i.status !== 'Closed')
  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[280px]">
      {/* Background grid zones */}
      {[1, 2, 3, 4, 5].map(impact =>
        [1, 2, 3, 4, 5].map(likelihood => {
          const x = (likelihood - 1) * 46 + 30
          const y = (5 - impact) * 46 + 10
          const score = likelihood * impact
          const fill = score >= 16 ? '#ef444420' : score >= 9 ? '#f9731620' : score >= 4 ? '#eab30820' : '#22c55e20'
          const stroke = score >= 16 ? '#ef444440' : score >= 9 ? '#f9731640' : score >= 4 ? '#eab30840' : '#22c55e40'
          return (
            <rect key={`${likelihood}-${impact}`} x={x} y={y} width={44} height={44}
              fill={fill} stroke={stroke} strokeWidth={0.5} rx={2} />
          )
        })
      )}
      {/* Y axis label */}
      <text x={12} y={140} fontSize={9} fill="#71717a" textAnchor="middle" transform="rotate(-90 12 140)">Impact</text>
      {/* X axis label */}
      <text x={140} y={257} fontSize={9} fill="#71717a" textAnchor="middle">Likelihood</text>
      {/* Axis ticks */}
      {[1, 2, 3, 4, 5].map(n => (
        <g key={n}>
          <text x={22} y={(5 - n) * 46 + 36} fontSize={8} fill="#52525b" textAnchor="middle">{n}</text>
          <text x={(n - 1) * 46 + 52} y={252} fontSize={8} fill="#52525b" textAnchor="middle">{n}</text>
        </g>
      ))}
      {/* Dots for active items */}
      {activeItems.map((item, idx) => {
        const cx = (item.likelihood - 1) * 46 + 30 + 22
        const cy = (5 - item.impact) * 46 + 10 + 22
        const color = riskZoneColor(item.likelihood, item.impact)
        return (
          <g key={item.id}>
            <circle cx={cx} cy={cy} r={7} fill={color} fillOpacity={0.85} />
            <text x={cx} y={cy + 3} fontSize={7} fill="white" textAnchor="middle" fontWeight="bold">
              {idx + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    category: 'Financial', description: '', owner: '', dueDate: '', priority: 'Medium',
    status: 'Open', riskLevel: 'Medium', likelihood: 2, impact: 2,
  })

  useEffect(() => {
    fetch('/api/admin/compliance').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }, [])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function createItem() {
    const res = await fetch('/api/admin/compliance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) {
      const item = await res.json()
      setItems(prev => [item, ...prev])
      setShowModal(false)
    }
  }

  const open = items.filter(i => i.status === 'Open').length
  const critical = items.filter(i => i.priority === 'Critical' && i.status !== 'Closed').length
  const dueThisWeek = items.filter(i => {
    if (i.status === 'Closed') return false
    const d = new Date(i.dueDate)
    const now = new Date()
    const week = new Date(now.getTime() + 7 * 86400000)
    return d >= now && d <= week
  }).length
  const closedThisMonth = items.filter(i => i.status === 'Closed').length

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
      <TopBar
        title="Compliance Management"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
              <Plus className="w-3 h-3" /> New Item
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Edit className="w-3 h-3" /> Edit
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <UserCheck className="w-3 h-3" /> Assign
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <CheckCircle className="w-3 h-3" /> Close
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Download className="w-3 h-3" /> Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <FileText className="w-3 h-3" /> Generate Report
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI tiles */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Open Issues', value: open, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Critical Issues', value: critical, icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', highlight: true },
            { label: 'Due This Week', value: dueThisWeek, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Closed This Month', value: closedThisMonth, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(k => (
            <div key={k.label}
              className={cn('bg-[#16213e] border rounded-xl p-4', k.highlight ? 'border-red-500/30' : 'border-zinc-800/50')}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className={cn('text-3xl font-bold', k.highlight ? 'text-red-400' : 'text-zinc-100')}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Risk Matrix + Legend row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-zinc-300 mb-3 uppercase tracking-widest">Risk Matrix</h3>
            <RiskMatrix items={items} />
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {[['#22c55e', 'Low'], ['#eab308', 'Medium'], ['#f97316', 'High'], ['#ef4444', 'Critical']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c as string }} />
                  <span className="text-[10px] text-zinc-500">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Item index for matrix */}
          <div className="col-span-2 bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 overflow-y-auto max-h-[340px]">
            <h3 className="text-xs font-semibold text-zinc-300 mb-3 uppercase tracking-widest">Active Items Index</h3>
            <div className="space-y-1.5">
              {items.filter(i => i.status !== 'Closed').map((item, idx) => (
                <div key={item.id} className="flex items-start gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ background: riskZoneColor(item.likelihood, item.impact), color: 'white' }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-300 leading-tight block">{item.description}</span>
                    <span className="text-zinc-600">{item.id} · {item.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance items table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Compliance Items</span>
            <span className="text-xs text-zinc-600">{items.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-8 px-4 py-3"><input type="checkbox" className="accent-blue-500" /></th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Item #</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Category</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Description</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Owner</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Priority</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={9} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                ) : items.map(item => (
                  <tr key={item.id}
                    className={cn('hover:bg-zinc-900/30 transition-colors cursor-pointer', selected.has(item.id) && 'bg-blue-500/5')}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)} className="accent-blue-500" />
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{item.id}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', CATEGORY_COLORS[item.category] ?? '')}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.owner}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', PRIORITY_STYLES[item.priority] ?? '')}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', STATUS_STYLES[item.status] ?? '')}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('font-semibold', RISK_STYLES[item.riskLevel] ?? 'text-zinc-400')}>{item.riskLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl p-6 w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">New Compliance Item</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Description', key: 'description', type: 'textarea' },
                { label: 'Owner', key: 'owner', type: 'text' },
                { label: 'Due Date', key: 'dueDate', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 resize-none"
                      value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  ) : (
                    <input type={f.type} className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200"
                      value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  )}
                </div>
              ))}
              {[
                { label: 'Category', key: 'category', opts: ['Financial', 'Data Privacy', 'Tax', 'Employment', 'Safety', 'Environmental'] },
                { label: 'Priority', key: 'priority', opts: ['Critical', 'High', 'Medium', 'Low'] },
                { label: 'Status', key: 'status', opts: ['Open', 'In Progress', 'Pending Review', 'Closed'] },
                { label: 'Risk Level', key: 'riskLevel', opts: ['High', 'Medium', 'Low'] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200"
                    value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Likelihood (1–5)', key: 'likelihood' }, { label: 'Impact (1–5)', key: 'impact' }].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                    <input type="number" min={1} max={5}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200"
                      value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={createItem}
                className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                Create Item
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
