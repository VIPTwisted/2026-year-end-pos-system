'use client'
import { useEffect, useState } from 'react'
import {
  Hash, Plus, Edit2, RefreshCw, Eye, Download,
  Search, CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Play, Settings2,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

interface NumberSequence {
  id: string
  code: string
  name: string
  module: string
  format: string
  prefix: string
  suffix: string
  separator: string
  digits: number
  nextValue: number
  scope: 'Company' | 'Legal entity' | 'Shared'
  manual: boolean
  continuous: boolean
  status: 'Active' | 'Suspended' | 'Completed'
}

const SEED_SEQUENCES: NumberSequence[] = [
  { id: '1', code: 'SO', name: 'Sales Order', module: 'Sales', format: 'SO-{####}', prefix: 'SO', suffix: '', separator: '-', digits: 4, nextValue: 1042, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '2', code: 'PO', name: 'Purchase Order', module: 'Purchase', format: 'PO-{####}', prefix: 'PO', suffix: '', separator: '-', digits: 4, nextValue: 873, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '3', code: 'INV', name: 'Sales Invoice', module: 'Finance', format: 'INV-{YYYY}-{####}', prefix: 'INV', suffix: '', separator: '-', digits: 4, nextValue: 2156, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '4', code: 'CUST', name: 'Customer Account', module: 'Sales', format: 'CUST-{#####}', prefix: 'CUST', suffix: '', separator: '-', digits: 5, nextValue: 10087, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '5', code: 'VEND', name: 'Vendor Account', module: 'Purchase', format: 'VEND-{#####}', prefix: 'VEND', suffix: '', separator: '-', digits: 5, nextValue: 3021, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '6', code: 'ITEM', name: 'Item Number', module: 'Inventory', format: 'ITEM-{######}', prefix: 'ITEM', suffix: '', separator: '-', digits: 6, nextValue: 50322, scope: 'Shared', manual: false, continuous: false, status: 'Active' },
  { id: '7', code: 'WO', name: 'Work Order', module: 'Production', format: 'WO-{YYYY}-{###}', prefix: 'WO', suffix: '', separator: '-', digits: 3, nextValue: 412, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '8', code: 'HR-EMP', name: 'Employee ID', module: 'HR', format: 'EMP-{#####}', prefix: 'EMP', suffix: '', separator: '-', digits: 5, nextValue: 1203, scope: 'Legal entity', manual: false, continuous: true, status: 'Active' },
  { id: '9', code: 'SREQ', name: 'Service Request', module: 'Service', format: 'SR-{YYYY}-{####}', prefix: 'SR', suffix: '', separator: '-', digits: 4, nextValue: 784, scope: 'Company', manual: true, continuous: false, status: 'Active' },
  { id: '10', code: 'TRANS', name: 'Transfer Order', module: 'Inventory', format: 'TO-{####}', prefix: 'TO', suffix: '', separator: '-', digits: 4, nextValue: 231, scope: 'Company', manual: false, continuous: true, status: 'Active' },
  { id: '11', code: 'PROJ', name: 'Project ID', module: 'Finance', format: 'PROJ-{###}-{YY}', prefix: 'PROJ', suffix: '', separator: '-', digits: 3, nextValue: 67, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '12', code: 'RET', name: 'Return Order', module: 'Sales', format: 'RET-{####}', prefix: 'RET', suffix: '', separator: '-', digits: 4, nextValue: 189, scope: 'Company', manual: false, continuous: false, status: 'Active' },
  { id: '13', code: 'BAT', name: 'Batch Number', module: 'Production', format: 'BAT-{YYYY}{MM}-{###}', prefix: 'BAT', suffix: '', separator: '-', digits: 3, nextValue: 9041, scope: 'Shared', manual: false, continuous: true, status: 'Active' },
  { id: '14', code: 'APINV', name: 'AP Invoice', module: 'Finance', format: 'APINV-{YYYY}-{#####}', prefix: 'APINV', suffix: '', separator: '-', digits: 5, nextValue: 4433, scope: 'Legal entity', manual: false, continuous: true, status: 'Suspended' },
  { id: '15', code: 'LEGAC', name: 'Legacy Doc Ref', module: 'Finance', format: 'LEG-{########}', prefix: 'LEG', suffix: '', separator: '-', digits: 8, nextValue: 99999999, scope: 'Company', manual: true, continuous: false, status: 'Completed' },
]

const MODULES = ['All', 'Sales', 'Purchase', 'Finance', 'HR', 'Production', 'Service', 'Inventory']

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Suspended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Completed: 'bg-zinc-500/10 text-zinc-500 border-zinc-700/50',
}

const MODULE_COLOR: Record<string, string> = {
  Sales: 'text-blue-400',
  Purchase: 'text-orange-400',
  Finance: 'text-emerald-400',
  HR: 'text-violet-400',
  Production: 'text-cyan-400',
  Service: 'text-pink-400',
  Inventory: 'text-amber-400',
}

