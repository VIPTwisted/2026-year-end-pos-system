'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, Trash2, Link2 } from 'lucide-react'

interface AddressRecord {
  id: string
  partyType: string
  name: string
  shortName: string | null
  email: string | null
  phone: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string
  taxId: string | null
  linkedEntityType: string | null
  linkedEntityId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const dynamic = 'force-dynamic'

const ENTITY_TYPES = ['', 'Customer', 'Vendor', 'Employee', 'Contact']

export default function AddressRecordDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<AddressRecord | null>(null)
  const [form, setForm] = useState<Partial<AddressRecord>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/global-address-book/${id}`)
      .then(r => r.json())
      .then(d => { setRecord(d); setForm(d) })
  }, [id])

  function set(key: string, val: string | boolean) {
    setForm(p => ({ ...p, [key]: val }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/global-address-book/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { const d = await res.json(); setRecord(d); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  async function del() {
    if (!confirm('Delete this record?')) return
    await fetch(`/api/admin/global-address-book/${id}`, { method: 'DELETE' })
    window.location.href = '/admin/global-address-book'
  }

  if (!record) return <main className="flex-1 bg-[#0f0f1a] p-6 text-zinc-500 text-xs">Loading...</main>

  const field = (label: string, key: keyof AddressRecord, type = 'text') => (
    <div>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      <input
        type={type}
        value={(form[key] as string) ?? ''}
        onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600"
      />
    </div>
  )

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title={record.name}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Global Address Book', href: '/admin/global-address-book' },
        ]}
        actions={
          <div className="flex gap-2">
            <button onClick={del} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-800/50 text-red-400 hover:bg-red-900/20 rounded transition-colors">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
              <Save className="w-3 h-3" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Party Info */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Party Info</h3>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Party Type</label>
            <select
              value={form.partyType ?? 'person'}
              onChange={e => set('partyType', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600"
            >
              <option value="person">Person</option>
              <option value="organization">Organization</option>
            </select>
          </div>
          {field('Full Name', 'name')}
          {field('Short Name', 'shortName')}
          {field('Tax ID / EIN', 'taxId')}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive ?? true}
              onChange={e => set('isActive', e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-blue-600"
            />
            <label htmlFor="isActive" className="text-xs text-zinc-400">Active</label>
          </div>
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

        {/* Linked Entity Card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Linked Entity</h3>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Entity Type</label>
            <select
              value={form.linkedEntityType ?? ''}
              onChange={e => set('linkedEntityType', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600"
            >
              {ENTITY_TYPES.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
            </select>
          </div>
          {field('Entity ID', 'linkedEntityId')}
          {record.linkedEntityType && record.linkedEntityId && (
            <div className="text-xs text-zinc-500 bg-zinc-900/50 rounded-lg p-3">
              Linked to <span className="text-blue-400">{record.linkedEntityType}</span> with ID{' '}
              <span className="font-mono text-zinc-300">{record.linkedEntityId}</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-zinc-700">
          Created {new Date(record.createdAt).toLocaleString()} &middot; Updated {new Date(record.updatedAt).toLocaleString()}
        </div>
      </div>
    </main>
  )
}
