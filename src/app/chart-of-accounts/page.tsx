'use client'

import { useEffect, useState } from 'react'
import { Plus, X, BarChart3, Search } from 'lucide-react'

interface Account {
  id: string
  accountCode: string
  accountName: string
  accountType: string
  normalBalance: string
  parentCode: string | null
  isActive: boolean
  description: string | null
  _count?: { glEntries: number }
}

const TYPE_COLORS: Record<string, string> = {
  asset: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  liability: 'bg-red-500/10 text-red-400 border-red-500/20',
  equity: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  revenue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  expense: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cogs: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense', 'cogs']

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    accountCode: '', accountName: '', accountType: 'asset',
    normalBalance: 'debit', parentCode: '', description: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/chart-of-accounts')
      .then(r => r.json())
      .then(d => { setAccounts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function create() {
    if (!form.accountCode.trim() || !form.accountName.trim()) return
    setSaving(true)
    const res = await fetch('/api/chart-of-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, parentCode: form.parentCode || null }),
    })
    if (res.ok) {
      const a = await res.json()
      setAccounts(prev => [...prev, { ...a, _count: { glEntries: 0 } }].sort((x, y) => x.accountCode.localeCompare(y.accountCode)))
      setShowModal(false)
      setForm({ accountCode: '', accountName: '', accountType: 'asset', normalBalance: 'debit', parentCode: '', description: '' })
    }
    setSaving(false)
  }

  const filtered = accounts.filter(a => {
    const matchSearch = !filter || a.accountCode.toLowerCase().includes(filter.toLowerCase()) || a.accountName.toLowerCase().includes(filter.toLowerCase())
    const matchType = typeFilter === 'all' || a.accountType === typeFilter
    return matchSearch && matchType
  })

  // Group by type
  const grouped = ACCOUNT_TYPES.map(type => ({
    type,
    items: filtered.filter(a => a.accountType === type),
  })).filter(g => g.items.length > 0)

  const typeCounts = Object.fromEntries(ACCOUNT_TYPES.map(t => [t, accounts.filter(a => a.accountType === t).length]))

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Chart of Accounts</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Business Central — General Ledger account structure</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> New Account
        </button>
      </div>

      {/* Type summary pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${typeFilter === 'all' ? 'bg-zinc-700 text-zinc-100 border-zinc-600' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
        >
          All ({accounts.length})
        </button>
        {ACCOUNT_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors capitalize ${typeFilter === type ? `${TYPE_COLORS[type]} font-medium` : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
          >
            {type} ({typeCounts[type] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search by code or name..."
          className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
        />
      </div>

      {/* Accounts grouped by type */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-24 bg-zinc-900 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">{accounts.length === 0 ? 'No accounts yet. Create your chart of accounts.' : 'No accounts match your filter.'}</p>
        </div>
      ) : (
        grouped.map(group => (
          <section key={group.type}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${TYPE_COLORS[group.type] ?? ''}`}>
                {group.type}
              </span>
              <span className="text-xs text-zinc-600">{group.items.length} accounts</span>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Code</th>
                    <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Name</th>
                    <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Normal Balance</th>
                    <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Parent</th>
                    <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">GL Entries</th>
                    <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {group.items.map(acct => (
                    <tr key={acct.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-300 font-mono font-medium">{acct.accountCode}</td>
                      <td className="px-4 py-2.5">
                        <div className="text-zinc-200 font-medium">{acct.accountName}</div>
                        {acct.description && <div className="text-zinc-600 mt-0.5">{acct.description}</div>}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 capitalize">{acct.normalBalance}</td>
                      <td className="px-4 py-2.5 text-zinc-500 font-mono">{acct.parentCode ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right text-zinc-400">{acct._count?.glEntries ?? 0}</td>
                      <td className="px-4 py-2.5">
                        <span className={acct.isActive ? 'text-emerald-400' : 'text-zinc-600'}>
                          {acct.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[480px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-zinc-100">New GL Account</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-zinc-500 hover:text-zinc-300" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Account Code *</label>
                <input
                  value={form.accountCode}
                  onChange={e => setForm(p => ({ ...p, accountCode: e.target.value }))}
                  placeholder="e.g. 1100"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Account Type *</label>
                <select
                  value={form.accountType}
                  onChange={e => setForm(p => ({ ...p, accountType: e.target.value, normalBalance: ['asset', 'expense', 'cogs'].includes(e.target.value) ? 'debit' : 'credit' }))}
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none capitalize"
                >
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Account Name *</label>
                <input
                  value={form.accountName}
                  onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))}
                  placeholder="e.g. Cash and Cash Equivalents"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Normal Balance</label>
                <select
                  value={form.normalBalance}
                  onChange={e => setForm(p => ({ ...p, normalBalance: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Parent Code</label>
                <input
                  value={form.parentCode}
                  onChange={e => setForm(p => ({ ...p, parentCode: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={saving || !form.accountCode.trim() || !form.accountName.trim()}
                className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors"
              >
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
