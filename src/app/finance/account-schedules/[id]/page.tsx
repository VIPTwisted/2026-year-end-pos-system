'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Edit2, Save, X, RefreshCw, FileBarChart } from 'lucide-react'

interface ScheduleRow { rowNo: string; description: string; totaling: string; rowType: string; amountType: string }

interface Schedule {
  id: string; name: string; description: string | null; reportType: string
  isPublished: boolean; updatedAt: string; rows: ScheduleRow[]; columns: unknown[]
}

const TYPE_LABELS: Record<string, string> = {
  income_statement: 'Income Statement', balance_sheet: 'Balance Sheet',
  cash_flow: 'Cash Flow', trial_balance: 'Trial Balance', custom: 'Custom',
}

const ROW_TYPE_STYLES: Record<string, string> = {
  heading: 'font-semibold text-zinc-200 bg-zinc-900/40',
  total: 'font-semibold text-zinc-100 bg-[rgba(99,102,241,0.08)]',
  begin_total: 'text-zinc-400 italic',
  end_total: 'font-semibold text-zinc-300 border-t border-zinc-700',
  posting: '',
}

export default function AccountScheduleViewerPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [editName, setEditName] = useState('')
  const [saving,   setSaving]   = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/finance/account-schedules/${id}`)
      const data = await res.json()
      setSchedule(data); setEditName(data.name)
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetch_() }, [fetch_])

  const togglePublish = async () => {
    if (!schedule) return
    await fetch(`/api/finance/account-schedules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !schedule.isPublished }),
    })
    await fetch_()
  }

  const saveName = async () => {
    setSaving(true)
    await fetch(`/api/finance/account-schedules/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    setSaving(false); setEditing(false); await fetch_()
  }

  const actions = schedule ? (
    <div className="flex items-center gap-2">
      <button onClick={togglePublish} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded transition-colors" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
        {schedule.isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <button onClick={() => router.push(`/finance/account-schedules/new`)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded transition-colors" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Edit2 className="w-3.5 h-3.5" /> Edit Rows
      </button>
      <button onClick={fetch_} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium rounded transition-colors">
        <RefreshCw className="w-3.5 h-3.5" /> Refresh
      </button>
    </div>
  ) : undefined

  return (
    <>
      <TopBar title={schedule?.name ?? 'Account Schedule'} breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Account Schedules', href: '/finance/account-schedules' }]} actions={actions} />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
        {loading && <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center"><RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" /></div>}
        {!loading && schedule && (
          <>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Name</p>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-zinc-900 border border-indigo-500 rounded px-2 py-1 text-[13px] text-zinc-200 focus:outline-none w-full" />
                      <button onClick={saveName} disabled={saving} className="text-indigo-400 hover:text-indigo-300"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditing(false)} className="text-zinc-600 hover:text-zinc-400"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-zinc-100">{schedule.name}</p>
                      <button onClick={() => setEditing(true)} className="text-zinc-600 hover:text-zinc-400"><Edit2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Type</p>
                  <p className="text-[13px] text-zinc-300">{TYPE_LABELS[schedule.reportType] ?? schedule.reportType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${schedule.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {schedule.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Last Modified</p>
                  <p className="text-[12px] text-zinc-500">{new Date(schedule.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              {schedule.description && <p className="mt-3 text-[13px] text-zinc-400 border-t border-zinc-800/50 pt-3">{schedule.description}</p>}
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60">
                <span className="text-[13px] font-semibold text-zinc-200">Schedule Definition</span>
                <span className="ml-2 text-[11px] text-zinc-600">{schedule.rows.length} rows</span>
              </div>
              {schedule.rows.length === 0 ? (
                <div className="p-10 text-center">
                  <FileBarChart className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-600 text-[13px]">No rows defined.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-20">Row No.</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-36">Totaling</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-32">Row Type</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-32">Amount Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.rows.map((row, i) => (
                        <tr key={i} className={`border-b border-zinc-800/20 transition-colors ${ROW_TYPE_STYLES[row.rowType] ?? ''}`}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          <td className="px-4 py-2 font-mono text-[11px] text-indigo-400/70">{row.rowNo}</td>
                          <td className="px-4 py-2">{row.description}</td>
                          <td className="px-4 py-2 font-mono text-[11px] text-zinc-500">{row.totaling || '–'}</td>
                          <td className="px-4 py-2 text-zinc-400 text-[12px]">{row.rowType}</td>
                          <td className="px-4 py-2 text-zinc-400 text-[12px]">{row.amountType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
