'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'

type Store = { id: string; name: string }

const INPUT_CLS = 'w-full rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60'
const LABEL_CLS = 'block text-[10px] uppercase tracking-wide text-zinc-500 mb-1'

function FastTab({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 text-[13px] font-semibold text-zinc-200 hover:bg-zinc-800/30 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>
      {open && <div className="px-5 py-4 border-t border-zinc-800/50">{children}</div>}
    </div>
  )
}

export default function NewEmployeePage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tabs, setTabs] = useState({ general: true, communication: false, administration: false, personal: false, payments: false })

  const [form, setForm] = useState({
    // General
    firstName: '',
    lastName: '',
    position: '',
    department: '',
    storeId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    hourlyRate: '',
    // Communication
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    // Administration
    employmentType: 'Full-Time',
    employeeNo: '',
    managerName: '',
    // Personal
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    // Payments
    bankAccount: '',
    paymentMethod: 'Direct Deposit',
  })

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then((data: Store[]) => setStores(data))
      .catch(() => setError('Failed to load stores'))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function toggleTab(tab: keyof typeof tabs) {
    setTabs(prev => ({ ...prev, [tab]: !prev[tab] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) { setError('Email is required (Communication tab)'); return }
    setLoading(true)
    setError(null)

    const payload = {
      firstName:  form.firstName.trim(),
      lastName:   form.lastName.trim(),
      email:      form.email.trim(),
      position:   form.position.trim(),
      department: form.department.trim() || undefined,
      storeId:    form.storeId,
      hireDate:   form.hireDate || undefined,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
    }

    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to create employee')
      }
      router.push('/hr/employees')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Employee Card — New" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-4 max-w-4xl">

          <div className="flex items-center gap-3">
            <Link href="/hr/employees" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Employees
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-400">New</span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
            <h2 className="text-[18px] font-semibold text-zinc-100">New Employee</h2>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/30 border border-red-700/50 px-4 py-3 text-[12px] text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* General FastTab */}
            <FastTab title="General" open={tabs.general} onToggle={() => toggleTab('general')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>First Name *</label>
                  <input name="firstName" required value={form.firstName} onChange={handleChange} className={INPUT_CLS} placeholder="Jane" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Last Name *</label>
                  <input name="lastName" required value={form.lastName} onChange={handleChange} className={INPUT_CLS} placeholder="Smith" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Job Title *</label>
                  <input name="position" required value={form.position} onChange={handleChange} className={INPUT_CLS} placeholder="Cashier" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Department</label>
                  <input name="department" value={form.department} onChange={handleChange} className={INPUT_CLS} placeholder="Sales" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Store / Location *</label>
                  <select name="storeId" required value={form.storeId} onChange={handleChange} className={INPUT_CLS}>
                    <option value="">Select store…</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Employment Date</label>
                  <input name="hireDate" type="date" value={form.hireDate} onChange={handleChange} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Hourly Rate ($)</label>
                  <input name="hourlyRate" type="number" step="0.01" min="0" value={form.hourlyRate} onChange={handleChange} className={INPUT_CLS} placeholder="18.00" />
                </div>
              </div>
            </FastTab>

            {/* Communication FastTab */}
            <FastTab title="Communication" open={tabs.communication} onToggle={() => toggleTab('communication')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className={INPUT_CLS} placeholder="jane.smith@example.com" />
                  <p className="mt-1 text-[10px] text-zinc-600">Login email. Default password: <span className="font-mono">Welcome1!</span></p>
                </div>
                <div>
                  <label className={LABEL_CLS}>Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={INPUT_CLS} placeholder="+1 555 000 0000" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Mobile</label>
                  <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Address</label>
                  <input name="address" value={form.address} onChange={handleChange} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>City</label>
                  <input name="city" value={form.city} onChange={handleChange} className={INPUT_CLS} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL_CLS}>State</label>
                    <input name="state" value={form.state} onChange={handleChange} className={INPUT_CLS} placeholder="CA" />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Postal Code</label>
                    <input name="postalCode" value={form.postalCode} onChange={handleChange} className={INPUT_CLS} placeholder="90210" />
                  </div>
                </div>
              </div>
            </FastTab>

            {/* Administration FastTab */}
            <FastTab title="Administration" open={tabs.administration} onToggle={() => toggleTab('administration')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Employment Type</label>
                  <select name="employmentType" value={form.employmentType} onChange={handleChange} className={INPUT_CLS}>
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Contractor</option>
                    <option>Seasonal</option>
                    <option>Intern</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Manager</label>
                  <input name="managerName" value={form.managerName} onChange={handleChange} className={INPUT_CLS} placeholder="Manager name" />
                </div>
              </div>
            </FastTab>

            {/* Personal FastTab */}
            <FastTab title="Personal" open={tabs.personal} onToggle={() => toggleTab('personal')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Date of Birth</label>
                  <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className={INPUT_CLS}>
                    <option value="">Prefer not to say</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Marital Status</label>
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={INPUT_CLS}>
                    <option value="">—</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>
              </div>
            </FastTab>

            {/* Payments FastTab */}
            <FastTab title="Payments" open={tabs.payments} onToggle={() => toggleTab('payments')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Payment Method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={INPUT_CLS}>
                    <option>Direct Deposit</option>
                    <option>Check</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Bank Account No.</label>
                  <input name="bankAccount" value={form.bankAccount} onChange={handleChange} className={INPUT_CLS} placeholder="XXXXXX1234" />
                </div>
              </div>
            </FastTab>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-[12px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Saving…' : 'Save Employee'}
              </button>
              <Link href="/hr/employees">
                <button type="button" className="px-4 py-2 text-[12px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
