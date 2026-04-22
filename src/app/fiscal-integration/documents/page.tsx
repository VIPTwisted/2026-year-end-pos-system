'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { FileCheck, Plus, PenLine, Printer, AlertCircle } from 'lucide-react'

interface FiscalDocument {
  id: string
  documentNumber: string
  deviceId: string | null
  documentType: string
  amount: number
  tax: number
  fiscalCode: string | null
  fiscalSign: string | null
  status: string
  retryCount: number
  errorMessage: string | null
  referenceId: string | null
  payload: string | null
  createdAt: string
  device: { name: string; deviceType: string } | null
}

interface FiscalDevice { id: string; name: string }
const DOC_TYPES = ['receipt', 'return', 'x-report', 'z-report', 'void']

function TypeBadge({ type }: { type: string }) {
  const cfg: Record<string, string> = {
    receipt: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    return: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'x-report': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    'z-report': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    void: 'bg-red-500/15 text-red-400 border-red-500/20',
  }
  return <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${cfg[type] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>{type}</span>
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    signed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    printed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    failed: 'bg-red-500/15 text-red-400 border-red-500/20',
  }
  return <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${cfg[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>{status}</span>
}

const TABS = ['all', 'pending', 'signed', 'failed']

export default function FiscalDocumentsPage() {
  const [docs, setDocs] = useState<FiscalDocument[]>([])
  const [devices, setDevices] = useState<FiscalDevice[]>([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [acting, setActing] = useState<string | null>(null)
  const [form, setForm] = useState({ deviceId: '', documentType: 'receipt', referenceId: '', amount: '', tax: '', payload: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = tab !== 'all' ? `?status=${tab}` : ''
    const [docsRes, devsRes] = await Promise.all([fetch(`/api/fiscal/documents${params}`), fetch('/api/fiscal/devices')])
    const [docsData, devsData] = await Promise.all([docsRes.json(), devsRes.json()])
    setDocs(Array.isArray(docsData) ? docsData : [])
    setDevices(Array.isArray(devsData) ? devsData : [])
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  const handleSign = async (id: string) => {
    setActing(id + '-sign')
    await fetch(`/api/fiscal/documents/${id}/sign`, { method: 'POST' })
    await load(); setActing(null)
  }

  const handlePrint = async (id: string) => {
    setActing(id + '-print')
    await fetch(`/api/fiscal/documents/${id}/print`, { method: 'POST' })
    await load(); setActing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/fiscal/documents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: form.deviceId || null, documentType: form.documentType, referenceId: form.referenceId || null, amount: parseFloat(form.amount) || 0, tax: parseFloat(form.tax) || 0, payload: form.payload || null }),
    })
    await load(); setShowForm(false)
    setForm({ deviceId: '', documentType: 'receipt', referenceId: '', amount: '', tax: '', payload: '' })
    setSaving(false)
  }

  return (
    <>
      <TopBar title="Fiscal Documents" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fiscal Documents</h2>
            <p className="text-xs text-zinc-500">{docs.length} document(s)</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Document
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">New Fiscal Document</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Device</label>
                <select value={form.deviceId} onChange={e => setForm(p => ({ ...p, deviceId: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="">No device</option>
                  {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Document Type</label>
                <select value={form.documentType} onChange={e => setForm(p => ({ ...p, documentType: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {[{ key: 'referenceId', label: 'Reference ID', placeholder: 'Transaction/Order ID', type: 'text' }, { key: 'amount', label: 'Amount ($)', placeholder: '0.00', type: 'number' }, { key: 'tax', label: 'Tax ($)', placeholder: '0.00', type: 'number' }, { key: 'payload', label: 'Payload (JSON)', placeholder: '{"items": []}', type: 'text' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                  <input type={f.type} step={f.type === 'number' ? '0.01' : undefined} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Creating...' : 'Create Document'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </form>
        )}

        <div className="flex gap-1 border-b border-zinc-800">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'text-blue-400 border-blue-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-600 text-sm">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No fiscal documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-600 uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Doc #</th>
                  <th className="text-left pb-3 font-medium">Device</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-right pb-3 font-medium">Amount</th>
                  <th className="text-right pb-3 font-medium">Tax</th>
                  <th className="text-left pb-3 font-medium">Fiscal Code</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {docs.map(doc => (
                  <>
                    <tr key={doc.id} className={`hover:bg-zinc-900/40 ${doc.status === 'failed' ? 'bg-red-950/10' : ''}`}>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{doc.documentNumber}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-400">{doc.device?.name ?? <span className="text-zinc-600">—</span>}</td>
                      <td className="py-3 pr-4"><TypeBadge type={doc.documentType} /></td>
                      <td className="py-3 pr-4 text-right text-zinc-300">${doc.amount.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-right text-zinc-500">${doc.tax.toFixed(2)}</td>
                      <td className="py-3 pr-4">{doc.fiscalCode ? <span className="font-mono text-[10px] text-emerald-400">{doc.fiscalCode}</span> : <span className="text-zinc-600 text-xs">—</span>}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={doc.status} />
                        {doc.status === 'failed' && doc.retryCount > 0 && <span className="ml-1 text-[10px] text-red-400">×{doc.retryCount}</span>}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(doc.status === 'pending' || doc.status === 'failed') && (
                            <button onClick={() => handleSign(doc.id)} disabled={acting === doc.id + '-sign'}
                              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors">
                              <PenLine className="w-3.5 h-3.5" />Sign
                            </button>
                          )}
                          {doc.status === 'signed' && (
                            <button onClick={() => handlePrint(doc.id)} disabled={acting === doc.id + '-print'}
                              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors">
                              <Printer className="w-3.5 h-3.5" />Print
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {doc.status === 'failed' && doc.errorMessage && (
                      <tr key={doc.id + '-err'} className="bg-red-950/10">
                        <td colSpan={8} className="pb-2 px-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span className="text-[11px] text-red-400">{doc.errorMessage}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