function buildPreview(seq: NumberSequence): string {
  const now = new Date()
  const yyyy = now.getFullYear().toString()
  const yy = yyyy.slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const numPart = String(seq.nextValue).padStart(seq.digits, '0')
  return seq.format
    .replace('{YYYY}', yyyy)
    .replace('{YY}', yy)
    .replace('{MM}', mm)
    .replace(/\{#+\}/, numPart)
}

export default function NumberSequencesPage() {
  const [sequences, setSequences] = useState<NumberSequence[]>(SEED_SEQUENCES)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('All')
  const [selected, setSelected] = useState<NumberSequence | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [previewSeq, setPreviewSeq] = useState<NumberSequence | null>(null)

  const filtered = sequences.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.format.toLowerCase().includes(q)
    const matchModule = moduleFilter === 'All' || s.module === moduleFilter
    return matchSearch && matchModule
  })

  function toggleRow(id: string) {
    setSelectedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
      <TopBar
        title="Number Sequences"
        breadcrumb={[{ label: 'Administration', href: '/admin/users' }]}
      />

      <div className="p-6 space-y-5">
        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New sequence
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            disabled={selectedRows.size !== 1}
            onClick={() => {
              const sel = filtered.find(s => selectedRows.has(s.id))
              if (sel) setPreviewSeq(previewSeq?.id === sel.id ? null : sel)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <Eye className="w-3.5 h-3.5" /> Preview next value
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* Format Preview Banner */}
        {previewSeq && (
          <div className="flex items-center gap-4 px-4 py-3 bg-blue-900/20 border border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-zinc-400">Next value preview for <span className="text-zinc-200 font-medium">{previewSeq.name}</span>:</span>
            </div>
            <span className="font-mono text-sm text-blue-300 font-bold tracking-wide">{buildPreview(previewSeq)}</span>
            <span className="text-xs text-zinc-600">Format: <span className="font-mono text-zinc-500">{previewSeq.format}</span></span>
            <button onClick={() => setPreviewSeq(null)} className="ml-auto text-xs text-zinc-600 hover:text-zinc-400">Dismiss</button>
          </div>
        )}

        {/* Format Builder hint */}
        <div className="flex items-start gap-3 px-4 py-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl text-xs text-zinc-500">
          <Settings2 className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-zinc-400 font-medium">Format tokens: </span>
            <span className="font-mono text-zinc-500">{'{YYYY}'}</span> = 4-digit year &nbsp;
            <span className="font-mono text-zinc-500">{'{YY}'}</span> = 2-digit year &nbsp;
            <span className="font-mono text-zinc-500">{'{MM}'}</span> = month &nbsp;
            <span className="font-mono text-zinc-500">{'{####}'}</span> = numeric counter (# count = digits) &nbsp;
            <span className="font-mono text-zinc-500">Prefix-Separator-Counter-Suffix</span>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search code, name, format..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#16213e] border border-zinc-800/50 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#16213e] border border-zinc-800/50 rounded-xl text-zinc-300 focus:outline-none focus:border-blue-600">
            {MODULES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-8 px-3 py-3">
                    <input type="checkbox" className="accent-blue-600 w-3 h-3"
                      onChange={e => setSelectedRows(e.target.checked ? new Set(filtered.map(s => s.id)) : new Set())} />
                  </th>
                  <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Code</th>
                  <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Name</th>
                  <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Module</th>
                  <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Format</th>
                  <th className="text-right px-3 py-3 font-medium uppercase tracking-widest">Next Value</th>
                  <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Scope</th>
                  <th className="text-center px-3 py-3 font-medium uppercase tracking-widest">Manual</th>
                  <th className="text-center px-3 py-3 font-medium uppercase tracking-widest">Continuous</th>
                  <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Sample ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filtered.length === 0 ? (
                  <tr><td colSpan={11} className="py-16 text-center text-zinc-600">No sequences found</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    className={`hover:bg-zinc-900/30 transition-colors cursor-pointer ${selected?.id === s.id ? 'bg-blue-900/10' : ''}`}>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="accent-blue-600 w-3 h-3"
                        checked={selectedRows.has(s.id)} onChange={() => toggleRow(s.id)} />
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-zinc-200">{s.code}</td>
                    <td className="px-3 py-2.5 text-zinc-300">{s.name}</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-medium ${MODULE_COLOR[s.module] ?? 'text-zinc-400'}`}>{s.module}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-zinc-500">{s.format}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-zinc-300">{s.nextValue.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-zinc-500">{s.scope}</td>
                    <td className="px-3 py-2.5 text-center">
                      {s.manual
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                        : <XCircle className="w-3.5 h-3.5 text-zinc-700 mx-auto" />}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {s.continuous
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                        : <XCircle className="w-3.5 h-3.5 text-zinc-700 mx-auto" />}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-blue-400">{buildPreview(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-zinc-800/50 text-[11px] text-zinc-600">
            {filtered.length} of {sequences.length} sequences &nbsp;·&nbsp;
            {sequences.filter(s => s.status === 'Active').length} active &nbsp;·&nbsp;
            {sequences.filter(s => s.status === 'Suspended').length} suspended
          </div>
        </div>

        {/* Selected detail */}
        {selected && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Sequence Code</div>
              <div className="font-mono font-bold text-zinc-100 text-lg">{selected.code}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Format String</div>
              <div className="font-mono text-zinc-300">{selected.format}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Next Generated ID</div>
              <div className="font-mono text-blue-300 font-bold">{buildPreview(selected)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Counter</div>
              <div className="text-zinc-200">{selected.nextValue.toLocaleString()} &rarr; {(selected.nextValue + 1).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Prefix</div>
              <div className="font-mono text-zinc-300">{selected.prefix || '—'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Digit Length</div>
              <div className="text-zinc-300">{selected.digits} digits</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Scope</div>
              <div className="text-zinc-300">{selected.scope}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Module</div>
              <div className={`font-medium ${MODULE_COLOR[selected.module] ?? 'text-zinc-400'}`}>{selected.module}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
