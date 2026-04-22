'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // General
    firstName: '', lastName: '', creditLimit: '', blocked: 'None',
    // Address & Contact
    address: '', address2: '', city: '', state: '', zip: '', country: 'US',
    phone: '', email: '', fax: '', homepage: '',
    // Invoicing
    taxAreaCode: '', taxLiable: 'Yes', paymentTermsCode: 'NET30',
    paymentMethodCode: '', invoiceDiscCode: '', customerPriceGroup: '',
    languageCode: 'ENU', vatRegistrationNo: '',
    // Payments
    applicationMethod: 'Manual', cashFlowPaymentTerms: '',
    blockPaymentTolerance: 'No', preferredBankAccount: '',
    // Shipping
    shipToCode: '', locationCode: '', shippingAgent: '',
    shippingAgentService: '', shippingTime: '', baseCalendarCode: '',
    // Notes
    notes: '', tags: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        zip: form.zip.trim() || undefined,
        notes: form.notes.trim() || undefined,
        tags: form.tags.trim() || undefined,
        creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : 0,
        isActive: form.blocked !== 'All',
        creditStatus: form.blocked === 'Invoice' ? 'hold' : 'good',
      }
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/customers/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors'
  const sel = inp + ' cursor-pointer'
  const lbl = 'block text-[10px] uppercase tracking-widest text-zinc-500 mb-1'

  return (
    <>
      <TopBar title="Customer Card – New" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Breadcrumb */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/customers" className="hover:text-zinc-300 transition-colors">Customers</Link>
          <span>/</span>
          <span className="text-zinc-300">New</span>
        </div>

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <button
            type="submit"
            form="customer-form"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-600 border border-blue-600 rounded transition-colors disabled:opacity-50"
          >
            <Save className="w-3 h-3" /> {loading ? 'Saving…' : 'Save'}
          </button>
          <Link href="/customers">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <X className="w-3 h-3" /> Cancel
            </button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center gap-3">
          <Link href="/customers" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold text-zinc-100">New Customer</h1>
        </div>

        <form id="customer-form" onSubmit={handleSubmit} className="px-6 py-4 flex gap-4">
          <div className="flex-1 space-y-2">

            {/* General */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> General
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className={lbl}>First Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="First" className={inp} required />
                </div>
                <div>
                  <label className={lbl}>Last Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Last" className={inp} required />
                </div>
                <div>
                  <label className={lbl}>Credit Limit (LCY)</label>
                  <input type="number" min="0" step="0.01" value={form.creditLimit} onChange={set('creditLimit')} placeholder="0.00" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Blocked</label>
                  <select value={form.blocked} onChange={set('blocked')} className={sel}>
                    <option value="None">None</option>
                    <option value="Ship">Ship</option>
                    <option value="Invoice">Invoice</option>
                    <option value="All">All</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Tags</label>
                  <input type="text" value={form.tags} onChange={set('tags')} placeholder="wholesale, vip" className={inp} />
                </div>
              </div>
            </details>

            {/* Address & Contact */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Address &amp; Contact
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className={lbl}>Address</label>
                  <input type="text" value={form.address} onChange={set('address')} placeholder="123 Main St" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Address 2</label>
                  <input type="text" value={form.address2} onChange={set('address2')} placeholder="Suite 100" className={inp} />
                </div>
                <div>
                  <label className={lbl}>City</label>
                  <input type="text" value={form.city} onChange={set('city')} placeholder="Austin" className={inp} />
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <input type="text" value={form.state} onChange={set('state')} placeholder="TX" maxLength={2} className={inp} />
                </div>
                <div>
                  <label className={lbl}>ZIP / Post Code</label>
                  <input type="text" value={form.zip} onChange={set('zip')} placeholder="78701" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Country / Region</label>
                  <input type="text" value={form.country} onChange={set('country')} placeholder="US" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Phone</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="512-555-0100" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="customer@email.com" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Fax</label>
                  <input type="tel" value={form.fax} onChange={set('fax')} placeholder="512-555-0199" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Homepage</label>
                  <input type="url" value={form.homepage} onChange={set('homepage')} placeholder="https://example.com" className={inp} />
                </div>
              </div>
            </details>

            {/* Invoicing */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Invoicing
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className={lbl}>Tax Area Code</label>
                  <input type="text" value={form.taxAreaCode} onChange={set('taxAreaCode')} placeholder="TX-AUSTIN" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Tax Liable</label>
                  <select value={form.taxLiable} onChange={set('taxLiable')} className={sel}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Payment Terms Code</label>
                  <select value={form.paymentTermsCode} onChange={set('paymentTermsCode')} className={sel}>
                    <option value="NET30">NET30</option>
                    <option value="NET60">NET60</option>
                    <option value="NET15">NET15</option>
                    <option value="COD">COD</option>
                    <option value="IMMEDIATE">Immediate</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Payment Method Code</label>
                  <input type="text" value={form.paymentMethodCode} onChange={set('paymentMethodCode')} placeholder="BANK" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Invoice Disc. Code</label>
                  <input type="text" value={form.invoiceDiscCode} onChange={set('invoiceDiscCode')} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Customer Price Group</label>
                  <input type="text" value={form.customerPriceGroup} onChange={set('customerPriceGroup')} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Language Code</label>
                  <select value={form.languageCode} onChange={set('languageCode')} className={sel}>
                    <option value="ENU">ENU (English)</option>
                    <option value="ESP">ESP (Spanish)</option>
                    <option value="FRA">FRA (French)</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>VAT Registration No.</label>
                  <input type="text" value={form.vatRegistrationNo} onChange={set('vatRegistrationNo')} className={inp} />
                </div>
              </div>
            </details>

            {/* Payments */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Payments
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className={lbl}>Application Method</label>
                  <select value={form.applicationMethod} onChange={set('applicationMethod')} className={sel}>
                    <option value="Manual">Manual</option>
                    <option value="Apply to Oldest">Apply to Oldest</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Cash Flow Payment Terms</label>
                  <input type="text" value={form.cashFlowPaymentTerms} onChange={set('cashFlowPaymentTerms')} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Block Payment Tolerance</label>
                  <select value={form.blockPaymentTolerance} onChange={set('blockPaymentTolerance')} className={sel}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Preferred Bank Account</label>
                  <input type="text" value={form.preferredBankAccount} onChange={set('preferredBankAccount')} className={inp} />
                </div>
              </div>
            </details>

            {/* Shipping */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Shipping
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className={lbl}>Ship-to Code</label>
                  <input type="text" value={form.shipToCode} onChange={set('shipToCode')} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Location Code</label>
                  <input type="text" value={form.locationCode} onChange={set('locationCode')} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Shipping Agent</label>
                  <input type="text" value={form.shippingAgent} onChange={set('shippingAgent')} placeholder="UPS / FedEx" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Shipping Agent Service</label>
                  <input type="text" value={form.shippingAgentService} onChange={set('shippingAgentService')} placeholder="GROUND" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Shipping Time</label>
                  <input type="text" value={form.shippingTime} onChange={set('shippingTime')} placeholder="3D" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Base Calendar Code</label>
                  <input type="text" value={form.baseCalendarCode} onChange={set('baseCalendarCode')} className={inp} />
                </div>
              </div>
            </details>

            {/* Notes */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Notes
              </summary>
              <div className="px-4 pb-4 pt-2">
                <textarea value={form.notes} onChange={set('notes')} placeholder="Internal notes…" rows={4} className={inp + ' resize-none'} />
              </div>
            </details>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

          </div>

          {/* Right sidebar placeholder */}
          <div className="w-72 shrink-0">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Quick Info</p>
              <p className="text-xs text-zinc-600">Fill in the customer details and click <strong className="text-zinc-400">Save</strong> to create the record.</p>
            </div>
          </div>
        </form>
      </main>
    </>
  )
}
