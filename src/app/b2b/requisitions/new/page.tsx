'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Org {
  id: string
  name: string
  accountNumber: string
}

interface LineItem {
  productName: string
  sku: string
  qty: number
  unitPrice: number
  notes: string
}

const emptyLine = (): LineItem => ({ productName: '', sku: '', qty: 1, unitPrice: 0, notes: '' })

export default function NewRequisitionPage() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgSearch, setOrgSearch] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null)
  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [requestedBy, setRequestedBy] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/b2b/organizations').then(r => r.json()).then(setOrgs).catch(() => {})
  }, [])

  const filteredOrgs = orgs.filter(o =>
    !orgSearch || o.name.toLowerCase().includes(orgSearch.toLowerCase()) || o.accountNumber.toLowerCase().includes(orgSearch.toLowerCase())
  )

  function updateLine(idx: number, field: keyof LineItem, value: string | number) {
    setLines(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const totalAmount = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)

  async function save() {
    if (!selectedOrg) { setError('Select an organization'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/b2b/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: selectedOrg.id,
          requestedBy: requestedBy || null,
          lines: lines.filter(l => l.productName.trim()),
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      router.push('/b2b/requisitions')
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/b2b/requisitions" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-4 h-4" /></Link>
        <ClipboardList className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-zinc-100">New Requisition</h1>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Org Selector */}
          <div className="relative">
            <label className="block text-xs text-zinc-500 mb-1">Organization *</label>
            <input
              value={selectedOrg ? `${selectedOrg.name} (${selectedOrg.accountNumber})` : orgSearch}
              onChange={e => { setOrgSearch(e.target.value); setSelectedOrg(null); setShowOrgDropdown(true) }}
              onFocus={() => setShowOrgDropdown(true)}
              placeholder="Search organization..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
            {showOrgDropdown && filteredOrgs.length > 0 && !selectedOrg && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {filteredOrgs.slice(0, 8).map(o => (
                  <button
                    key={o.id}
                    onClick={() => { setSelectedOrg(o); setOrgSearch(''); setShowOrgDropdown(false) }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-700 text-sm"
                  >
                    <span className="text-zinc-100">{o.name}</span>
                    <span className="text-zinc-500 text-xs ml-2">{o.accountNumber}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Requested By</label>
            <input
              value={requestedBy}
              onChange={e => setRequestedBy(e.target.value)}
              placeholder="Requester name..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 self-start">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Total</p>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-zinc-200">Amount</span>
            <span className="text-zinc-100 font-mono">${totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-zinc-600">{lines.filter(l => l.productName).length} line item(s)</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <span className="text-sm font-semibold text-zinc-200">Line Items</span>
          <button
            onClick={() => setLines(prev => [...prev, emptyLine()])}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
          >
            <Plus className="w-3 h-3" /> Add Line
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500">Product Name</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500">SKU</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500 w-20">Qty</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Unit Price</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Line Total</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="border-b border-zinc-800/50">
                <td className="px-3 py-2">
                  <input
                    value={line.productName}
                    onChange={e => updateLine(idx, 'productName', e.target.value)}
                    placeholder="Product name..."
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={line.sku}
                    onChange={e => updateLine(idx, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={e => updateLine(idx, 'qty', parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right text-xs font-mono text-zinc-300">
                  ${(line.unitPrice * line.qty).toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Create Requisition'}
        </button>
        <Link href="/b2b/requisitions" className="px-5 py-2.5 text-sm text-zinc-500 hover:text-zinc-300">Cancel</Link>
      </div>
    </div>
  )
}
