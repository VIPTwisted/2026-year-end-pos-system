'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2, Send, RefreshCw } from 'lucide-react'

interface JournalLine {
  id: string
  type: string
  no: string
  description: string
  qty: number
  unitCost: number
  unitPrice: number
  jobNo: string
  taskNo: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'

function newLine(): JournalLine {
  return {
    id: Math.random().toString(36).slice(2),
    type: 'Resource',
    no: '',
    description: '',
    qty: 1,
    unitCost: 0,
    unitPrice: 0,
    jobNo: '',
    taskNo: '',
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

export default function ProjectJournalPage() {
  const [template, setTemplate] = useState('DEFAULT')
  const [batch, setBatch] = useState('DEFAULT')
  const [lines, setLines] = useState<JournalLine[]>([newLine()])
  const [posting, setPosting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addLine = () => setLines(prev => [...prev, newLine()])
  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id))
  const updateLine = (id: string, key: keyof JournalLine, value: string | number) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [key]: value } : l))

  const totalCost = lines.reduce((s, l) => s + l.qty * l.unitCost, 0)
  const totalPrice = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)

  const handlePost = async () => {
    const validLines = lines.filter(l => l.no.trim() && l.jobNo.trim())
    if (validLines.length === 0) { notify('Fill in at least one line with No. and Job No.', 'err'); return }
    setPosting(true)
    try {
      // Simulate post — in production this would call /api/projects/journal
      await new Promise(r => setTimeout(r, 600))
      setLines([newLine()])
      notify(`Posted ${validLines.length} job journal line${validLines.length !== 1 ? 's' : ''}`)
    } catch {
      notify('Posting failed', 'err')
    } finally {
      setPosting(false)
    }
  }

  return (
    <>
      <TopBar title="Job Journal" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-full mx-auto p-6 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Project Management</p>
              <h2 className="text-xl font-bold text-zinc-100">Job Journal</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Post resource usage, item consumption, and G/L charges to jobs</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLines([newLine()])}
                className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Clear lines"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handlePost}
                disabled={posting}
                className="h-8 px-4 rounded text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />{posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>

          {/* Batch header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Journal Template</label>
                <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option>DEFAULT</option><option>JOB</option><option>RESOURCE</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Batch Name</label>
                <select value={batch} onChange={e => setBatch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option>DEFAULT</option><option>WEEK1</option><option>CORRECTING</option>
                </select>
              </div>
              <div className="text-right sm:col-start-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Total Cost</div>
                <div className="text-lg font-bold text-zinc-100 tabular-nums font-mono">{fmt(totalCost)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Total Price</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums font-mono">{fmt(totalPrice)}</div>
              </div>
            </div>
          </div>

          {/* Journal lines */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '1100px' }}>
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    <th className="px-2 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left w-8">#</th>
                    {['Type', 'No.', 'Description', 'Qty', 'Unit Cost', 'Unit Price', 'Job No.', 'Task No.', ''].map(h => (
                      <th key={h} className={`px-2 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left whitespace-nowrap ${h === 'Qty' || h === 'Unit Cost' || h === 'Unit Price' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-2 py-2 text-[10px] font-mono text-zinc-600 text-center">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <select value={line.type} onChange={e => updateLine(line.id, 'type', e.target.value)} className={inputCls + ' w-24'}>
                          <option>Resource</option><option>Item</option><option>G/L Account</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.no} onChange={e => updateLine(line.id, 'no', e.target.value)} placeholder="No." className={inputCls + ' w-24'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} placeholder="Description" className={inputCls + ' w-40'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min={0} step={0.01} value={line.qty} onChange={e => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)} className={inputCls + ' w-20 text-right tabular-nums'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min={0} step={0.01} value={line.unitCost} onChange={e => updateLine(line.id, 'unitCost', parseFloat(e.target.value) || 0)} className={inputCls + ' w-28 text-right tabular-nums'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min={0} step={0.01} value={line.unitPrice} onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)} className={inputCls + ' w-28 text-right tabular-nums'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.jobNo} onChange={e => updateLine(line.id, 'jobNo', e.target.value)} placeholder="JOB-0001" className={inputCls + ' w-28'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.taskNo} onChange={e => updateLine(line.id, 'taskNo', e.target.value)} placeholder="TASK-001" className={inputCls + ' w-24'} />
                      </td>
                      <td className="px-2 py-2">
                        {lines.length > 1 && (
                          <button onClick={() => removeLine(line.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-zinc-800/40 flex items-center justify-between">
              <button onClick={addLine} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3 h-3" />Add Line
              </button>
              <span className="text-[11px] text-zinc-600">{lines.length} line{lines.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-lg text-sm font-medium shadow-xl border transition-all ${
          toast.type === 'ok' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/50' : 'bg-red-950/90 text-red-300 border-red-800/50'
        }`}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
