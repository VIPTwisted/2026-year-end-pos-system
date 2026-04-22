'use client'
import { useEffect, useState } from 'react'
import {
  Database, Plus, Play, Calendar, Download, FileText, Map,
  XCircle, Search, CheckCircle2, Loader2, Clock, AlertTriangle,
  ArrowDownCircle, ArrowUpCircle, Activity, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

interface DataJob {
  id: string
  jobName: string
  direction: 'Import' | 'Export'
  entity: string
  status: 'Ready' | 'Running' | 'Completed' | 'Failed' | 'Scheduled'
  records: number
  errors: number
  created: string
  lastRun: string | null
  errorDetails?: Array<{ row: number; field: string; message: string }>
}

interface DataEntity {
  id: string
  name: string
  module: string
  description: string
  fields: number
  supportedFormats: string[]
}

const SEED_JOBS: DataJob[] = [
  { id: '1', jobName: 'Customer Master Import Q1', direction: 'Import', entity: 'Customers V3', status: 'Completed', records: 1248, errors: 0, created: '2026-04-01', lastRun: '2026-04-01 09:15', errorDetails: [] },
  { id: '2', jobName: 'Product Catalog Export', direction: 'Export', entity: 'Released Products V2', status: 'Completed', records: 8753, errors: 0, created: '2026-04-10', lastRun: '2026-04-10 14:30', errorDetails: [] },
  { id: '3', jobName: 'Vendor Price List Import', direction: 'Import', entity: 'Vendor Price V1', status: 'Failed', records: 312, errors: 14, created: '2026-04-15', lastRun: '2026-04-15 11:22', errorDetails: [
    { row: 47, field: 'UnitPrice', message: 'Value must be > 0' },
    { row: 89, field: 'VendorCode', message: 'Vendor not found in system' },
    { row: 112, field: 'CurrencyCode', message: 'Unsupported currency: BTC' },
    { row: 201, field: 'EffectiveDate', message: 'Date format invalid: 15-04-26' },
  ]},
  { id: '4', jobName: 'GL Entries Nightly Export', direction: 'Export', entity: 'General Ledger Entries', status: 'Scheduled', records: 0, errors: 0, created: '2026-04-01', lastRun: null, errorDetails: [] },
  { id: '5', jobName: 'Inventory Adjustments Import', direction: 'Import', entity: 'Inventory Adjustments V2', status: 'Running', records: 2100, errors: 0, created: '2026-04-22', lastRun: '2026-04-22 08:00', errorDetails: [] },
  { id: '6', jobName: 'Sales Orders Apr Export', direction: 'Export', entity: 'Sales Orders V2', status: 'Completed', records: 4421, errors: 0, created: '2026-04-20', lastRun: '2026-04-20 23:59', errorDetails: [] },
  { id: '7', jobName: 'Employee Records Sync', direction: 'Import', entity: 'Workers V2', status: 'Scheduled', records: 0, errors: 0, created: '2026-04-18', lastRun: null, errorDetails: [] },
  { id: '8', jobName: 'Chart of Accounts Export', direction: 'Export', entity: 'Main Accounts V3', status: 'Ready', records: 0, errors: 0, created: '2026-04-22', lastRun: null, errorDetails: [] },
]

const SEED_ENTITIES: DataEntity[] = [
  { id: '1', name: 'Customers V3', module: 'Sales', description: 'Customer master records including addresses and contacts', fields: 48, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '2', name: 'Released Products V2', module: 'Inventory', description: 'Product catalog with variants, pricing, and UOM', fields: 132, supportedFormats: ['CSV', 'XLSX', 'JSON'] },
  { id: '3', name: 'Vendor Price V1', module: 'Purchase', description: 'Vendor price lists and trade agreements', fields: 22, supportedFormats: ['CSV', 'XLSX'] },
  { id: '4', name: 'General Ledger Entries', module: 'Finance', description: 'GL journal entries and posting detail', fields: 34, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '5', name: 'Inventory Adjustments V2', module: 'Inventory', description: 'Stock count and quantity adjustment records', fields: 18, supportedFormats: ['CSV', 'XLSX'] },
  { id: '6', name: 'Sales Orders V2', module: 'Sales', description: 'Sales order headers and lines', fields: 67, supportedFormats: ['CSV', 'XLSX', 'XML', 'JSON'] },
  { id: '7', name: 'Workers V2', module: 'HR', description: 'Employee master data and HR attributes', fields: 89, supportedFormats: ['CSV', 'XLSX'] },
  { id: '8', name: 'Main Accounts V3', module: 'Finance', description: 'Chart of accounts structure', fields: 24, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '9', name: 'Purchase Orders V2', module: 'Purchase', description: 'Purchase order headers and lines', fields: 55, supportedFormats: ['CSV', 'XLSX', 'XML'] },
  { id: '10', name: 'Global Address Book V2', module: 'System', description: 'Party and address master records', fields: 31, supportedFormats: ['CSV', 'XLSX'] },
  { id: '11', name: 'Bank Accounts V2', module: 'Finance', description: 'Bank account and IBAN details', fields: 19, supportedFormats: ['CSV', 'XLSX'] },
  { id: '12', name: 'Item Coverage Groups', module: 'Planning', description: 'MRP coverage rules per item', fields: 14, supportedFormats: ['CSV'] },
]

const STATUS_STYLE: Record<string, string> = {
  Ready: 'bg-zinc-500/10 text-zinc-400 border-zinc-700/50',
  Running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Scheduled: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'Completed') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
  if (status === 'Failed') return <XCircle className="w-3.5 h-3.5 text-red-400" />
  if (status === 'Running') return <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
  if (status === 'Scheduled') return <Calendar className="w-3.5 h-3.5 text-violet-400" />
  return <Clock className="w-3.5 h-3.5 text-zinc-500" />
}

