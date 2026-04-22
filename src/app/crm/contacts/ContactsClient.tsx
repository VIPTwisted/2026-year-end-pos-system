'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Plus, Search, ChevronRight, Pencil, Trash2,
  Mail, Phone, ChevronDown, CalendarDays, Target, MessageSquare, CheckSquare
} from 'lucide-react'

interface BCContact {
  id: string
  contactNo: string
  name: string
  contactType: string
  companyName: string | null
  phone: string | null
  email: string | null
  salesperson: string | null
  territory: string | null
  lastModified: string
}

const CONTACT_TYPES = ['', 'Company', 'Person']

export default function ContactsClient() {
  const router = useRouter()
  const [rows, setRows] = useState<BCContact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [salesperson, setSalesperson] = useState('')
  const [territory, setTerritory] = useState('')
  const [navigateOpen, setNavigateOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (typeFilter) q.set('type', typeFilter)
    if (salesperson) q.set('salesperson', salesperson)
    if (territory) q.set('territory', territory)
    fetch(`/api/crm/contacts?${q}`)
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, typeFilter, salesperson, territory])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!confirm('Delete this contact?')) return
    await fetch(`/api/crm/contacts/${id}`, { method: 'DELETE' })
    load()
  }

  const sel = rows.find(r => r.id === selected)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      {/* Page Header */}
      <div className="px-6 pt-5 pb-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-semibold text-white">Contacts</h1>
            <span className="text-zinc-500 text-sm">({rows.length})</span>
          </div>
        </div>

        {/* Ribbon */}
        <div className="flex items-center gap-1 flex-wrap">
          <Link href="/crm/contacts/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button
            disabled={!selected}
            onClick={() => selected && router.push(`/crm/contacts/${selected}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-medium rounded transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && handleDelete(selected)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-red-900/40 disabled:opacity-40 text-zinc-200 hover:text-red-400 text-xs font-medium rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>

          <div className="w-px h-5 bg-zinc-700 mx-1" />

          <div className="relative">
            <button
              onClick={() => setNavigateOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded transition-colors">
              Navigate <ChevronDown className="w-3 h-3" />
            </button>
            {navigateOpen && (
              <div className="absolute top-8 left-0 z-20 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl min-w-[160px] py-1">
                {[
                  { label: 'Interactions', href: `/crm/interactions${selected ? `?contactId=${selected}` : ''}`, icon: MessageSquare },
                  { label: 'Opportunities', href: `/crm/opportunities${selected ? `?contactId=${selected}` : ''}`, icon: Target },
                  { label: 'Segments', href: '/crm/segments', icon: Users },
                  { label: 'Tasks', href: `/crm/tasks${selected ? `?contactId=${selected}` : ''}`, icon: CheckSquare },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} onClick={() => setNavigateOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" /> {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-zinc-700 mx-1" />

          <button
            disabled={!sel?.email}
            onClick={() => sel?.email && window.open(`mailto:${sel.email}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-medium rounded transition-colors">
            <Mail className="w-3.5 h-3.5" /> Send Email
          </button>
          <Link href={`/crm/interactions/new${selected ? `?contactId=${selected}` : ''}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded transition-colors">
            <CalendarDays className="w-3.5 h-3.5" /> Log Interaction
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-zinc-800 flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name / email / no..."
            className="w-60 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 pl-8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Types</option>
          {CONTACT_TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={salesperson} onChange={e => setSalesperson(e.target.value)}
          placeholder="Salesperson"
          className="w-36 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        <input value={territory} onChange={e => setTerritory(e.target.value)}
          placeholder="Territory"
          className="w-32 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
            <tr className="text-zinc-400 text-[11px] uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left w-8"></th>
              <th className="px-4 py-2.5 text-left">No.</th>
              <th className="px-4 py-2.5 text-left">Name</th>
              <th className="px-4 py-2.5 text-left">Type</th>
              <th className="px-4 py-2.5 text-left">Company Name</th>
              <th className="px-4 py-2.5 text-left">Phone</th>
              <th className="px-4 py-2.5 text-left">Email</th>
              <th className="px-4 py-2.5 text-left">Salesperson</th>
              <th className="px-4 py-2.5 text-left">Territory</th>
              <th className="px-4 py-2.5 text-left">Last Modified</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-zinc-500">No contacts found</td></tr>
            )}
            {rows.map(row => (
              <tr
                key={row.id}
                onClick={() => setSelected(row.id === selected ? null : row.id)}
                onDoubleClick={() => router.push(`/crm/contacts/${row.id}`)}
                className={`cursor-pointer transition-colors ${row.id === selected ? 'bg-indigo-600/15 border-indigo-600/30' : 'hover:bg-zinc-900/80'}`}
              >
                <td className="px-4 py-2.5">
                  <input type="checkbox" readOnly checked={row.id === selected}
                    className="rounded border-zinc-600 text-indigo-600 bg-zinc-800 focus:ring-indigo-500" />
                </td>
                <td className="px-4 py-2.5 text-indigo-400 font-mono">{row.contactNo}</td>
                <td className="px-4 py-2.5 text-white font-medium">{row.name}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${row.contactType === 'Person' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {row.contactType}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.companyName ?? '—'}</td>
                <td className="px-4 py-2.5 text-zinc-400">
                  {row.phone ? (
                    <a href={`tel:${row.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-white">
                      <Phone className="w-3 h-3" /> {row.phone}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-2.5 text-zinc-400">
                  {row.email ? (
                    <a href={`mailto:${row.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-white">
                      <Mail className="w-3 h-3" /> {row.email}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.salesperson ?? '—'}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.territory ?? '—'}</td>
                <td className="px-4 py-2.5 text-zinc-500">{row.lastModified ? new Date(row.lastModified).toLocaleDateString() : '—'}</td>
                <td className="px-3 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
