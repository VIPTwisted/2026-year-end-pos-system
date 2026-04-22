'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, BookOpen, Pencil, Trash2, X, Check } from 'lucide-react'

interface Account {
  id: string; accountCode: string; accountName: string; accountType: string
  normalBalance: string; parentCode: string | null; isActive: boolean; description: string | null
}

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'COGS', 'Other']

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ accountCode: '', accountName: '', accountType: 'Asset', normalBalance: 'debit', parentCode: '', isActive: true, description: '' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/finance/coa')
    if (res.ok) setAccounts(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setEditId(null)
    setForm({ accountCode: '', accountName: '', accountType: 'Asset', normalBalance: 'debit', parentCode: '', isActive: true, description: '' })
    setShowModal(true)
  }

  function openEdit(a: Account) {
    setEditId(a.id)
    setForm({ accountCode: a.accountCode, accountName: a.accountName, accountType: a.accountType, normalBalance: a.normalBalance, parentCode: a.parentCode || '', isActive: a.isActive, description: a.description || '' })
    setShowModal(true)
  }

  async function save() {
    setSaving(true)
    const url = editId ? `/api/finance/coa/${editId}` : '/api/finance/coa'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, parentCode: form.parentCode || null }) })
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed') }
    else { setShowModal(false); load() }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this account?')) return
    await fetch(`/api/finance/coa/${id}`, { method: 'DELETE' })
    load()
  }

  const grouped = accounts.reduce((g, a) => {
    if (!g[a.accountType]) g[a.accountType] = []
    g[a.accountType].push(a)
    return g
  }, {} as Record<string, Account[]>)

  return (
    <>
      <TopBar title="Chart of Accounts" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Chart of Accounts</h2>
            <p className="text-sm text-zinc-500">{accounts.length} accounts</p>
          </div>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />New Account</Button>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-800 animate-pulse rounded-xl" />)}</div>
        ) : accounts.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <BookOpen className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No accounts configured</p>
            <Button size="sm" className="mt-3" onClick={openNew}><Plus className="w-3 h-3 mr-1" />Add First Account</Button>
          </CardContent></Card>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([type, accts]) => (
            <div key={type}>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">{type}</h3>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3 font-medium">Code</th>
                        <th className="text-left px-4 py-3 font-medium">Name</th>
                        <th className="text-left px-4 py-3 font-medium">Normal</th>
                        <th className="text-left px-4 py-3 font-medium">Parent</th>
                        <th className="text-center px-4 py-3 font-medium">Status</th>
                        <th className="text-center px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {accts.sort((a, b) => a.accountCode.localeCompare(b.accountCode)).map(a => (
                        <tr key={a.id} className={cn('hover:bg-zinc-900/50', !a.isActive && 'opacity-60')}>
                          <td className="px-4 py-3 font-mono text-xs text-zinc-300">{a.accountCode}</td>
                          <td className="px-4 py-3 text-zinc-200">{a.accountName}</td>
                          <td className="px-4 py-3 text-xs text-zinc-400 capitalize">{a.normalBalance}</td>
                          <td className="px-4 py-3 text-xs font-mono text-zinc-500">{a.parentCode || '—'}</td>
                          <td className="px-4 py-3 text-center"><Badge variant={a.isActive ? 'success' : 'secondary'}>{a.isActive ? 'Active' : 'Inactive'}</Badge></td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => openEdit(a)} className="text-zinc-500 hover:text-zinc-300"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => remove(a.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">{editId ? 'Edit Account' : 'New Account'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Account Code *</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                    value={form.accountCode} onChange={e => setForm(f => ({ ...f, accountCode: e.target.value }))} placeholder="1000" disabled={!!editId} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Account Type *</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                    value={form.accountType} onChange={e => setForm(f => ({ ...f, accountType: e.target.value }))}>
                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Account Name *</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} placeholder="e.g. Cash and Cash Equivalents" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Normal Balance</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                    value={form.normalBalance} onChange={e => setForm(f => ({ ...f, normalBalance: e.target.value }))}>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Parent Code</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                    value={form.parentCode} onChange={e => setForm(f => ({ ...f, parentCode: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={save} disabled={saving || !form.accountCode.trim() || !form.accountName.trim()}>
                <Check className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save Account'}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
