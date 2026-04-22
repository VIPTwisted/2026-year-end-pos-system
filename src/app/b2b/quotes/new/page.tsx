'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Org {
  id: string
  name: string
  accountNumber: string
}

interface LineItem {
  productName: string
  sku: string
  qty: number
  listPrice: number
  quotedPrice: number
  notes: string
}

const emptyLine = (): LineItem => ({ productName: '', sku: '', qty: 1, listPrice: 0, quotedPrice: 0, notes: '' })

export default function NewQuotePage() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgSearch, setOrgSearch] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null)
  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [contactName, setContactName] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
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
      if (field === 'qty' || field === 'quotedPrice') {
        next[idx].quotedPrice = field === 'quotedPrice' ? Number(value) : next[idx].quotedPrice
      }
      return next
    })
  }

  function removeLine(idx: number) {
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  const subtotal = lines.reduce((s, l) => s + l.quotedPrice * l.qty, 0)
  const discount = lines.reduce((s, l) => s + (l.listPrice - l.quotedPrice) * l.qty, 0)
  const tax = 0
  const total = subtotal + tax

  async function save(submitAfter = false) {
    if (!selectedOrg) { setError('Select an organization'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/b2b/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: selectedOrg.id,
          contactName: contactName || null,
          validUntil: validUntil || null,
          notes: notes || null,
          lines: lines.filter(l => l.productName.trim()),
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      const q = await res.json()
      if (submitAfter) {
        await fetch(`/api/b2b/quotes/${q.id}/submit`, { method: 'POST' })
      }
      router.push('/b2b/quotes')
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/b2b/quotes" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-4 h-4" /></Link>
        <FileText className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-zinc-100">New Quote</h1>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}

      <div className="grid grid-cols-2 gap-6">
        {/* Left — Header */}
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
            <label className="block text-xs text-zinc-500 mb-1">Contact Name</label>
            <input
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Contact name"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Valid Until</label>
            <input
              type="date"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right — Notes + Totals */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Live Totals */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="text-zinc-300 font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Discount</span>
              <span className="text-green-400 font-mono">{discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Tax</span>
              <span className="text-zinc-300 font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-zinc-800 pt-2">
              <span className="text-zinc-200">Total</span>
              <span className="text-zinc-100 font-mono">${total.toFixed(2)}</span>
            </div>
          </div>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500">Product Name</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500">SKU</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500 w-16">Qty</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">List Price</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Quoted Price</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Disc %</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Line Total</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const discPct = line.listPrice > 0 ? ((line.listPrice - line.quotedPrice) / line.listPrice * 100) : 0
                const lineTotal = line.quotedPrice * line.qty
                return (
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
                        className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.listPrice}
                        onChange={e => updateLine(idx, 'listPrice', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.quotedPrice}
                        onChange={e => updateLine(idx, 'quotedPrice', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none text-right focus:border-blue-500 border"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-mono ${discPct > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                        {discPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-mono text-zinc-300">
                      ${lineTotal.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeLine(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Submit for Review
        </button>
        <Link href="/b2b/quotes" className="px-5 py-2.5 text-sm text-zinc-500 hover:text-zinc-300">Cancel</Link>
      </div>
    </div>
  )
}
