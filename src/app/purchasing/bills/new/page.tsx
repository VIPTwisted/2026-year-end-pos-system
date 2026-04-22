'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Vendor {
  id: string
  vendorCode: string
  name: string
  paymentTerms: string | null
}

interface LineItem {
  _key: string
  description: string
  qty: string
  unitPrice: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

function newLine(): LineItem {
  return {
    _key:      Math.random().toString(36).slice(2),
    description: '',
    qty:       '1',
    unitPrice: '0.00',
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function NewVendorBillPage() {
  const router = useRouter()

  const [vendors,  setVendors]  = useState<Vendor[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState<Toast | null>(null)

  const [vendorId,  setVendorId]  = useState('')
  const [billDate,  setBillDate]  = useState(today())
  const [dueDate,   setDueDate]   = useState(addDays(today(), 30))
  const [poRef,     setPoRef]     = useState('')
  const [notes,     setNotes]     = useState('')
  const [lines,     setLines]     = useState<LineItem[]>([newLine()])

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch('/api/vendors')
      .then(r => r.json())
      .then((d: Vendor[] | { vendors?: Vendor[] }) => {
        setVendors(Array.isArray(d) ? d : (d.vendors ?? []))
      })
      .catch(() => notify('Failed to load vendors', 'err'))
      .finally(() => setLoading(false))
  }, [notify])

  // Auto-adjust due date when bill date or vendor changes
  useEffect(() => {
    const vendor = vendors.find(v => v.id === vendorId)
    const terms  = vendor?.paymentTerms ?? 'Net30'
    const match  = terms.match(/\d+/)
    const days   = match ? parseInt(match[0], 10) : 30
    setDueDate(addDays(billDate, days))
  }, [billDate, vendorId, vendors])

  function updateLine(key: string, field: keyof Omit<LineItem, '_key'>, value: string) {
    setLines(prev =>
      prev.map(l => (l._key === key ? { ...l, [field]: value } : l))
    )
  }

  function removeLine(key: string) {
    setLines(prev => prev.filter(l => l._key !== key))
  }

  const subtotal = lines.reduce((sum, l) => {
    return sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0)
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!vendorId) { notify('Select a vendor', 'err'); return }
    const validLines = lines.filter(l => l.description.trim() && parseFloat(l.unitPrice) > 0)
    if (validLines.length === 0) { notify('Add at least one line item with a description and price', 'err'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/purchasing/bills', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          vendorId,
          billDate,
          dueDate,
          purchaseOrderId: poRef.trim() || undefined,
          notes:           notes.trim() || undefined,
          items: validLines.map(l => ({
            description: l.description.trim(),
            qty:         parseFloat(l.qty) || 1,
            unitPrice:   parseFloat(l.unitPrice) || 0,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to create bill')
      }

      const created = await res.json() as { id: string }
      notify('Bill created')
      router.push(`/purchasing/bills/${created.id}`)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to create bill', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Vendor Bill" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl border transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-900/90 text-emerald-300 border-emerald-600/40'
              : 'bg-rose-900/90 text-rose-300 border-rose-600/40'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/purchasing/bills">
            <Button variant="ghost" className="h-8 px-2 text-zinc-400 hover:text-zinc-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">New Vendor Bill</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Accounts Payable — create a new vendor bill</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

          {/* ── Bill header ──────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bill Details</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Vendor */}
              <div className="col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Vendor <span className="text-rose-400">*</span>
                </label>
                <select
                  value={vendorId}
                  onChange={e => setVendorId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">— Select vendor —</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vendorCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill Date */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Bill Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={billDate}
                  onChange={e => setBillDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Due Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* PO Reference */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  PO Reference (optional)
                </label>
                <input
                  type="text"
                  value={poRef}
                  onChange={e => setPoRef(e.target.value)}
                  placeholder="e.g. PO-2026-001"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Internal notes"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* ── Line items ────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/60 px-5 py-3 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Line Items</h2>
              <Button
                type="button"
                onClick={() => setLines(prev => [...prev, newLine()])}
                className="h-7 px-2.5 text-[12px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded"
              >
                <Plus className="w-3 h-3 mr-1" />Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/60 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                    <th className="text-right py-2 font-medium w-24">Qty</th>
                    <th className="text-right py-2 font-medium w-32">Unit Price</th>
                    <th className="text-right py-2 font-medium w-32">Amount</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, idx) => {
                    const amount = (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0)
                    return (
                      <tr
                        key={l._key}
                        className={`${idx !== lines.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                      >
                        <td className="px-4 py-2 pr-3">
                          <input
                            type="text"
                            value={l.description}
                            onChange={e => updateLine(l._key, 'description', e.target.value)}
                            placeholder="Description of goods or services"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 h-8 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            value={l.qty}
                            onChange={e => updateLine(l._key, 'qty', e.target.value)}
                            min="0"
                            step="0.001"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 h-8 text-right text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            value={l.unitPrice}
                            onChange={e => updateLine(l._key, 'unitPrice', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 h-8 text-right text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-3 text-right text-zinc-100 font-semibold tabular-nums">
                          {fmt(amount)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(l._key)}
                              className="text-zinc-600 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700/60 bg-zinc-900/40">
                    <td colSpan={3} className="px-4 py-3 text-right text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
                      Total
                    </td>
                    <td className="py-3 pr-3 text-right text-lg font-bold text-zinc-100 tabular-nums">
                      {fmt(subtotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── Actions ──────────────────────────────────────── */}
          <div className="flex justify-end gap-3">
            <Link href="/purchasing/bills">
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-4 text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving || loading}
              className="h-9 px-5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving…' : 'Create Bill'}
            </Button>
          </div>
        </form>
      </main>
    </>
  )
}
