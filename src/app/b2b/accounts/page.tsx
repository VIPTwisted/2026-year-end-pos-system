'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2,
  Plus,
  CheckCircle,
  XCircle,
  Search,
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface B2BAccount {
  id: string
  accountCode: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  paymentTerms: string | null
  priceGroup: string | null
  creditLimit: number
  creditUsed: number
  isApproved: boolean
  isActive: boolean
  createdAt: string
  _count: { orders: number; portalQuotes: number }
}

type TabKey = 'all' | 'pending' | 'approved' | 'inactive'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending Approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'inactive', label: 'Inactive' },
]

const PAYMENT_TERMS = ['NET30', 'NET60', 'NET15', 'COD', 'PREPAID', 'EOM']
const PRICE_GROUPS = ['RETAIL', 'WHOLESALE', 'VIP', 'DISTRIBUTOR']

function CreditBar({ used, limit }: { used: number; limit: number }) {
  if (!limit) return <span className="text-zinc-600 text-xs">No limit</span>
  const pct = Math.min((used / limit) * 100, 100)
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-400 whitespace-nowrap">{pct.toFixed(0)}%</span>
    </div>
  )
}

function NewAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    creditLimit: '',
    paymentTerms: '',
    priceGroup: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/b2b/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, creditLimit: parseFloat(form.creditLimit) || 0 }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to create')
      }
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">New B2B Account</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            {field('Company Name *', 'companyName')}
            {field('Contact Name', 'contactName')}
            {field('Email', 'email', 'email')}
            {field('Phone', 'phone')}
            {field('Address', 'address')}
            {field('City', 'city')}
            {field('State', 'state')}
            {field('Country', 'country')}
            {field('Credit Limit ($)', 'creditLimit', 'number')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Payment Terms</label>
              <select
                value={form.paymentTerms}
                onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="">Select...</option>
                {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Price Group</label>
              <select
                value={form.priceGroup}
                onChange={(e) => setForm((f) => ({ ...f, priceGroup: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="">Select...</option>
                {PRICE_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
            <button
              type="submit"
              disabled={saving || !form.companyName}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium"
            >
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function B2BAccountsPage() {
  const [accounts, setAccounts] = useState<B2BAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tab === 'pending') { params.set('isApproved', 'false'); params.set('isActive', 'true') }
      if (tab === 'approved') { params.set('isApproved', 'true'); params.set('isActive', 'true') }
      if (tab === 'inactive') params.set('isActive', 'false')
      if (search) params.set('search', search)
      const res = await fetch(`/api/b2b/accounts?${params}`)
      const data = await res.json()
      setAccounts(Array.isArray(data) ? data : [])
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [tab, search])

  useEffect(() => { load() }, [load])

  async function approveAccount(id: string) {
    await fetch(`/api/b2b/accounts/${id}/approve`, { method: 'POST' })
    load()
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const totalAccounts = accounts.length
  const approvedCount = accounts.filter((a) => a.isApproved).length
  const pendingCount = accounts.filter((a) => !a.isApproved && a.isActive).length
  const totalCredit = accounts.reduce((s, a) => s + a.creditLimit, 0)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-400" />
              B2B Accounts
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Wholesale customer management</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" /> New Account
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Accounts', value: totalAccounts, icon: Users, color: 'text-blue-400' },
            { label: 'Approved', value: approvedCount, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Pending Approval', value: pendingCount, icon: Clock, color: 'text-amber-400' },
            { label: 'Total Credit Lines', value: fmt(totalCredit), icon: CreditCard, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <p className="text-2xl font-bold text-zinc-100">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  tab === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts..."
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Code', 'Company', 'Contact', 'Terms', 'Credit Used', 'Orders', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">No accounts found</td>
                </tr>
              ) : (
                accounts.map((a) => (
                  <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{a.accountCode}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">{a.companyName}</td>
                    <td className="px-4 py-3 text-zinc-400">{a.contactName || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{a.paymentTerms || '—'}</td>
                    <td className="px-4 py-3">
                      <CreditBar used={a.creditUsed} limit={a.creditLimit} />
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{a._count.orders}</td>
                    <td className="px-4 py-3">
                      {!a.isActive ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-500">Inactive</span>
                      ) : a.isApproved ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-800/50">Approved</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-900/50 text-amber-400 border border-amber-800/50">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!a.isApproved && a.isActive && (
                          <button
                            onClick={() => approveAccount(a.id)}
                            className="px-2 py-1 text-xs bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-400 border border-emerald-800/50 rounded"
                          >
                            Approve
                          </button>
                        )}
                        <Link href={`/b2b/accounts/${a.id}`} className="text-zinc-500 hover:text-zinc-200">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <NewAccountModal onClose={() => setShowModal(false)} onCreated={load} />
      )}
    </div>
  )
}
