'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'

type TabKey = 'General' | 'Communication' | 'Foreign Trade' | 'Related Information'

const TABS: TabKey[] = ['General', 'Communication', 'Foreign Trade', 'Related Information']

interface Form {
  name: string
  contactType: string
  companyName: string
  salesperson: string
  territory: string
  phone: string
  phone2: string
  email: string
  email2: string
  fax: string
  homePage: string
  languageCode: string
  countryCode: string
  vatRegistration: string
  notes: string
}

const EMPTY: Form = {
  name: '', contactType: 'Company', companyName: '', salesperson: '', territory: '',
  phone: '', phone2: '', email: '', email2: '', fax: '', homePage: '',
  languageCode: '', countryCode: '', vatRegistration: '', notes: '',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] text-zinc-400 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder = '' }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
  )
}

export default function NewContactPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('General')
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof Form) { return (v: string) => setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contactType: form.contactType,
          companyName: form.companyName || null,
          phone: form.phone || null,
          email: form.email || null,
          salesperson: form.salesperson || null,
          territory: form.territory || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
      router.push(`/crm/contacts/${data.id}`)
    } catch {
      setError('Network error'); setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/contacts" className="hover:text-zinc-300 transition-colors">Contacts</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">New Contact</span>
      </div>

      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-semibold text-white">New Contact</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/crm/contacts"
            className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-3 px-4 py-2 bg-red-900/30 border border-red-800/50 rounded text-red-400 text-sm">{error}</div>
      )}

      <div className="flex border-b border-zinc-800 px-6 gap-0 mt-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-5">
        {tab === 'General' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            <Field label="Name *">
              <Input value={form.name} onChange={set('name')} />
            </Field>
            <Field label="Type">
              <select value={form.contactType} onChange={e => set('contactType')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option>Company</option>
                <option>Person</option>
              </select>
            </Field>
            <Field label="Company Name">
              <Input value={form.companyName} onChange={set('companyName')} />
            </Field>
            <Field label="Salesperson Code">
              <Input value={form.salesperson} onChange={set('salesperson')} />
            </Field>
            <Field label="Territory Code">
              <Input value={form.territory} onChange={set('territory')} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <textarea value={form.notes} onChange={e => set('notes')(e.target.value)} rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none" />
              </Field>
            </div>
          </div>
        )}

        {tab === 'Communication' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            <Field label="Phone No.">
              <Input value={form.phone} onChange={set('phone')} type="tel" />
            </Field>
            <Field label="Phone No. 2">
              <Input value={form.phone2} onChange={set('phone2')} type="tel" />
            </Field>
            <Field label="E-Mail">
              <Input value={form.email} onChange={set('email')} type="email" />
            </Field>
            <Field label="E-Mail 2">
              <Input value={form.email2} onChange={set('email2')} type="email" />
            </Field>
            <Field label="Fax No.">
              <Input value={form.fax} onChange={set('fax')} />
            </Field>
            <Field label="Home Page">
              <Input value={form.homePage} onChange={set('homePage')} type="url" />
            </Field>
            <Field label="Language Code">
              <Input value={form.languageCode} onChange={set('languageCode')} placeholder="ENU" />
            </Field>
          </div>
        )}

        {tab === 'Foreign Trade' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            <Field label="Country/Region Code">
              <Input value={form.countryCode} onChange={set('countryCode')} placeholder="US" />
            </Field>
            <Field label="VAT Registration No.">
              <Input value={form.vatRegistration} onChange={set('vatRegistration')} />
            </Field>
          </div>
        )}

        {tab === 'Related Information' && (
          <div className="grid grid-cols-1 gap-4 max-w-3xl">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-500 text-sm">Related information will be available after saving the contact.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
