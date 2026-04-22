'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

const ENTITY_TYPES = ['', 'Customer', 'Vendor', 'Employee', 'Contact']

export default function NewAddressRecordPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    partyType: 'person',
    name: '',
    shortName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    taxId: '',
    linkedEntityType: '',
    linkedEntityId: '',
  })

  function set(key: string, val: string) {
    setForm(p => ({ ...p, [key]: val }))
  }

  async function save() {
    if (!form.name) return
    setSaving(true)
    const res = await fetch('/api/admin/global-address-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const rec = await res.json()
      router.push(`/admin/global-address-book/${rec.id}`)
    }
    setSaving(false)
  }

  const field = (label: string, key: string, type = 'text') => (
    <div>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      <input
        type={type}
        value={(form as Record<string, string>)[key]}
        onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600"
      />
    </div>
  )

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="New Address Record"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Global Address Book', href: '/admin/global-address-book' },
        ]}
      />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Party Type */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Party Info</h3>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Party Type</label>
            <select
              value={form.partyType}
              onChange={e => set('partyType', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600"
            >
              <option value="person">Person</option>
              <option value="organization">Organization</option>
            </select>
          </div>
          {field('Full Name *', 'name')}
          {field('Short Name', 'shortName')}
          {field('Tax ID / EIN', 'taxId')}
        </div>

        {/* Contact */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Contact</h3>
          {field('Email', 'email', 'email')}
          {field('Phone', 'phone', 'tel')}
        </div>

        {/* Address */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Address</h3>
          {field('Address Line 1', 'address1')}
          {field('Address Line 2', 'address2')}
          <div className="grid grid-cols-2 gap-4">
            {field('City', 'city')}
            {field('State', 'state')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Postal Code', 'postalCode')}
            {field('Country', 'country')}
          </div>
        </div>

        {/* Linked Entity */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Linked Entity</h3>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Entity Type</label>
            <select
              value={form.linkedEntityType}
              onChange={e => set('linkedEntityType', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600"
            >
              {ENTITY_TYPES.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
            </select>
          </div>
          {field('Entity ID', 'linkedEntityId')}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !form.name}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>
    </main>
  )
}
