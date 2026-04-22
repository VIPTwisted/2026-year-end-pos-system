'use client'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface StoreOption { id: string; name: string }
interface ProfileOption { id: string; name: string }

interface FormState {
  name: string
  registerId: string
  storeId: string
  hardwareProfileId: string
  functionalityProfileId: string
  receiptProfileId: string
  ipAddress: string
  isActive: boolean
}

export default function NewRegisterPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [stores, setStores] = useState<StoreOption[]>([])
  const [hwProfiles, setHwProfiles] = useState<ProfileOption[]>([])
  const [fpProfiles, setFpProfiles] = useState<ProfileOption[]>([])
  const [rpProfiles, setRpProfiles] = useState<ProfileOption[]>([])
  const [form, setForm] = useState<FormState>({
    name: '',
    registerId: '',
    storeId: '',
    hardwareProfileId: '',
    functionalityProfileId: '',
    receiptProfileId: '',
    ipAddress: '',
    isActive: true,
  })

  useEffect(() => {
    async function load() {
      const [storesRes, hwRes, fpRes, rpRes] = await Promise.all([
        fetch('/api/stores'),
        fetch('/api/configuration/hardware-profiles'),
        fetch('/api/configuration/functionality-profiles'),
        fetch('/api/configuration/receipt-profiles'),
      ])
      if (storesRes.ok) setStores(await storesRes.json())
      if (hwRes.ok) setHwProfiles(await hwRes.json())
      if (fpRes.ok) setFpProfiles(await fpRes.json())
      if (rpRes.ok) setRpProfiles(await rpRes.json())
    }
    load()
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        registerId: form.registerId,
        storeId: form.storeId,
        isActive: form.isActive,
      }
      if (form.hardwareProfileId) body.hardwareProfileId = form.hardwareProfileId
      if (form.functionalityProfileId) body.functionalityProfileId = form.functionalityProfileId
      if (form.receiptProfileId) body.receiptProfileId = form.receiptProfileId
      if (form.ipAddress) body.ipAddress = form.ipAddress

      const res = await fetch('/api/configuration/registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create register')
        return
      }
      router.push('/configuration/registers')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'
  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors'
  const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New POS Register" />
      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Register Identity</h2>
            <div>
              <label className={labelCls}>Register ID *</label>
              <input className={inputCls} value={form.registerId} onChange={e => set('registerId', e.target.value)} placeholder="REG-04" required />
            </div>
            <div>
              <label className={labelCls}>Display Name *</label>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Register 4" required />
            </div>
            <div>
              <label className={labelCls}>Store *</label>
              <select className={inputCls} value={form.storeId} onChange={e => set('storeId', e.target.value)} required>
                <option value="">Select store...</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>IP Address</label>
              <input className={inputCls} value={form.ipAddress} onChange={e => set('ipAddress', e.target.value)} placeholder="192.168.1.10" />
            </div>
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Profile Assignments</h2>
            <div>
              <label className={labelCls}>Hardware Profile</label>
              <select className={inputCls} value={form.hardwareProfileId} onChange={e => set('hardwareProfileId', e.target.value)}>
                <option value="">None</option>
                {hwProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Functionality Profile</label>
              <select className={inputCls} value={form.functionalityProfileId} onChange={e => set('functionalityProfileId', e.target.value)}>
                <option value="">None</option>
                {fpProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Receipt Profile</label>
              <select className={inputCls} value={form.receiptProfileId} onChange={e => set('receiptProfileId', e.target.value)}>
                <option value="">None</option>
                {rpProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className={sectionCls}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
              />
              <span className="text-[13px] text-zinc-300">Active</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-800/50 rounded px-4 py-3 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors">
              {saving ? 'Saving...' : 'Create Register'}
            </button>
            <Link href="/configuration/registers" className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
