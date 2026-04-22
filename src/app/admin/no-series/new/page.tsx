'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewNoSeriesPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '', description: '', startingNo: '', lastNoUsed: '',
    defaultNos: true, manualNos: false, blocked: false,
  })

  function setF(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })) }

  async function submit() {
    if (!form.code || !form.description) { setError('Code and Description are required.'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/admin/no-series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) router.push('/admin/no-series')
    else { const j = await res.json(); setError(j.error ?? 'Failed to create') }
    setSaving(false)
  }

  const textField = (label: string, key: string, placeholder?: string) => (
    <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-zinc-800/60">
      <label className="text-xs text-zinc-400 font-medium">{label}</label>
      <div className="col-span-2">
        <input value={(form as any)[key]} onChange={e => setF(key, e.target.value)} placeholder={placeholder}
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
      </div>
    </div>
  )

  const toggleField = (label: string, key: string) => (
    <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-zinc-800/60">
      <label className="text-xs text-zinc-400 font-medium">{label}</label>
      <div className="col-span-2 flex items-center gap-2">
        <button onClick={() => setF(key, !(form as any)[key])}
          className={cn('relative w-9 h-5 rounded-full transition-colors', (form as any)[key] ? 'bg-indigo-600' : 'bg-zinc-700')}>
          <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform', (form as any)[key] ? 'translate-x-4' : 'translate-x-0.5')} />
        </button>
        <span className="text-xs text-zinc-400">{(form as any)[key] ? 'Yes' : 'No'}</span>
      </div>
    </div>
  )

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Hash className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">New Number Series</h1>
            <p className="text-[11px] text-zinc-500">Configure auto-numbering for documents</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors disabled:opacity-60">
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-2 rounded text-xs text-red-400 border border-red-500/30 bg-red-500/10 max-w-3xl">{error}</div>}

      <div className="max-w-3xl rounded-lg px-4 py-3" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
        {textField('Code *', 'code', 'INVOICE')}
        {textField('Description *', 'description', 'Sales Invoices')}
        {textField('Starting No.', 'startingNo', 'INV-00001')}
        {textField('Last No. Used', 'lastNoUsed')}
        {toggleField('Default Nos.', 'defaultNos')}
        {toggleField('Manual Nos.', 'manualNos')}
        {toggleField('Blocked', 'blocked')}
      </div>
    </main>
  )
}
