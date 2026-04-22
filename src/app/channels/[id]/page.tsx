'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Globe, Radio, Save, Plus, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Channel {
  id: string
  retailChannelId: string
  name: string
  searchName: string | null
  channelType: string
  operatingUnitNumber: string | null
  legalEntity: string | null
  warehouse: string | null
  storeTimeZone: string | null
  currency: string
  defaultCustomerName: string | null
  functionalityProfile: string | null
  pricesIncludeSalesTax: boolean
  emailNotificationProfile: string | null
  publishingStatus: string
  languages: Array<{ id: string; languageCode: string; languageName: string; isDefault: boolean }>
  paymentAccounts: Array<{ id: string; accountName: string; accountType: string; connectorName: string | null; isActive: boolean }>
}

export default function ChannelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [form, setForm] = useState<Partial<Channel>>({})

  useEffect(() => {
    fetch(`/api/channels/${id}`)
      .then(r => r.json())
      .then(d => { setChannel(d); setForm(d) })
  }, [id])

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/channels/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    setChannel(d); setForm(d)
    setSaving(false)
  }

  async function publish() {
    setPublishing(true)
    await fetch(`/api/channels/${id}/publish`, { method: 'POST' })
    setChannel(prev => prev ? { ...prev, publishingStatus: 'published' } : prev)
    setPublishing(false)
  }

  async function setDefaultLang(langId: string) {
    await fetch(`/api/channels/${id}/languages/${langId}/default`, { method: 'POST' })
    setChannel(prev => prev ? {
      ...prev,
      languages: prev.languages.map(l => ({ ...l, isDefault: l.id === langId }))
    } : prev)
  }

  if (!channel) return (
    <main className="flex-1 p-6 bg-zinc-950">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-zinc-800 rounded w-64" />
        <div className="h-4 bg-zinc-800 rounded w-40" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-zinc-900 rounded" />)}
        </div>
      </div>
    </main>
  )

  return (
    <main className="flex-1 p-6 overflow-auto bg-zinc-950 space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href="/channels" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs">
            <ChevronLeft className="w-3 h-3" /> Channels
          </Link>
          <span className="text-zinc-700">/</span>
          <h1 className="text-sm font-semibold text-zinc-100">
            {channel.operatingUnitNumber}: {channel.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium',
            channel.publishingStatus === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
          )}>
            <Radio className="w-3 h-3" /> {channel.publishingStatus}
          </span>
          {channel.publishingStatus !== 'published' && (
            <button onClick={publish} disabled={publishing} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* IDENTIFICATION */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-medium">Identification</p>
        <div className="grid grid-cols-3 gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          {[
            { label: 'Retail Channel Id', key: 'retailChannelId' },
            { label: 'Name', key: 'name' },
            { label: 'Search name', key: 'searchName' },
            { label: 'Operating unit number', key: 'operatingUnitNumber' },
            { label: 'Legal entity', key: 'legalEntity' },
            { label: 'Warehouse', key: 'warehouse' },
            { label: 'Store time zone', key: 'storeTimeZone' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs text-zinc-500 mb-1">{field.label}</label>
              <input
                value={(form as Record<string, string | null | boolean>)[field.key] as string ?? ''}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ORDERS */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-medium">Orders</p>
        <div className="grid grid-cols-3 gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Currency</label>
            <select
              value={form.currency ?? 'USD'}
              onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Default customer</label>
            <input
              value={form.defaultCustomerName ?? ''}
              onChange={e => setForm(p => ({ ...p, defaultCustomerName: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
      </section>

      {/* PROFILES */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-medium">Profiles</p>
        <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Functionality profile</label>
            <input
              value={form.functionalityProfile ?? ''}
              onChange={e => setForm(p => ({ ...p, functionalityProfile: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Email notification profile</label>
            <input
              value={form.emailNotificationProfile ?? ''}
              onChange={e => setForm(p => ({ ...p, emailNotificationProfile: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
      </section>

      {/* SALES TAX */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-medium">Sales Tax</p>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(p => ({ ...p, pricesIncludeSalesTax: !p.pricesIncludeSalesTax }))}
              className={cn(
                'w-8 h-4 rounded-full transition-colors cursor-pointer relative',
                form.pricesIncludeSalesTax ? 'bg-blue-600' : 'bg-zinc-700'
              )}
            >
              <div className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform', form.pricesIncludeSalesTax ? 'translate-x-4' : 'translate-x-0.5')} />
            </div>
            <span className="text-xs text-zinc-300">Prices include sales tax</span>
          </label>
        </div>
      </section>

      {/* Languages table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Languages</p>
          <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="w-3 h-3" /> Add language
          </button>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Language code</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Language name</th>
                <th className="text-center px-4 py-2 font-medium uppercase tracking-widest">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {channel.languages.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-600">No languages configured</td></tr>
              ) : channel.languages.map(lang => (
                <tr key={lang.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-300 font-mono">{lang.languageCode}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{lang.languageName}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => setDefaultLang(lang.id)}
                      className={cn(
                        'w-4 h-4 rounded-full border-2 mx-auto flex items-center justify-center transition-colors',
                        lang.isDefault ? 'bg-blue-600 border-blue-600' : 'border-zinc-600 hover:border-zinc-400'
                      )}
                    >
                      {lang.isDefault && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment accounts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Payment Accounts</p>
          <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="w-3 h-3" /> Add account
          </button>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Account name</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Type</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Connector</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {channel.paymentAccounts.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-zinc-600">No payment accounts</td></tr>
              ) : channel.paymentAccounts.map(acct => (
                <tr key={acct.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-300">{acct.accountName}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{acct.accountType}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{acct.connectorName ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={acct.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{acct.isActive ? 'Yes' : 'No'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
