'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TrendingDown, Wrench, Trash2, Shield, X } from 'lucide-react'

type Props = {
  assetId: string
  status: string
}

type ModalType = 'depreciate' | 'maintenance' | 'dispose' | 'insurance' | null

export default function FAActions({ assetId, status }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<ModalType>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<string | null>(null)

  // Depreciation form
  const [deprDate, setDeprDate] = useState(new Date().toISOString().split('T')[0])
  const [bookCode, setBookCode] = useState('COMPANY')

  // Maintenance form
  const [maintDesc, setMaintDesc] = useState('')
  const [maintAmount, setMaintAmount] = useState('')
  const [maintVendor, setMaintVendor] = useState('')
  const [maintInvoice, setMaintInvoice] = useState('')
  const [maintServiceDate, setMaintServiceDate] = useState(new Date().toISOString().split('T')[0])
  const [maintNextDate, setMaintNextDate] = useState('')

  // Disposal form
  const [dispDate, setDispDate] = useState(new Date().toISOString().split('T')[0])
  const [dispAmount, setDispAmount] = useState('')
  const [dispDesc, setDispDesc] = useState('Asset disposal')

  // Insurance form
  const [insPolicyNo, setInsPolicyNo] = useState('')
  const [insInsurer, setInsInsurer] = useState('')
  const [insDesc, setInsDesc] = useState('')
  const [insPremium, setInsPremium] = useState('')
  const [insCoverage, setInsCoverage] = useState('')
  const [insStart, setInsStart] = useState('')
  const [insEnd, setInsEnd] = useState('')

  function openModal(type: ModalType) {
    setModal(type)
    setError('')
    setResult(null)
  }

  function closeModal() {
    setModal(null)
    setError('')
    setResult(null)
  }

  async function postDepreciation() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/fixed-assets/${assetId}/depreciate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postingDate: new Date(deprDate).toISOString(), bookCode }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      setResult(`Depreciation posted: $${data.amount.toFixed(2)} | New book value: $${data.newBookValue.toFixed(2)}`)
      router.refresh()
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  async function postMaintenance() {
    if (!maintDesc.trim()) { setError('Description is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/fixed-assets/${assetId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: maintDesc.trim(),
          amount: parseFloat(maintAmount) || 0,
          vendor: maintVendor.trim() || null,
          invoiceNo: maintInvoice.trim() || null,
          serviceDate: new Date(maintServiceDate).toISOString(),
          nextServiceDate: maintNextDate ? new Date(maintNextDate).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      setResult('Maintenance record saved.')
      router.refresh()
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  async function postDisposal() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/fixed-assets/${assetId}/dispose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disposalDate: new Date(dispDate).toISOString(),
          saleAmount: parseFloat(dispAmount) || 0,
          description: dispDesc.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      const gainLabel = data.gain >= 0 ? `Gain: $${data.gain.toFixed(2)}` : `Loss: $${Math.abs(data.gain).toFixed(2)}`
      setResult(`Asset disposed. ${gainLabel}`)
      router.refresh()
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  async function postInsurance() {
    if (!insPolicyNo.trim()) { setError('Policy number is required'); return }
    if (!insInsurer.trim()) { setError('Insurer name is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/fixed-assets/${assetId}/insurance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNo: insPolicyNo.trim(),
          insurerName: insInsurer.trim(),
          description: insDesc.trim() || null,
          annualPremium: parseFloat(insPremium) || 0,
          coverageAmount: parseFloat(insCoverage) || 0,
          startDate: insStart ? new Date(insStart).toISOString() : null,
          endDate: insEnd ? new Date(insEnd).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      setResult('Insurance policy added.')
      router.refresh()
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5'

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => openModal('depreciate')}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm h-9 gap-2"
        >
          <TrendingDown className="w-4 h-4" />
          Post Depreciation
        </Button>
        <Button
          onClick={() => openModal('maintenance')}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm h-9 gap-2"
        >
          <Wrench className="w-4 h-4" />
          Record Maintenance
        </Button>
        <Button
          onClick={() => openModal('insurance')}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm h-9 gap-2"
        >
          <Shield className="w-4 h-4" />
          Add Insurance
        </Button>
        {status === 'active' && (
          <Button
            onClick={() => openModal('dispose')}
            variant="outline"
            className="border-red-800/60 text-red-400 hover:bg-red-500/10 text-sm h-9 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Dispose Asset
          </Button>
        )}
      </div>

      {/* Modal Backdrop */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-zinc-100">
                {modal === 'depreciate' && 'Post Depreciation'}
                {modal === 'maintenance' && 'Record Maintenance'}
                {modal === 'dispose' && 'Dispose Asset'}
                {modal === 'insurance' && 'Add Insurance Policy'}
              </h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4 text-sm text-red-400">
                {error}
              </div>
            )}
            {result && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 mb-4 text-sm text-emerald-400">
                {result}
              </div>
            )}

            {/* Depreciation Modal */}
            {modal === 'depreciate' && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Posting Date</label>
                  <input type="date" className={inputCls} value={deprDate} onChange={e => setDeprDate(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Book Code</label>
                  <input className={inputCls} value={bookCode} onChange={e => setBookCode(e.target.value)} placeholder="COMPANY" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={closeModal} className="border-zinc-700 text-zinc-400">Cancel</Button>
                  <Button onClick={postDepreciation} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
                    {loading ? 'Posting…' : 'Post Depreciation'}
                  </Button>
                </div>
              </div>
            )}

            {/* Maintenance Modal */}
            {modal === 'maintenance' && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input className={inputCls} value={maintDesc} onChange={e => setMaintDesc(e.target.value)} placeholder="e.g. Annual service" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Amount ($)</label>
                    <input type="number" min="0" step="0.01" className={inputCls} value={maintAmount} onChange={e => setMaintAmount(e.target.value)} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelCls}>Service Date</label>
                    <input type="date" className={inputCls} value={maintServiceDate} onChange={e => setMaintServiceDate(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Vendor</label>
                    <input className={inputCls} value={maintVendor} onChange={e => setMaintVendor(e.target.value)} placeholder="Optional vendor" />
                  </div>
                  <div>
                    <label className={labelCls}>Invoice #</label>
                    <input className={inputCls} value={maintInvoice} onChange={e => setMaintInvoice(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Next Service Date</label>
                  <input type="date" className={inputCls} value={maintNextDate} onChange={e => setMaintNextDate(e.target.value)} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={closeModal} className="border-zinc-700 text-zinc-400">Cancel</Button>
                  <Button onClick={postMaintenance} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
                    {loading ? 'Saving…' : 'Save Record'}
                  </Button>
                </div>
              </div>
            )}

            {/* Disposal Modal */}
            {modal === 'dispose' && (
              <div className="space-y-4">
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-300">
                  This action is irreversible. The asset status will be set to Disposed.
                </div>
                <div>
                  <label className={labelCls}>Disposal Date</label>
                  <input type="date" className={inputCls} value={dispDate} onChange={e => setDispDate(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Sale Amount ($)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} value={dispAmount} onChange={e => setDispAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <input className={inputCls} value={dispDesc} onChange={e => setDispDesc(e.target.value)} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={closeModal} className="border-zinc-700 text-zinc-400">Cancel</Button>
                  <Button onClick={postDisposal} disabled={loading} className="bg-red-600 hover:bg-red-500 text-white">
                    {loading ? 'Disposing…' : 'Confirm Disposal'}
                  </Button>
                </div>
              </div>
            )}

            {/* Insurance Modal */}
            {modal === 'insurance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Policy # <span className="text-red-400">*</span></label>
                    <input className={inputCls} value={insPolicyNo} onChange={e => setInsPolicyNo(e.target.value)} placeholder="POL-12345" />
                  </div>
                  <div>
                    <label className={labelCls}>Insurer <span className="text-red-400">*</span></label>
                    <input className={inputCls} value={insInsurer} onChange={e => setInsInsurer(e.target.value)} placeholder="Insurer name" />
                  </div>
                  <div>
                    <label className={labelCls}>Annual Premium ($)</label>
                    <input type="number" min="0" step="0.01" className={inputCls} value={insPremium} onChange={e => setInsPremium(e.target.value)} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelCls}>Coverage Amount ($)</label>
                    <input type="number" min="0" step="0.01" className={inputCls} value={insCoverage} onChange={e => setInsCoverage(e.target.value)} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="date" className={inputCls} value={insStart} onChange={e => setInsStart(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="date" className={inputCls} value={insEnd} onChange={e => setInsEnd(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <input className={inputCls} value={insDesc} onChange={e => setInsDesc(e.target.value)} placeholder="Optional notes" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={closeModal} className="border-zinc-700 text-zinc-400">Cancel</Button>
                  <Button onClick={postInsurance} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
                    {loading ? 'Saving…' : 'Add Policy'}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
