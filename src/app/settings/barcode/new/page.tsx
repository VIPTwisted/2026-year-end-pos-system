'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Barcode, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700/60 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

export default function NewBarcodeRulePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    itemNo: '',
    uomCode: 'EA',
    barcode: '',
    qtyPerUom: '1',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave() {
    setError('')
    if (!form.itemNo.trim()) { setError('Item No. is required'); return }
    if (!form.barcode.trim()) { setError('Barcode Value is required'); return }
    if (!form.uomCode.trim()) { setError('Unit of Measure is required'); return }

    setSaving(true)
    try {
      // PATCH barcode settings to append this UOM barcode row
      const getRes = await fetch('/api/settings/barcode')
      const existing = await getRes.json()
      const uomBarcodes = [...(existing.uomBarcodes ?? []), {
        id: `new-${Date.now()}`,
        itemNo: form.itemNo.trim(),
        uomCode: form.uomCode.trim().toUpperCase(),
        barcode: form.barcode.trim(),
        qtyPerUom: form.qtyPerUom || '1',
      }]
      const res = await fetch('/api/settings/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: existing.settings, uomBarcodes }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Save failed')
        setSaving(false)
        return
      }
      router.push('/settings/barcode')
    } catch {
      setError('Network error')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Barcode Rule" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/settings/barcode"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Barcode Settings
            </Link>
            <span className="text-zinc-700">›</span>
            <Barcode className="w-4 h-4 text-zinc-400" />
            <span className="font-bold text-base text-zinc-100">New Barcode Rule</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings/barcode"
              className="h-7 px-3 text-[12px] font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 rounded transition-colors">
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-7 px-3 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded transition-colors inline-flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded bg-red-500/10 border border-red-500/30 text-[13px] text-red-400">
            {error}
          </div>
        )}

        <div className="px-6 py-4 max-w-lg">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">

            <div>
              <label className={labelCls}>Item No. <span className="text-red-400">*</span></label>
              <input
                value={form.itemNo}
                onChange={set('itemNo')}
                placeholder="Search or enter item number"
                className={inputCls}
                autoFocus
              />
              <p className="text-[11px] text-zinc-600 mt-1">Enter the Item No. (SKU) this barcode belongs to.</p>
            </div>

            <div>
              <label className={labelCls}>Unit of Measure <span className="text-red-400">*</span></label>
              <input
                value={form.uomCode}
                onChange={e => setForm(prev => ({ ...prev, uomCode: e.target.value.toUpperCase() }))}
                placeholder="EA"
                maxLength={10}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Barcode Value <span className="text-red-400">*</span></label>
              <input
                value={form.barcode}
                onChange={set('barcode')}
                placeholder="0123456789012"
                className={inputCls}
              />
              <p className="text-[11px] text-zinc-600 mt-1">EAN-13, UPC-A, Code 128, QR code value, etc.</p>
            </div>

            <div>
              <label className={labelCls}>Qty per UOM</label>
              <input
                value={form.qtyPerUom}
                onChange={set('qtyPerUom')}
                type="number"
                min="0.001"
                step="0.001"
                placeholder="1"
                className={inputCls}
              />
              <p className="text-[11px] text-zinc-600 mt-1">Quantity represented by scanning this barcode once.</p>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