const MODULE_COLOR: Record<string, string> = {
  Sales: 'text-blue-400', Purchase: 'text-orange-400', Finance: 'text-emerald-400',
  HR: 'text-violet-400', Inventory: 'text-amber-400', Planning: 'text-cyan-400', System: 'text-zinc-400',
}

export default function DataManagementPage() {
  const [jobs, setJobs] = useState<DataJob[]>(SEED_JOBS)
  const [entities, setEntities] = useState<DataEntity[]>(SEED_ENTITIES)
  const [loading, setLoading] = useState(false)
  const [entitySearch, setEntitySearch] = useState('')
  const [selectedJob, setSelectedJob] = useState<DataJob | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showEntities, setShowEntities] = useState(false)
  const [directionFilter, setDirectionFilter] = useState<'All' | 'Import' | 'Export'>('All')

  const activeJobs = jobs.filter(j => j.status === 'Running').length
  const completedToday = jobs.filter(j => j.status === 'Completed').length
  const failedJobs = jobs.filter(j => j.status === 'Failed').length
  const scheduledJobs = jobs.filter(j => j.status === 'Scheduled').length

  const filteredJobs = jobs.filter(j => {
    if (directionFilter !== 'All' && j.direction !== directionFilter) return false
    return true
  })

  const filteredEntities = entities.filter(e => {
    const q = entitySearch.toLowerCase()
    return !q || e.name.toLowerCase().includes(q) || e.module.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
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
        title="Data Management"
        breadcrumb={[{ label: 'Administration', href: '/admin/users' }]}
      />

      <div className="p-6 space-y-5">
        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Active Jobs</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">{activeJobs}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Completed Today</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{completedToday}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Failed</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400">{failedJobs}</div>
            {failedJobs > 0 && <div className="text-[10px] text-red-500 mt-1">Requires attention</div>}
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Scheduled</span>
              <Calendar className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-violet-400">{scheduledJobs}</div>
          </div>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New job
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <Play className="w-3.5 h-3.5" /> Run
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <Download className="w-3.5 h-3.5" /> Download output
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <FileText className="w-3.5 h-3.5" /> View log
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <Map className="w-3.5 h-3.5" /> Map fields
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/40 hover:bg-red-800/40 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 rounded transition-colors">
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
          <div className="ml-auto flex gap-1">
            {(['All', 'Import', 'Export'] as const).map(d => (
              <button key={d} onClick={() => setDirectionFilter(d)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${directionFilter === d ? 'bg-blue-600 text-white' : 'bg-[#16213e] border border-zinc-800/50 text-zinc-400 hover:text-zinc-200'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Table */}
        <div className={`grid gap-4 ${selectedJob ? 'grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="w-8 px-3 py-3">
                      <input type="checkbox" className="accent-blue-600 w-3 h-3"
                        onChange={e => setSelectedRows(e.target.checked ? new Set(filteredJobs.map(j => j.id)) : new Set())} />
                    </th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Job Name</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Direction</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Entity</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Status</th>
                    <th className="text-right px-3 py-3 font-medium uppercase tracking-widest">Records</th>
                    <th className="text-right px-3 py-3 font-medium uppercase tracking-widest">Errors</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Created</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Last Run</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {filteredJobs.map(j => (
                    <tr key={j.id}
                      onClick={() => setSelectedJob(selectedJob?.id === j.id ? null : j)}
                      className={`hover:bg-zinc-900/30 transition-colors cursor-pointer ${selectedJob?.id === j.id ? 'bg-blue-900/10' : ''}`}>
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="accent-blue-600 w-3 h-3"
                          checked={selectedRows.has(j.id)} onChange={() => toggleRow(j.id)} />
                      </td>
                      <td className="px-3 py-2.5 font-medium text-zinc-200">{j.jobName}</td>
                      <td className="px-3 py-2.5">
                        {j.direction === 'Import'
                          ? <span className="flex items-center gap-1 text-emerald-400"><ArrowDownCircle className="w-3 h-3" />Import</span>
                          : <span className="flex items-center gap-1 text-blue-400"><ArrowUpCircle className="w-3 h-3" />Export</span>}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{j.entity}</td>
                      <td className="px-3 py-2.5">
                        <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-medium border ${STATUS_STYLE[j.status]}`}>
                          <StatusIcon status={j.status} />{j.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-zinc-400">{j.records > 0 ? j.records.toLocaleString() : '—'}</td>
                      <td className="px-3 py-2.5 text-right">
                        {j.errors > 0
                          ? <span className="text-red-400 font-semibold">{j.errors}</span>
                          : <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500">{j.created}</td>
                      <td className="px-3 py-2.5 text-zinc-500">{j.lastRun ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-zinc-800/50 text-[11px] text-zinc-600">
              {filteredJobs.length} jobs &nbsp;·&nbsp; {jobs.filter(j => j.direction === 'Import').length} imports &nbsp;·&nbsp; {jobs.filter(j => j.direction === 'Export').length} exports
            </div>
          </div>

          {/* Error Detail Panel */}
          {selectedJob && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{selectedJob.jobName}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${STATUS_STYLE[selectedJob.status]}`}>
                      <StatusIcon status={selectedJob.status} />{selectedJob.status}
                    </span>
                    <span className="text-[11px] text-zinc-500">{selectedJob.entity}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-1 rounded hover:bg-zinc-700 transition-colors">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-900/40 rounded-lg">
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Records</div>
                    <div className="text-lg font-bold text-zinc-200">{selectedJob.records > 0 ? selectedJob.records.toLocaleString() : '—'}</div>
                  </div>
                  <div className="p-3 bg-zinc-900/40 rounded-lg">
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Errors</div>
                    <div className={`text-lg font-bold ${selectedJob.errors > 0 ? 'text-red-400' : 'text-zinc-700'}`}>
                      {selectedJob.errors > 0 ? selectedJob.errors : '0'}
                    </div>
                  </div>
                </div>

                {/* Row-level errors */}
                {selectedJob.errorDetails && selectedJob.errorDetails.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[10px] uppercase tracking-widest text-zinc-600">Row-Level Errors</span>
                    </div>
                    <div className="space-y-2">
                      {selectedJob.errorDetails.map((err, i) => (
                        <div key={i} className="p-2.5 bg-red-900/10 border border-red-500/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-zinc-500">Row {err.row}</span>
                            <span className="font-mono text-[10px] text-red-400 font-medium">{err.field}</span>
                          </div>
                          <div className="text-zinc-400">{err.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-4 text-zinc-600">
                    <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                    <span>No row-level errors</span>
                  </div>
                )}

                {/* Job info */}
                <div className="space-y-2 border-t border-zinc-800/50 pt-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Direction</span>
                    <span className={selectedJob.direction === 'Import' ? 'text-emerald-400' : 'text-blue-400'}>{selectedJob.direction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Created</span>
                    <span className="text-zinc-400">{selectedJob.created}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Last run</span>
                    <span className="text-zinc-400">{selectedJob.lastRun ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-zinc-800/50 flex gap-2">
                <button className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center justify-center gap-1">
                  <Play className="w-3 h-3" /> Run
                </button>
                <button className="flex-1 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors flex items-center justify-center gap-1">
                  <FileText className="w-3 h-3" /> Log
                </button>
                <button className="flex-1 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors flex items-center justify-center gap-1">
                  <Map className="w-3 h-3" /> Map
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Entity Catalog */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowEntities(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-900/20 transition-colors">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-200">Entity Catalog</span>
              <span className="text-xs text-zinc-600 ml-1">({entities.length} entities available)</span>
            </div>
            {showEntities ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>

          {showEntities && (
            <div className="border-t border-zinc-800/50">
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    value={entitySearch}
                    onChange={e => setEntitySearch(e.target.value)}
                    placeholder="Search entities..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900/40 border border-zinc-800/50 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                      <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Entity Name</th>
                      <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Module</th>
                      <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Description</th>
                      <th className="text-right px-4 py-2.5 font-medium uppercase tracking-widest">Fields</th>
                      <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Formats</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {filteredEntities.map(e => (
                      <tr key={e.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-zinc-200">{e.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`font-medium text-[11px] ${MODULE_COLOR[e.module] ?? 'text-zinc-400'}`}>{e.module}</span>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-500 max-w-xs truncate">{e.description}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-400">{e.fields}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {e.supportedFormats.map(f => (
                              <span key={f} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-700/50 text-zinc-400">{f}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
