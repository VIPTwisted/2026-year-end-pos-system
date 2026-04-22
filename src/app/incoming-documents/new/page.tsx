'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileSearch, Upload, X } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  vendorCode: string
}

const SOURCE_TYPES = [
  { value: 'upload', label: 'File Upload' },
  { value: 'email', label: 'Email' },
  { value: 'scanner', label: 'Scanner' },
]

const DOC_TYPES = [
  { value: 'vendor_invoice', label: 'Vendor Invoice' },
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
]

export default function NewIncomingDocumentPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [sourceType, setSourceType] = useState('upload')
  const [documentType, setDocumentType] = useState('vendor_invoice')
  const [vendorId, setVendorId] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [taxAmount, setTaxAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [fileName, setFileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/vendors')
      .then(r => r.json())
      .then(d => setVendors(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  function handleVendorChange(id: string) {
    setVendorId(id)
    const v = vendors.find(v => v.id === id)
    if (v) setVendorName(v.name)
  }

  async function submit() {
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/incoming-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          documentType,
          vendorId: vendorId || null,
          vendorName: vendorName || null,
          invoiceNumber: invoiceNumber || null,
          invoiceDate: invoiceDate ? invoiceDate : null,
          dueDate: dueDate ? dueDate : null,
          amount: amount ? parseFloat(amount) : null,
          currency,
          taxAmount: taxAmount ? parseFloat(taxAmount) : null,
          notes: notes || null,
          fileName: fileName || null,
          status: 'pending',
        }),
      })
      if (!res.ok) {
        const e = await res.json()
        setError(e.error ?? 'Failed to create document')
        setSaving(false)
        return
      }
      router.push('/incoming-documents')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              <FileSearch className="w-6 h-6 text-violet-400" />
              New Incoming Document
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Upload or register a new vendor document</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1.5 border border-zinc-700/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">File</p>
          <div className="border-2 border-dashed border-zinc-700/60 rounded-xl p-8 text-center hover:border-violet-500/50 transition-colors">
            <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 mb-1">Drag &amp; drop or click to upload</p>
            <p className="text-xs text-zinc-600">PDF, PNG, JPG, TIFF — max 25 MB</p>
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="Enter file name manually (demo mode)…"
              className="mt-4 w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Source & Type */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Classification</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Source Type</label>
              <select
                value={sourceType}
                onChange={e => setSourceType(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              >
                {SOURCE_TYPES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Document Type</label>
              <select
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              >
                {DOC_TYPES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vendor */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Vendor</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Vendor (from directory)</label>
              <select
                value={vendorId}
                onChange={e => handleVendorChange(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              >
                <option value="">— Select Vendor —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.vendorCode} — {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Vendor Name (override)</label>
              <input
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
                placeholder="As shown on document…"
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Invoice Details</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Invoice Number</label>
              <input
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="INV-XXXXX"
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Tax Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxAmount}
                onChange={e => setTaxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              >
                {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Notes</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes about this document…"
            className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg border border-zinc-700/50 text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Create Document'}
          </button>
        </div>

      </div>
    </div>
  )
}
