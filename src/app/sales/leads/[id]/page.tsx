'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Star, CheckCircle, XCircle, Mail, Phone, Globe, Building2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Lead = {
  id: string
  firstName: string
  lastName: string
  companyName: string | null
  email: string | null
  phone: string | null
  website: string | null
  leadSource: string | null
  rating: string
  status: string
  description: string | null
  ownerName: string | null
  notes: string | null
  qualifiedAt: string | null
  createdAt: string
  updatedAt: string
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

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [lead, setLead] = useState<Lead | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Lead>>({})

  async function loadLead() {
    const res = await fetch(`/api/sales/leads/${id}`)
    const data = await res.json()
    setLead(data)
    setForm(data)
  }

  useEffect(() => { loadLead() }, [id])

  async function save() {
    await fetch(`/api/sales/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setEditing(false)
    loadLead()
  }

  async function qualify() {
    await fetch(`/api/sales/leads/${id}/qualify`, { method: 'POST' })
    loadLead()
  }

  async function disqualify() {
    await fetch(`/api/sales/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'disqualified' }) })
    loadLead()
  }

  if (!lead) return <div className="p-6 text-zinc-400">Loading...</div>

  const Field = ({ label, value, field }: { label: string; value: string | null; field: string }) => (
    <div>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      {editing ? (
        <input value={(form as Record<string, string | null>)[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
      ) : (
        <p className="text-sm text-zinc-200">{value || '—'}</p>
      )}
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/leads" className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{lead.firstName} {lead.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('px-2 py-0.5 rounded text-xs capitalize', ratingColor[lead.rating] || 'bg-zinc-700 text-zinc-300')}>
                <Star className="w-3 h-3 inline mr-1" />{lead.rating}
              </span>
              <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[lead.status] || 'bg-zinc-700 text-zinc-300')}>{lead.status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {lead.status === 'open' && (
            <>
              <button onClick={qualify} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                <CheckCircle className="w-4 h-4" /> Qualify
              </button>
              <button onClick={disqualify} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors">
                <XCircle className="w-4 h-4" /> Disqualify
              </button>
            </>
          )}
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Cancel</button>
              <button onClick={save} className="px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Save</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Edit</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lead Info */}
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Lead Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={lead.firstName} field="firstName" />
            <Field label="Last Name" value={lead.lastName} field="lastName" />
            <Field label="Company" value={lead.companyName} field="companyName" />
            <Field label="Lead Source" value={lead.leadSource} field="leadSource" />
            <Field label="Email" value={lead.email} field="email" />
            <Field label="Phone" value={lead.phone} field="phone" />
            <Field label="Website" value={lead.website} field="website" />
            <Field label="Owner" value={lead.ownerName} field="ownerName" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Description</label>
            {editing ? (
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            ) : (
              <p className="text-sm text-zinc-200">{lead.description || '—'}</p>
            )}
          </div>
          {editing && (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Rating</label>
              <select value={form.rating || 'warm'} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
          )}
        </div>

        {/* Activity Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Activity</h2>
          <div className="space-y-3">
            {lead.email && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-500" />
                <a href={`mailto:${lead.email}`} className="hover:text-white">{lead.email}</a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Globe className="w-4 h-4 text-zinc-500" />
                <a href={lead.website} target="_blank" rel="noreferrer" className="hover:text-white truncate">{lead.website}</a>
              </div>
            )}
            {lead.companyName && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <span>{lead.companyName}</span>
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs text-zinc-500">
            <p>Created: {new Date(lead.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(lead.updatedAt).toLocaleString()}</p>
            {lead.qualifiedAt && <p className="text-emerald-400">Qualified: {new Date(lead.qualifiedAt).toLocaleString()}</p>}
          </div>
          {lead.notes && (
            <div className="pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Notes</p>
              <p className="text-xs text-zinc-300">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
