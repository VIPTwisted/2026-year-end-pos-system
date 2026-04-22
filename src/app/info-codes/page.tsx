'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import Link from 'next/link'

type InfoCode = {
  id: string
  infoCodeId: string
  description: string
  inputType: string
  triggerType: string
  isRequired: boolean
  isActive: boolean
  subCodes: { id: string }[]
}

const TRIGGER_TABS = ['All', 'manual', 'line', 'payment', 'transaction']

export default function InfoCodesPage() {
  const [codes, setCodes] = useState<InfoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ infoCodeId: '', description: '', prompt: '', inputType: 'list', triggerType: 'manual', isRequired: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/info-codes')
      .then((r) => r.json())
      .then(setCodes)
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'All' ? codes : codes.filter((c) => c.triggerType === activeTab)

  async function handleCreate() {
    setSaving(true)
    const res = await fetch('/api/info-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setCodes((prev) => [...prev, { ...created, subCodes: [] }])
    setShowModal(false)
    setForm({ infoCodeId: '', description: '', prompt: '', inputType: 'list', triggerType: 'manual', isRequired: false })
    setSaving(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Info Codes</h1>
          <p className="text-zinc-400 text-sm mt-1">Configure prompts and data capture at POS</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Info Code
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {TRIGGER_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 text-sm capitalize transition-colors', activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400 hover:text-zinc-200')}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Info Code ID</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Description</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Input Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Required</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Sub-Codes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center text-zinc-500 py-8">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-zinc-500 py-8">No info codes</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/info-codes/${c.id}`} className="text-blue-400 hover:text-blue-300 font-mono">{c.infoCodeId}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-100">{c.description}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded capitalize">{c.inputType}</span>
                </td>
                <td className="px-4 py-3">
                  {c.isRequired && <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Required</span>}
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.subCodes.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">New Info Code</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Info Code ID</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.infoCodeId} onChange={(e) => setForm((f) => ({ ...f, infoCodeId: e.target.value }))} placeholder="SALESPERSON" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Description</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Who helped you today?" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Prompt</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.prompt} onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))} placeholder="Select salesperson:" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Input Type</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.inputType} onChange={(e) => setForm((f) => ({ ...f, inputType: e.target.value }))}>
                    <option value="list">List</option>
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Trigger Type</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.triggerType} onChange={(e) => setForm((f) => ({ ...f, triggerType: e.target.value }))}>
                    <option value="manual">Manual</option>
                    <option value="line">Line</option>
                    <option value="payment">Payment</option>
                    <option value="transaction">Transaction</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-blue-500" checked={form.isRequired} onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))} />
                <span className="text-sm text-zinc-300">Required</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.infoCodeId || !form.description} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
