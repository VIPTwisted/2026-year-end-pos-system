'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Building, ArrowLeft, Plus, Trash2, Edit2, Check, X, UserCircle } from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: string
  isDefault: boolean
}

interface Org {
  id: string
  name: string
  accountNumber: string
  creditLimit: number
  creditUsed: number
  creditAvailable: number
  paymentTerms: string
  priceGroupId: string | null
  status: string
  contacts: Contact[]
  quotes: Array<{ id: string; quoteNumber: string; status: string; total: number; createdAt: string }>
  requisitions: Array<{ id: string; reqNumber: string; status: string; totalAmount: number; createdAt: string }>
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  'on-hold': 'bg-yellow-900/60 text-yellow-300',
  suspended: 'bg-red-900/60 text-red-300',
}

const QUOTE_STATUS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  submitted: 'bg-blue-900/60 text-blue-300',
  approved: 'bg-green-900/60 text-green-300',
  rejected: 'bg-red-900/60 text-red-300',
  converted: 'bg-purple-900/60 text-purple-300',
}

const ROLE_BADGE: Record<string, string> = {
  buyer: 'bg-blue-900/40 text-blue-300',
  approver: 'bg-green-900/40 text-green-300',
  admin: 'bg-purple-900/40 text-purple-300',
}

const defaultContactForm = { firstName: '', lastName: '', email: '', phone: '', role: 'buyer', isDefault: false }

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [org, setOrg] = useState<Org | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'quotes' | 'reqs'>('quotes')
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState(defaultContactForm)
  const [savingContact, setSavingContact] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', creditLimit: '', paymentTerms: '', priceGroupId: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/b2b/organizations/${id}`)
      const data = await res.json()
      setOrg(data)
      setEditForm({
        name: data.name,
        creditLimit: String(data.creditLimit),
        paymentTerms: data.paymentTerms,
        priceGroupId: data.priceGroupId ?? '',
      })
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line

  async function handleSaveOrg() {
    setSaving(true)
    setError('')
    try {
      await fetch(`/api/b2b/organizations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          creditLimit: parseFloat(editForm.creditLimit) || 0,
          paymentTerms: editForm.paymentTerms,
          priceGroupId: editForm.priceGroupId || null,
        }),
      })
      setEditMode(false)
      load()
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status: string) {
    await fetch(`/api/b2b/organizations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function addContact() {
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email) {
      setError('First name, last name, and email required'); return
    }
    setSavingContact(true)
    setError('')
    try {
      await fetch(`/api/b2b/organizations/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      setContactForm(defaultContactForm)
      setShowContactForm(false)
      load()
    } catch {
      setError('Failed to add contact')
    } finally {
      setSavingContact(false)
    }
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading...</div>
  if (!org) return <div className="p-6 text-red-400">Organization not found</div>

  const creditPct = org.creditLimit > 0 ? Math.min(100, (org.creditUsed / org.creditLimit) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/b2b/organizations" className="text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <Building className="w-5 h-5 text-blue-400" />
        <div className="flex items-center gap-3">
          {editMode ? (
            <input
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className="text-xl font-bold bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h1 className="text-xl font-bold text-zinc-100">{org.name}</h1>
          )}
          <span className="text-sm font-mono text-zinc-500">{org.accountNumber}</span>
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_BADGE[org.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
            {org.status}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={handleSaveOrg} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">
                <Check className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          )}
          {org.status !== 'active' && (
            <button onClick={() => handleStatusChange('active')} className="px-3 py-1.5 bg-green-800 hover:bg-green-700 text-green-200 rounded-lg text-xs font-medium">Activate</button>
          )}
          {org.status !== 'on-hold' && (
            <button onClick={() => handleStatusChange('on-hold')} className="px-3 py-1.5 bg-yellow-800 hover:bg-yellow-700 text-yellow-200 rounded-lg text-xs font-medium">Hold</button>
          )}
          {org.status !== 'suspended' && (
            <button onClick={() => handleStatusChange('suspended')} className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-200 rounded-lg text-xs font-medium">Suspend</button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}

      {/* Info Panels */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Credit</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Limit</span>
              <span className="text-zinc-100 font-mono">${org.creditLimit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Used</span>
              <span className="text-zinc-100 font-mono">${org.creditUsed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Available</span>
              <span className={`font-mono font-semibold ${org.creditAvailable <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                ${org.creditAvailable.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${creditPct >= 90 ? 'bg-red-500' : creditPct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${creditPct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600">{creditPct.toFixed(1)}% utilized</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Payment Terms</p>
          {editMode ? (
            <select
              value={editForm.paymentTerms}
              onChange={e => setEditForm({ ...editForm, paymentTerms: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none"
            >
              <option value="NET30">NET30</option>
              <option value="NET15">NET15</option>
              <option value="NET60">NET60</option>
              <option value="COD">COD</option>
              <option value="PREPAID">PREPAID</option>
            </select>
          ) : (
            <p className="text-2xl font-bold text-zinc-100">{org.paymentTerms}</p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Price Group</p>
          {editMode ? (
            <input
              value={editForm.priceGroupId}
              onChange={e => setEditForm({ ...editForm, priceGroupId: e.target.value })}
              placeholder="None"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none"
            />
          ) : (
            <p className="text-lg font-semibold text-zinc-100">{org.priceGroupId ?? <span className="text-zinc-500 text-sm">Not assigned</span>}</p>
          )}
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-200">Contacts</span>
            <span className="text-xs text-zinc-500">({org.contacts.length})</span>
          </div>
          <button
            onClick={() => setShowContactForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
          >
            <Plus className="w-3 h-3" /> Add Contact
          </button>
        </div>

        {showContactForm && (
          <div className="p-4 border-b border-zinc-800 bg-zinc-800/30 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input
                value={contactForm.firstName}
                onChange={e => setContactForm({ ...contactForm, firstName: e.target.value })}
                placeholder="First Name *"
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
              <input
                value={contactForm.lastName}
                onChange={e => setContactForm({ ...contactForm, lastName: e.target.value })}
                placeholder="Last Name *"
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
              <input
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="Email *"
                type="email"
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
              <input
                value={contactForm.phone}
                onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                placeholder="Phone"
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
              <select
                value={contactForm.role}
                onChange={e => setContactForm({ ...contactForm, role: e.target.value })}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none"
              >
                <option value="buyer">Buyer</option>
                <option value="approver">Approver</option>
                <option value="admin">Admin</option>
              </select>
              <label className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={contactForm.isDefault}
                  onChange={e => setContactForm({ ...contactForm, isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                Default Contact
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={addContact} disabled={savingContact} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                <Check className="w-3 h-3" /> {savingContact ? 'Adding...' : 'Add'}
              </button>
              <button onClick={() => { setShowContactForm(false); setError('') }} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">Cancel</button>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Default</th>
            </tr>
          </thead>
          <tbody>
            {org.contacts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-zinc-500 text-xs">No contacts yet</td></tr>
            ) : org.contacts.map(c => (
              <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="px-4 py-3 text-zinc-100">{c.firstName} {c.lastName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${ROLE_BADGE[c.role] ?? 'bg-zinc-700 text-zinc-300'}`}>
                    {c.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{c.email}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{c.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  {c.isDefault && <span className="text-green-400 text-xs font-medium">Primary</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabs: Quotes / Requisitions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex border-b border-zinc-800">
          {(['quotes', 'reqs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab === 'quotes' ? `Quotes (${org.quotes.length})` : `Requisitions (${org.requisitions.length})`}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          {activeTab === 'quotes' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Quote #</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {org.quotes.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-zinc-500 text-xs">No quotes</td></tr>
                ) : org.quotes.map(q => (
                  <tr key={q.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-3">
                      <Link href={`/b2b/quotes/${q.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{q.quoteNumber}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${QUOTE_STATUS[q.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300 font-mono text-xs">${q.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(q.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Req #</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {org.requisitions.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-zinc-500 text-xs">No requisitions</td></tr>
                ) : org.requisitions.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-3">
                      <Link href={`/b2b/requisitions/${r.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{r.reqNumber}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${QUOTE_STATUS[r.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300 font-mono text-xs">${r.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
