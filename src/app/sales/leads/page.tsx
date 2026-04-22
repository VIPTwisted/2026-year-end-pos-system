'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Star, Mail, Phone, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Lead = {
  id: string
  firstName: string
  lastName: string
  companyName: string | null
  email: string | null
  phone: string | null
  leadSource: string | null
  rating: string
  status: string
  createdAt: string
}

const ratingColor: Record<string, string> = {
  hot: 'bg-red-500/20 text-red-400',
  warm: 'bg-amber-500/20 text-amber-400',
  cold: 'bg-blue-500/20 text-blue-400',
}

const statusColor: Record<string, string> = {
  open: 'bg-zinc-700 text-zinc-300',
  qualified: 'bg-emerald-500/20 text-emerald-400',
  disqualified: 'bg-red-500/20 text-red-400',
}

const TABS = ['all', 'open', 'qualified', 'disqualified']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', companyName: '', email: '', phone: '', leadSource: '', rating: 'warm' })

  async function load(status = 'all') {
    setLoading(true)
    const res = await fetch(`/api/sales/leads?status=${status}`)
    const data = await res.json()
    setLeads(data)
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function qualify(id: string) {
    await fetch(`/api/sales/leads/${id}/qualify`, { method: 'POST' })
    load(tab)
  }

  async function createLead() {
    await fetch('/api/sales/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowModal(false)
    setForm({ firstName: '', lastName: '', companyName: '', email: '', phone: '', leadSource: '', rating: 'warm' })
    load(tab)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Leads</h1>
          <p className="text-sm text-zinc-400 mt-1">Track and qualify sales leads</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors">
          <Plus className="w-4 h-4" /> New Lead
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm capitalize transition-colors', tab === t ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300')}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Company</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Source</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Rating</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>}
            {!loading && leads.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No leads found</td></tr>}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <a href={`/sales/leads/${lead.id}`} className="text-zinc-200 hover:text-white font-medium">
                    {lead.firstName} {lead.lastName}
                  </a>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {lead.companyName || '—'}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {lead.email ? <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {lead.email}</span> : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-400">{lead.leadSource || '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', ratingColor[lead.rating] || 'bg-zinc-700 text-zinc-300')}>
                    <Star className="w-3 h-3 inline mr-1" />{lead.rating}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[lead.status] || 'bg-zinc-700 text-zinc-300')}>{lead.status}</span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {lead.status === 'open' && (
                    <button onClick={() => qualify(lead.id)} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Qualify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">New Lead</h2>
            <div className="grid grid-cols-2 gap-3">
              {['firstName', 'lastName'].map((f) => (
                <div key={f}>
                  <label className="block text-xs text-zinc-400 mb-1 capitalize">{f === 'firstName' ? 'First Name' : 'Last Name'}</label>
                  <input value={(form as Record<string, string>)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>
            {[{ k: 'companyName', label: 'Company' }, { k: 'email', label: 'Email' }, { k: 'phone', label: 'Phone' }, { k: 'leadSource', label: 'Lead Source' }].map(({ k, label }) => (
              <div key={k}>
                <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                <input value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={createLead} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Create Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
