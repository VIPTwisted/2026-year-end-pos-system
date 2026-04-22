'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Save, X, FileText } from 'lucide-react'

type Vendor = { id: string; vendorCode: string; name: string; paymentTerms?: string | null }

type LineItem = {
  description: string
  qty:         number
  unitPrice:   number
  amount:      number
  glAccountId: string
}

export default function NewPurchaseInvoicePage() {
  const router = useRouter()

  const [vendors,   setVendors]   = useState<Vendor[]>([])
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'lines'>('general')

  const [vendorId,        setVendorId]        = useState('')
  const [invoiceDate,     setInvoiceDate]     = useState(new Date().toISOString().slice(0, 10))
  const [dueDate,         setDueDate]         = useState('')
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('')
  const [currency,        setCurrency]        = useState('USD')
  const [notes,           setNotes]           = useState('')
  const [lines,           setLines]           = useState<LineItem[]>([])

  useEffect(() => {
    fetch('/api/vendors?status=active&take=200')
      .then(r => r.json())
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setVendors([]))
  }, [])

  function addLine() {
    setLines(prev => [
      ...prev,
      { description: '', qty: 1, unitPrice: 0, amount: 0, glAccountId: '' },
    ])
  }

  function removeLine(i: number) {
    setLines(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateLine(i: number, field: keyof LineItem, value: string | number) {
    setLines(prev => {
      const next = [...prev]
      const line = { ...next[i], [field]: value }
      if (field === 'qty' || field === 'unitPrice') {
        line.amount = Number(line.qty) * Number(line.unitPrice)
      }
      next[i] = line
      return next
    })
  }

  const totalAmount = lines.reduce((s, l) => s + l.amount, 0)

  async function handleSave() {
    if (!vendorId) { setError('Please select a vendor.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/purchase/invoices', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          invoiceDate,
          dueDate:         dueDate || null,
          vendorInvoiceNo: vendorInvoiceNo || null,
          currency,
          notes:           notes || null,
          lines,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to create invoice.')
        return
      }
      const inv = await res.json()
      router.push(`/purchase/invoices/${inv.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { key: 'general', label: 'General' },
    { key: 'lines',   label: `Lines (${lines.length})` },
  ] as const

  return (
    <>
      <TopBar
        title="New Purchase Invoice"
        breadcrumb={[
          { label: 'Purchase', href: '/purchase/orders' },
          { label: 'Purchase Invoices', href: '/purchase/invoices' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-600 border border-indigo-600 rounded transition-colors disabled:opacity-60"
          >
            <Save className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
          </button>
          <Link href="/purchase/invoices">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <X className="w-3 h-3" /> Discard
            </button>
          </Link>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 bg-red-900/20 border border-red-700/50 rounded text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="p-6 space-y-4 max-w-4xl">

          <div className="flex border-b border-zinc-800/50">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === t.key
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* General */}
          {activeTab === 'general' && (
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2.5">
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">General</span>
              </div>
              <div className="bg-[#0d1117] px-6 py-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                      Buy-from Vendor <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={vendorId}
                      onChange={e => setVendorId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="">— Select vendor —</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                      Vendor Invoice No.
                    </label>
                    <input
                      type="text"
                      value={vendorInvoiceNo}
                      onChange={e => setVendorInvoiceNo(e.target.value)}
                      placeholder="External invoice reference"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={e => setInvoiceDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">Currency</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      {['USD', 'EUR', 'GBP', 'CAD', 'MXN'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-widests text-zinc-500 mb-1.5">Notes</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Internal notes…"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lines */}
          {activeTab === 'lines' && (
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2.5 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">Lines</span>
                <button
                  onClick={addLine}
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-700/20 hover:bg-indigo-700/40 border border-indigo-700/50 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Line
                </button>
              </div>
              <div className="bg-[#0d1117] overflow-x-auto">
                {lines.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-zinc-600">
                    <FileText className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">No lines added.</p>
                    <button onClick={addLine} className="mt-3 text-xs text-indigo-400 hover:underline">
                      + Add first line
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800/60">
                        <th className="px-3 py-2 text-[10px] uppercase tracking-widests text-zinc-500 text-left font-medium">G/L Account</th>
                        <th className="px-3 py-2 text-[10px] uppercase tracking-widests text-zinc-500 text-left font-medium">Description</th>
                        <th className="px-3 py-2 text-[10px] uppercase tracking-widests text-zinc-500 text-right font-medium">Quantity</th>
                        <th className="px-3 py-2 text-[10px] uppercase tracking-widests text-zinc-500 text-right font-medium">Unit Price</th>
                        <th className="px-3 py-2 text-[10px] uppercase tracking-widests text-zinc-500 text-right font-medium">Amount</th>
                        <th className="px-3 py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, i) => (
                        <tr key={i} className="border-b border-zinc-800/30">
                          <td className="px-3 py-1.5">
                            <input
                              type="text"
                              value={line.glAccountId}
                              onChange={e => updateLine(i, 'glAccountId', e.target.value)}
                              placeholder="Account #"
                              className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="text"
                              value={line.description}
                              onChange={e => updateLine(i, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="number"
                              min="0"
                              value={line.qty}
                              onChange={e => updateLine(i, 'qty', parseFloat(e.target.value) || 0)}
                              className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 text-right focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={e => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 text-right focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right text-xs font-medium text-zinc-200 tabular-nums">
                            {formatCurrency(line.amount)}
                          </td>
                          <td className="px-3 py-1.5">
                            <button onClick={() => removeLine(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-700/50">
                        <td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold text-zinc-400">Total</td>
                        <td className="px-3 py-2 text-right text-sm font-bold text-indigo-300 tabular-nums">
                          {formatCurrency(totalAmount)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
