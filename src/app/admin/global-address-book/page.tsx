'use client'
import { useEffect, useState } from 'react'
import {
  BookOpen, Plus, Search, Users, Building2, User, Briefcase,
  Phone, Mail, MapPin, Edit2, GitMerge, Download, Printer,
  AlertTriangle, ChevronRight, X, Clock, Globe,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

interface Party {
  id: string
  partyId: string
  name: string
  type: 'Organization' | 'Person' | 'Group'
  category: 'Customer' | 'Vendor' | 'Employee' | 'Contact' | 'Internal'
  primaryAddress: string
  city: string
  country: string
  postalCode: string
  phone: string
  email: string
  relationships: string[]
  isDuplicate?: boolean
  createdAt: string
}

const SEED_PARTIES: Party[] = [
  { id: '1', partyId: 'PARTY-00001', name: 'Acme Corporation', type: 'Organization', category: 'Customer', primaryAddress: '123 Main St', city: 'New York', country: 'US', postalCode: '10001', phone: '+1-212-555-0100', email: 'ar@acme.com', relationships: ['Customer', 'Prospect'], createdAt: '2024-01-15' },
  { id: '2', partyId: 'PARTY-00002', name: 'Acme Corp', type: 'Organization', category: 'Customer', primaryAddress: '123 Main Street', city: 'New York', country: 'US', postalCode: '10001', phone: '+1-212-555-0101', email: 'billing@acmecorp.com', relationships: ['Customer'], isDuplicate: true, createdAt: '2024-01-16' },
  { id: '3', partyId: 'PARTY-00003', name: 'Global Supplies Inc.', type: 'Organization', category: 'Vendor', primaryAddress: '456 Commerce Blvd', city: 'Chicago', country: 'US', postalCode: '60601', phone: '+1-312-555-0200', email: 'orders@globalsupplies.com', relationships: ['Vendor', 'Supplier'], createdAt: '2024-01-20' },
  { id: '4', partyId: 'PARTY-00004', name: 'James Mitchell', type: 'Person', category: 'Employee', primaryAddress: '789 Oak Ave', city: 'Austin', country: 'US', postalCode: '73301', phone: '+1-512-555-0300', email: 'j.mitchell@novapos.internal', relationships: ['Employee', 'Manager'], createdAt: '2024-02-01' },
  { id: '5', partyId: 'PARTY-00005', name: 'Sarah Chen', type: 'Person', category: 'Contact', primaryAddress: '321 Elm Dr', city: 'San Francisco', country: 'US', postalCode: '94102', phone: '+1-415-555-0400', email: 'schen@techpartner.com', relationships: ['Contact', 'Partner'], createdAt: '2024-02-10' },
  { id: '6', partyId: 'PARTY-00006', name: 'Meridian Logistics LLC', type: 'Organization', category: 'Vendor', primaryAddress: '567 Industrial Pkwy', city: 'Dallas', country: 'US', postalCode: '75201', phone: '+1-214-555-0500', email: 'ap@meridianlogistics.com', relationships: ['Vendor', 'Carrier'], createdAt: '2024-02-15' },
  { id: '7', partyId: 'PARTY-00007', name: 'NovaPOS HQ', type: 'Organization', category: 'Internal', primaryAddress: '1 Enterprise Way', city: 'Seattle', country: 'US', postalCode: '98101', phone: '+1-206-555-0600', email: 'hq@novapos.internal', relationships: ['Internal', 'HQ'], createdAt: '2024-01-01' },
  { id: '8', partyId: 'PARTY-00008', name: 'Robert Alvarez', type: 'Person', category: 'Employee', primaryAddress: '100 Pine St', city: 'Denver', country: 'US', postalCode: '80201', phone: '+1-720-555-0700', email: 'r.alvarez@novapos.internal', relationships: ['Employee'], createdAt: '2024-03-01' },
  { id: '9', partyId: 'PARTY-00009', name: 'Pinnacle Retail Group', type: 'Organization', category: 'Customer', primaryAddress: '200 Market Plaza', city: 'Miami', country: 'US', postalCode: '33101', phone: '+1-305-555-0800', email: 'purchasing@pinnacleretail.com', relationships: ['Customer', 'Key Account'], createdAt: '2024-03-05' },
  { id: '10', partyId: 'PARTY-00010', name: 'Euro Parts GmbH', type: 'Organization', category: 'Vendor', primaryAddress: 'Hauptstrasse 44', city: 'Munich', country: 'DE', postalCode: '80331', phone: '+49-89-555-0900', email: 'export@europarts.de', relationships: ['Vendor', 'International'], createdAt: '2024-03-10' },
  { id: '11', partyId: 'PARTY-00011', name: 'Linda Torres', type: 'Person', category: 'Contact', primaryAddress: '45 Harbor View', city: 'Boston', country: 'US', postalCode: '02101', phone: '+1-617-555-1000', email: 'ltorres@consultant.com', relationships: ['Contact', 'Consultant'], createdAt: '2024-03-15' },
  { id: '12', partyId: 'PARTY-00012', name: 'Southwest Distribution Co.', type: 'Organization', category: 'Customer', primaryAddress: '890 Desert Rd', city: 'Phoenix', country: 'US', postalCode: '85001', phone: '+1-602-555-1100', email: 'ops@swdist.com', relationships: ['Customer'], createdAt: '2024-03-20' },
  { id: '13', partyId: 'PARTY-00013', name: 'IT Operations Group', type: 'Group', category: 'Internal', primaryAddress: '1 Enterprise Way', city: 'Seattle', country: 'US', postalCode: '98101', phone: '+1-206-555-1200', email: 'it-ops@novapos.internal', relationships: ['Internal', 'IT'], createdAt: '2024-01-05' },
  { id: '14', partyId: 'PARTY-00014', name: 'Pacific Tech Solutions', type: 'Organization', category: 'Vendor', primaryAddress: '300 Silicon Loop', city: 'San Jose', country: 'US', postalCode: '95101', phone: '+1-408-555-1300', email: 'sales@pacifictech.com', relationships: ['Vendor', 'Technology'], createdAt: '2024-04-01' },
  { id: '15', partyId: 'PARTY-00015', name: 'Marcus Johnson', type: 'Person', category: 'Employee', primaryAddress: '77 Riverside Blvd', city: 'Atlanta', country: 'US', postalCode: '30301', phone: '+1-404-555-1400', email: 'm.johnson@novapos.internal', relationships: ['Employee', 'Sales Rep'], createdAt: '2024-04-10' },
]

type TabFilter = 'All' | 'Customer' | 'Vendor' | 'Employee' | 'Contact' | 'Internal'

const TAB_FILTERS: TabFilter[] = ['All', 'Customer', 'Vendor', 'Employee', 'Contact', 'Internal']

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Organization: Building2,
  Person: User,
  Group: Users,
}

