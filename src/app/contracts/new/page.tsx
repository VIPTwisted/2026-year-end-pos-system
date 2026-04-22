'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, FileSignature } from 'lucide-react'

const CONTRACT_TYPES = ['customer', 'vendor', 'service', 'lease'] as const
type ContractType = typeof CONTRACT_TYPES[number]

interface LineItem {
  id: string
  description: string
  lineType: 'service' | 'product' | 'fee'
  quantity: string
  unitPrice: string
  lineTotal: number
  sortOrder: number
}

interface CustomerResult {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface SupplierResult {
  id: string
  name: string
  email: string | null
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'
const selectCls = inputCls + ' cursor-pointer'

function genId() { return Math.random().toString(36).slice(2) }

export default function NewContractPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [type, setType] = useState<ContractType>('customer')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [value, setValue] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [autoRenew, setAutoRenew] = useState(false)
  const [renewDays, setRenewDays] = useState('30')
  const [terms, setTerms] = useState('')
  const [notes, setNotes] = useState('')

  // Party selection
  const [partySearch, setPartySearch] = useState('')
  const [partyResults, setPartyResults] = useState<(CustomerResult | SupplierResult)[]>([])
  const [partySearching, setPartySearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResult | null>(null)

  // Line items
  const [lines, setLines] = useState<LineItem[]>([])

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const isVendorType = type === 'vendor'

  const searchParty = async (q: string) => {
    setPartySearch(q)
    if (q.trim().length < 2) { setPartyResults([]); return }
    setPartySearching(true)
    try {
      const endpoint = isVendorType ? `/api/suppliers?search=${encodeURIComponent(q)}` : `/api/customers?search=${encodeURIComponent(q)}&limit=10`
      const res = await fetch(endpoint)
      if (!res.ok) return
      const data = await res.json()
      if (isVendorType) {
        const suppliers = (data.suppliers ?? data) as SupplierResult[]
        setPartyResults(suppliers.slice(0, 8))
      } else {
        const customers = (data.customers ?? data) as CustomerResult[]
        setPartyResults(customers.slice(0, 8))
      }
    } catch { /* silent */ } finally {
      setPartySearching(false)
    }
  }

  const selectParty = (p: CustomerResult | SupplierResult) => {
    if (isVendorType) {
      setSelectedSupplier(p as SupplierResult)
      setSelectedCustomer(null)
    } else {
      setSelectedCustomer(p as CustomerResult)
      setSelectedSupplier(null)
    }
    setPartySearch('')
    setPartyResults([])
  }

  const clearParty = () => {
    setSelectedCustomer(null)
    setSelectedSupplier(null)
  }

  // Switch type clears selection
  const handleTypeChange = (t: ContractType) => {
    setType(t)
    clearParty()
    setPartySearch('')
    setPartyResults([])
  }

  // Line item management
  const addLine = () => {
    setLines(prev => [
      ...prev,
      { id: genId(), description: '', lineType: 'service', quantity: '1', unitPrice: '0', lineTotal: 0, sortOrder: prev.length },
    ])
  }

  const updateLine = (id: string, field: keyof LineItem, val: string) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l
      const updated = { ...l, [field]: val }
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = parseFloat(field === 'quantity' ? val : l.quantity) || 0
        const price = parseFloat(field === 'unitPrice' ? val : l.unitPrice) || 0
        updated.lineTotal = parseFloat((qty * price).toFixed(2))
      }
      return updated
    }))
  }

  const removeLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const computedValue = lines.reduce((s, l) => s + l.lineTotal, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!startDate) { setError('Start date is required'); return }

    setSaving(true)
    setError('')
    try {
      const body = {
        title: title.trim(),
        type,
        customerId: selectedCustomer?.id ?? undefined,
        supplierId: selectedSupplier?.id ?? undefined,
        startDate,
        endDate: endDate || undefined,
        value: value ? parseFloat(value) : computedValue,
        currency,
        autoRenew,
        renewDays: parseInt(renewDays) || 30,
        terms: terms.trim() || undefined,
        notes: notes.trim() || undefined,
        lines: lines.map((l, idx) => ({
          description: l.description,
          lineType: l.lineType,
          quantity: parseFloat(l.quantity) || 1,
          unitPrice: parseFloat(l.unitPrice) || 0,
          lineTotal: l.lineTotal,
          sortOrder: idx,
        })).filter(l => l.description.trim()),
      }

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Create failed')
      notify('Contract created')
      router.push(`/contracts/${(data as { id: string }).id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const partyLabel = isVendorType ? 'Supplier / Vendor' : 'Customer'
  const selectedParty = isVendorType
    ? selectedSupplier ? selectedSupplier.name : null
    : selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : null

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title="New Contract"
        breadcrumb={[{ label: 'Contracts', href: '/contracts' }]}
        showBack
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-5">
        <Link
          href="/contracts"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Contracts
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Header card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <FileSignature className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Contract Details</h2>
            </div>

            {/* Title + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Annual Service Agreement – ACME Corp"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Contract Type</label>
                <select
                  value={type}
                  onChange={e => handleTypeChange(e.target.value as ContractType)}
                  className={selectCls}
                >
                  {CONTRACT_TYPES.map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Party search */}
            <div>
              <label className={labelCls}>{partyLabel}</label>
              {selectedParty ? (
                <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2">
                  <span className="text-sm text-zinc-100">{selectedParty}</span>
                  <button
                    type="button"
                    onClick={clearParty}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={partySearch}
                    onChange={e => searchParty(e.target.value)}
                    placeholder={`Search ${partyLabel.toLowerCase()}…`}
                    className={inputCls}
                  />
                  {partySearching && (
                    <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-zinc-600 border-t-blue-400 rounded-full animate-spin" />
                  )}
                  {partyResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#16213e] border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden">
                      {partyResults.map(p => {
                        const label = isVendorType
                          ? (p as SupplierResult).name
                          : `${(p as CustomerResult).firstName} ${(p as CustomerResult).lastName}`
                        const sub = p.email ?? ''
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => selectParty(p)}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/60 transition-colors text-left"
                          >
                            <span className="text-sm text-zinc-100">{label}</span>
                            <span className="text-xs text-zinc-500">{sub}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dates + Value */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contract Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={computedValue > 0 ? computedValue.toFixed(2) : '0.00'}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className={selectCls}>
                  {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-renew */}
            <div className="flex items-start gap-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAutoRenew(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${autoRenew ? 'bg-blue-600' : 'bg-zinc-700'}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoRenew ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
                <label className="text-sm text-zinc-300 cursor-pointer" onClick={() => setAutoRenew(v => !v)}>
                  Auto-Renew
                </label>
              </div>
              {autoRenew && (
                <div className="flex items-center gap-2">
                  <label className={labelCls + ' mb-0'}>Renewal reminder</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={renewDays}
                    onChange={e => setRenewDays(e.target.value)}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-zinc-500">days before expiry</span>
                </div>
              )}
            </div>
          </div>

          {/* Contract Lines */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/40 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Contract Lines</h2>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-zinc-600">
                No line items yet.{' '}
                <button type="button" onClick={addLine} className="text-blue-400 hover:text-blue-300">
                  Add one
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-24">Type</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-20">Qty</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-28">Unit Price</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-28">Total</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map(l => (
                      <tr key={l.id} className="border-b border-zinc-800/20">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={l.description}
                            onChange={e => updateLine(l.id, 'description', e.target.value)}
                            placeholder="Description…"
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={l.lineType}
                            onChange={e => updateLine(l.id, 'lineType', e.target.value)}
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="service">Service</option>
                            <option value="product">Product</option>
                            <option value="fee">Fee</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.quantity}
                            onChange={e => updateLine(l.id, 'quantity', e.target.value)}
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.unitPrice}
                            onChange={e => updateLine(l.id, 'unitPrice', e.target.value)}
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-zinc-100 tabular-nums font-semibold">
                          ${l.lineTotal.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeLine(l.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700/50 bg-zinc-800/20">
                      <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Lines Total
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm font-bold text-zinc-100 tabular-nums">
                        ${computedValue.toFixed(2)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Terms & Notes */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800/40 pb-3">Terms & Notes</h2>
            <div>
              <label className={labelCls}>Contract Terms</label>
              <textarea
                value={terms}
                onChange={e => setTerms(e.target.value)}
                placeholder="Contract terms and conditions…"
                rows={5}
                className={inputCls + ' resize-none'}
              />
            </div>
            <div>
              <label className={labelCls}>Internal Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Internal notes (not shown on contract)…"
                rows={3}
                className={inputCls + ' resize-none'}
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/contracts"
              className="px-4 py-2 rounded text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating…' : 'Create Contract'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
