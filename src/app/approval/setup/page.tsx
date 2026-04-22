'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2, Settings2 } from 'lucide-react'

interface UserSetup {
  id: string
  userId: string
  approver: string
  salesAmtLimit: number
  purchAmtLimit: number
  salesUnlimited: boolean
  purchUnlimited: boolean
  email: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'

function newRow(): UserSetup {
  return {
    id: Math.random().toString(36).slice(2),
    userId: '',
    approver: '',
    salesAmtLimit: 0,
    purchAmtLimit: 0,
    salesUnlimited: false,
    purchUnlimited: false,
    email: '',
  }
}

export default function ApprovalSetupPage() {
  const [rows, setRows] = useState<UserSetup[]>([newRow()])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addRow = () => setRows(prev => [...prev, newRow()])
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id))
  const update = (id: string, key: keyof UserSetup, value: string | number | boolean) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r))

  const save = async () => {
    const valid = rows.filter(r => r.userId.trim())
    if (valid.length === 0) { notify('Add at least one user', 'err'); return }
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 400))
      notify(`Saved ${valid.length} approval user setup entries`)
    } catch {
      notify('Save failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Approval User Setup" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-full mx-auto p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Operations &rsaquo; Approvals</p>
              <h2 className="text-xl font-bold text-zinc-100">Approval User Setup</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Configure approval limits and chains for each user</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={save} disabled={saving} className="h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800/50 text-[12px] font-semibold uppercase tracking-widest text-zinc-400">
              User Approval Limits
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '1000px' }}>
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['User ID', 'Approver', 'Sales Amt. Approval Limit', 'Sales Unlimited', 'Purch. Amt. Approval Limit', 'Purch. Unlimited', 'Email', ''].map(h => (
                      <th key={h} className={`px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left whitespace-nowrap ${h === 'Sales Unlimited' || h === 'Purch. Unlimited' ? 'text-center' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {rows.map((row, i) => (
                    <tr key={row.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-2 py-2">
                        <input type="text" value={row.userId} onChange={e => update(row.id, 'userId', e.target.value)} placeholder="USER001" className={inputCls + ' w-28'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={row.approver} onChange={e => update(row.id, 'approver', e.target.value)} placeholder="APPROVER001" className={inputCls + ' w-28'} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min={0} step={100} value={row.salesAmtLimit} onChange={e => update(row.id, 'salesAmtLimit', parseFloat(e.target.value) || 0)} disabled={row.salesUnlimited} className={inputCls + ' w-32 text-right tabular-nums disabled:opacity-40'} />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input type="checkbox" checked={row.salesUnlimited} onChange={e => update(row.id, 'salesUnlimited', e.target.checked)} className="w-3.5 h-3.5 accent-blue-600" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min={0} step={100} value={row.purchAmtLimit} onChange={e => update(row.id, 'purchAmtLimit', parseFloat(e.target.value) || 0)} disabled={row.purchUnlimited} className={inputCls + ' w-32 text-right tabular-nums disabled:opacity-40'} />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input type="checkbox" checked={row.purchUnlimited} onChange={e => update(row.id, 'purchUnlimited', e.target.checked)} className="w-3.5 h-3.5 accent-blue-600" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="email" value={row.email} onChange={e => update(row.id, 'email', e.target.value)} placeholder="user@company.com" className={inputCls + ' w-44'} />
                      </td>
                      <td className="px-2 py-2">
                        {rows.length > 1 && (
                          <button onClick={() => removeRow(row.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
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
              <button onClick={addRow} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3 h-3" />Add User
              </button>
              <span className="text-[11px] text-zinc-600">{rows.length} user{rows.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-lg text-sm font-medium shadow-xl border ${
          toast.type === 'ok' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/50' : 'bg-red-950/90 text-red-300 border-red-800/50'
        }`}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
