'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Save, X, Building2 } from 'lucide-react'

const inputCls =
  'w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls =
  'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

type Tab = 'General' | 'Communication' | 'Invoicing' | 'Payments' | 'Receiving' | 'Foreign Trade'
const TABS: Tab[] = ['General', 'Communication', 'Invoicing', 'Payments', 'Receiving', 'Foreign Trade']

export default function NewPurchaseVendorPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('General')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // General
    vendorCode: '',
    name: '',
    vendorGroupId: '',
    blocked: false,
    // Communication
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: '',
    // Invoicing
    taxId: '',
    currency: 'USD',
    paymentTerms: 'Net 30',
    paymentMethod: 'Check',
    // Payments
    applicationMethod: 'Manual',
    // Receiving
    locationCode: '',
    shipmentMethod: '',
    // Foreign Trade
    transactionType: '',
    notes: '',
  })

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/purchase/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          vendorCode: form.vendorCode.trim() || undefined,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          zip: form.zip.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          taxId: form.taxId.trim() || null,
          currency: form.currency || 'USD',
          paymentTerms: form.paymentTerms || null,
          paymentMethod: form.paymentMethod || null,
          notes: form.notes.trim() || null,
          isActive: !form.blocked,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/purchase/vendors/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar
        title="New Vendor"
        breadcrumb={[
          { label: 'Purchase', href: '/purchase' },
          { label: 'Vendors', href: '/purchase/vendors' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="vendor-form"
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" /> {loading ? 'Saving…' : 'Save'}
            </button>
            <Link
              href="/purchase/vendors"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </Link>
          </div>
        }
      />

      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-6 py-4 mb-4 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-zinc-400" />
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                {form.name || <span className="text-zinc-500 italic">New Vendor</span>}
              </h2>
              {form.vendorCode && (
                <p className="text-[11px] text-zinc-500 font-mono">{form.vendorCode}</p>
              )}
            </div>
          </div>

          {/* FastTab bar */}
          <div className="flex border-b border-zinc-800/50 mb-0">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-300'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form id="vendor-form" onSubmit={handleSubmit}>
            <div className="bg-[#16213e] border border-zinc-800/50 border-t-0 rounded-b-lg p-6">

              {/* General Tab */}
              {activeTab === 'General' && (
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className={labelCls}>No. (Vendor Code)</label>
                    <input
                      type="text"
                      value={form.vendorCode}
                      onChange={set('vendorCode')}
                      placeholder="Auto-generated"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Vendor company name"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Vendor Posting Group</label>
                    <select value={form.vendorGroupId} onChange={set('vendorGroupId')} className={inputCls}>
                      <option value="">— Select —</option>
                      <option value="DOMESTIC">DOMESTIC</option>
                      <option value="FOREIGN">FOREIGN</option>
                      <option value="INTERCOMPANY">INTERCOMPANY</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Gen. Bus. Posting Group</label>
                    <select className={inputCls}>
                      <option value="DOMESTIC">DOMESTIC</option>
                      <option value="EXPORT">EXPORT</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="blocked"
                      checked={form.blocked}
                      onChange={e => setForm(prev => ({ ...prev, blocked: e.target.checked }))}
                      className="w-3.5 h-3.5 rounded border-zinc-600"
                    />
                    <label htmlFor="blocked" className="text-[13px] text-zinc-300 cursor-pointer">Blocked</label>
                  </div>
                </div>
              )}

              {/* Communication Tab */}
              {activeTab === 'Communication' && (
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <div className="col-span-3">
                    <label className={labelCls}>Address</label>
                    <input type="text" value={form.address} onChange={set('address')} placeholder="Street address" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input type="text" value={form.city} onChange={set('city')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State / Province</label>
                    <input type="text" value={form.state} onChange={set('state')} maxLength={2} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>ZIP / Postal Code</label>
                    <input type="text" value={form.zip} onChange={set('zip')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone No.</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="555-555-0100" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="vendor@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Country / Region Code</label>
                    <select className={inputCls}>
                      <option value="US">US</option>
                      <option value="CA">CA</option>
                      <option value="GB">GB</option>
                      <option value="DE">DE</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Invoicing Tab */}
              {activeTab === 'Invoicing' && (
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className={labelCls}>VAT Registration No.</label>
                    <input type="text" value={form.taxId} onChange={set('taxId')} placeholder="Tax / VAT ID" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Currency Code</label>
                    <select value={form.currency} onChange={set('currency')} className={inputCls}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Payment Terms Code</label>
                    <select value={form.paymentTerms} onChange={set('paymentTerms')} className={inputCls}>
                      <option>Net 15</option>
                      <option>Net 30</option>
                      <option>Net 60</option>
                      <option>Net 90</option>
                      <option>COD</option>
                      <option>2/10 Net 30</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Payment Method Code</label>
                    <select value={form.paymentMethod} onChange={set('paymentMethod')} className={inputCls}>
                      <option>Check</option>
                      <option>ACH</option>
                      <option>Wire</option>
                      <option>Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Vendor Invoice No. Series</label>
                    <input type="text" placeholder="AUTO" className={inputCls} readOnly />
                  </div>
                  <div>
                    <label className={labelCls}>Price Incl. VAT</label>
                    <select className={inputCls}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'Payments' && (
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className={labelCls}>Application Method</label>
                    <select value={form.applicationMethod} onChange={set('applicationMethod')} className={inputCls}>
                      <option>Manual</option>
                      <option>Apply to Oldest</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Payment Terms Code</label>
                    <input type="text" value={form.paymentTerms} readOnly className={inputCls + ' opacity-60'} />
                  </div>
                  <div>
                    <label className={labelCls}>Preferred Bank Account</label>
                    <input type="text" placeholder="— None —" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Partner Type</label>
                    <select className={inputCls}>
                      <option value="">— None —</option>
                      <option value="Company">Company</option>
                      <option value="Person">Person</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Receiving Tab */}
              {activeTab === 'Receiving' && (
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className={labelCls}>Location Code</label>
                    <input type="text" value={form.locationCode} onChange={set('locationCode')} placeholder="e.g. MAIN" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Shipment Method Code</label>
                    <select value={form.shipmentMethod} onChange={set('shipmentMethod')} className={inputCls}>
                      <option value="">— None —</option>
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="EXW">EXW</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Lead Time Calculation</label>
                    <input type="text" placeholder="e.g. 14D" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Over-Receipt Code</label>
                    <input type="text" placeholder="— None —" className={inputCls} />
                  </div>
                </div>
              )}

              {/* Foreign Trade Tab */}
              {activeTab === 'Foreign Trade' && (
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className={labelCls}>Currency Code</label>
                    <input type="text" value={form.currency} readOnly className={inputCls + ' opacity-60'} />
                  </div>
                  <div>
                    <label className={labelCls}>Transaction Type Code</label>
                    <input type="text" value={form.transactionType} onChange={set('transactionType')} placeholder="e.g. PURCHASE" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Transaction Specification</label>
                    <input type="text" placeholder="— None —" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Transport Method</label>
                    <input type="text" placeholder="— None —" className={inputCls} />
                  </div>
                  <div className="col-span-3">
                    <label className={labelCls}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={set('notes')}
                      rows={3}
                      placeholder="Internal notes…"
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 text-[12px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
