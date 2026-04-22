'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, X, ChevronDown } from 'lucide-react'

export default function NewBankAccountPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const [form, setForm] = useState({
    accountCode: '',
    name: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    currency: 'USD',
    currentBalance: '0',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    swiftCode: '',
    ibanNumber: '',
    notes: '',
  })

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.accountCode.trim() || !form.bankName.trim() || !form.accountNumber.trim()) {
      notify('No., Bank Name, and Account No. are required', 'err')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          currentBalance: parseFloat(form.currentBalance) || 0,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        notify(d.error ?? 'Save failed', 'err')
        return
      }
      const acct = await res.json()
      notify('Bank account created')
      router.push(`/finance/bank-accounts/${acct.id}`)
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="New Bank Account"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Bank Accounts', href: '/finance/bank-accounts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => router.push('/finance/bank-accounts')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        }
      />

      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-[13px] font-medium ${
            toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="max-w-3xl space-y-4">
          {/* General FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 list-none">
              <span className="text-[13px] font-semibold text-zinc-100">General</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FF label="No. *">
                <input value={form.accountCode} onChange={e => set('accountCode', e.target.value)} placeholder="MAIN-CHK" className={inp} />
              </FF>
              <FF label="Name">
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Main Checking Account" className={inp} />
              </FF>
              <FF label="Bank Name *">
                <input value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="First National Bank" className={inp} />
              </FF>
              <FF label="Account No. *">
                <input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="123456789" className={inp} />
              </FF>
              <FF label="Routing No.">
                <input value={form.routingNumber} onChange={e => set('routingNumber', e.target.value)} placeholder="021000089" className={inp} />
              </FF>
              <FF label="Account Type">
                <select value={form.accountType} onChange={e => set('accountType', e.target.value)} className={inp}>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit_line">Credit Line</option>
                </select>
              </FF>
              <FF label="Currency Code">
                <select value={form.currency} onChange={e => set('currency', e.target.value)} className={inp}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </FF>
              <FF label="Opening Balance">
                <input type="number" value={form.currentBalance} onChange={e => set('currentBalance', e.target.value)} className={inp} />
              </FF>
            </div>
          </details>

          {/* Communication FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Communication</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FF label="Contact Name">
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Jane Smith" className={inp} />
              </FF>
              <FF label="Phone No.">
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 555-1234" className={inp} />
              </FF>
              <FF label="E-Mail">
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="banker@fnb.com" className={inp} />
              </FF>
              <FF label="Address">
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" className={inp} />
              </FF>
              <FF label="City">
                <input value={form.city} onChange={e => set('city', e.target.value)} className={inp} />
              </FF>
              <FF label="State">
                <input value={form.state} onChange={e => set('state', e.target.value)} className={inp} />
              </FF>
              <FF label="ZIP Code">
                <input value={form.zip} onChange={e => set('zip', e.target.value)} className={inp} />
              </FF>
            </div>
          </details>

          {/* Transfer FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Transfer</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FF label="SWIFT Code">
                <input value={form.swiftCode} onChange={e => set('swiftCode', e.target.value)} placeholder="FNBAUS3L" className={inp} />
              </FF>
              <FF label="IBAN No.">
                <input value={form.ibanNumber} onChange={e => set('ibanNumber', e.target.value)} placeholder="US00 0000 0000 0000" className={inp} />
              </FF>
            </div>
          </details>
        </div>
      </div>
    </>
  )
}

const inp = 'w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500'

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