const TYPE_COLOR: Record<string, string> = {
  Organization: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Person: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Group: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const CAT_COLOR: Record<string, string> = {
  Customer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Vendor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Employee: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Contact: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Internal: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export default function GlobalAddressBookPage() {
  const [parties, setParties] = useState<Party[]>(SEED_PARTIES)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterPostal, setFilterPostal] = useState('')
  const [tab, setTab] = useState<TabFilter>('All')
  const [selected, setSelected] = useState<Party | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Derived filtered list
  const filtered = parties.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.partyId.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q)
    const matchTab = tab === 'All' || p.category === tab
    const matchType = !filterType || filterType === 'All' || p.type === filterType
    const matchCountry = !filterCountry || p.country.toLowerCase().includes(filterCountry.toLowerCase())
    const matchCity = !filterCity || p.city.toLowerCase().includes(filterCity.toLowerCase())
    const matchPostal = !filterPostal || p.postalCode.includes(filterPostal)
    return matchSearch && matchTab && matchType && matchCountry && matchCity && matchPostal
  })

  const counts = {
    All: parties.length,
    Customer: parties.filter(p => p.category === 'Customer').length,
    Vendor: parties.filter(p => p.category === 'Vendor').length,
    Employee: parties.filter(p => p.category === 'Employee').length,
    Contact: parties.filter(p => p.category === 'Contact').length,
    Internal: parties.filter(p => p.category === 'Internal').length,
  }

  const duplicateCount = parties.filter(p => p.isDuplicate).length

  function toggleRow(id: string) {
    setSelectedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
      <TopBar
        title="Global Address Book"
        breadcrumb={[{ label: 'Administration', href: '/admin/users' }]}
      />

      <div className="p-6 space-y-5">
        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New party
          </button>
          <button disabled={selectedRows.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button disabled={selectedRows.size < 2} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 rounded transition-colors">
            <GitMerge className="w-3.5 h-3.5" /> Merge
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          {duplicateCount > 0 && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded">
              <AlertTriangle className="w-3.5 h-3.5" />
              {duplicateCount} potential duplicate{duplicateCount > 1 ? 's' : ''} detected
            </div>
          )}
        </div>

        {/* Search bar + filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search party name, ID, email, phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#16213e] border border-zinc-800/50 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#16213e] border border-zinc-800/50 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-600">
              <option value="All">All Types</option>
              <option>Organization</option>
              <option>Person</option>
              <option>Group</option>
            </select>
            <input value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              placeholder="Country" className="px-3 py-1.5 text-xs w-28 bg-[#16213e] border border-zinc-800/50 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-600" />
            <input value={filterCity} onChange={e => setFilterCity(e.target.value)}
              placeholder="City" className="px-3 py-1.5 text-xs w-28 bg-[#16213e] border border-zinc-800/50 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-600" />
            <input value={filterPostal} onChange={e => setFilterPostal(e.target.value)}
              placeholder="Postal code" className="px-3 py-1.5 text-xs w-28 bg-[#16213e] border border-zinc-800/50 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-600" />
          </div>
        </div>

        {/* Quick filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {TAB_FILTERS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${tab === t ? 'bg-blue-600 text-white' : 'bg-[#16213e] text-zinc-400 hover:text-zinc-200 border border-zinc-800/50'}`}>
              {t}
              <span className={`text-[10px] px-1.5 rounded-full ${tab === t ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-zinc-400'}`}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {/* Main content: table + detail panel */}
        <div className={`grid gap-4 ${selected ? 'grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="w-8 px-3 py-3">
                      <input type="checkbox" className="accent-blue-600 w-3 h-3"
                        onChange={e => setSelectedRows(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())} />
                    </th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Party ID</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Name</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Type</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Category</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Primary Address</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Phone</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Email</th>
                    <th className="text-left px-3 py-3 font-medium uppercase tracking-widest">Relationships</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {loading ? (
                    <tr><td colSpan={9} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center text-zinc-600">No records found</td></tr>
                  ) : filtered.map(p => {
                    const TypeIcon = TYPE_ICON[p.type] ?? User
                    return (
                      <tr key={p.id}
                        onClick={() => setSelected(selected?.id === p.id ? null : p)}
                        className={`hover:bg-zinc-900/30 transition-colors cursor-pointer ${selected?.id === p.id ? 'bg-blue-900/10 border-l-2 border-blue-500' : ''}`}>
                        <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" className="accent-blue-600 w-3 h-3"
                            checked={selectedRows.has(p.id)} onChange={() => toggleRow(p.id)} />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-zinc-500">{p.partyId}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-200">{p.name}</span>
                            {p.isDuplicate && (
                              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="w-2.5 h-2.5" /> Potential duplicate
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border w-fit ${TYPE_COLOR[p.type]}`}>
                            <TypeIcon className="w-2.5 h-2.5" />{p.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${CAT_COLOR[p.category]}`}>{p.category}</span>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400">{p.primaryAddress}, {p.city}</td>
                        <td className="px-3 py-2.5 text-zinc-400">{p.phone}</td>
                        <td className="px-3 py-2.5 text-zinc-400">{p.email}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {p.relationships.slice(0, 2).map(r => (
                              <span key={r} className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-700/50 text-zinc-400">{r}</span>
                            ))}
                            {p.relationships.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-700/50 text-zinc-500">+{p.relationships.length - 2}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-zinc-800/50 text-[11px] text-zinc-600">
              Showing {filtered.length} of {parties.length} parties
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{selected.name}</div>
                  <div className="text-[11px] text-zinc-500">{selected.partyId}</div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-zinc-700 transition-colors">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
                {/* Type/Category badges */}
                <div className="flex gap-2">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] ${TYPE_COLOR[selected.type]}`}>
                    {selected.type}
                  </span>
                  <span className={`px-2 py-1 rounded border text-[11px] ${CAT_COLOR[selected.category]}`}>{selected.category}</span>
                  {selected.isDuplicate && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                      <AlertTriangle className="w-3 h-3" /> Duplicate
                    </span>
                  )}
                </div>

                {/* Addresses */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Addresses</div>
                  <div className="p-3 bg-zinc-900/40 rounded-lg space-y-1">
                    <div className="flex items-start gap-2 text-zinc-300">
                      <MapPin className="w-3 h-3 mt-0.5 text-zinc-500 shrink-0" />
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase mb-0.5">Primary</div>
                        <div>{selected.primaryAddress}</div>
                        <div className="text-zinc-500">{selected.city}, {selected.country} {selected.postalCode}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Contact Info</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span>{selected.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span>{selected.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="text-zinc-500">{selected.country}</span>
                    </div>
                  </div>
                </div>

                {/* Relationships */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Relationships</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.relationships.map(r => (
                      <span key={r} className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px]">{r}</span>
                    ))}
                  </div>
                </div>

                {/* Party History */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Party History</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Created {selected.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Last modified — no changes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-zinc-800/50 flex gap-2">
                <button className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">Edit</button>
                <button className="flex-1 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">History</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
