'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, X, Phone, Mail, MessageSquare, StickyNote, Store, DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react'

interface CustomerProfile {
  id: string
  customerName: string
  email: string | null
  phone: string | null
  preferredStore: string | null
  assignedAssociate: string | null
  tier: string
  lifetimeValue: number
  totalOrders: number
  avgOrderValue: number
  lastPurchaseDate: string | null
  birthday: string | null
  anniversary: string | null
  preferences: string
  notes: string | null
  doNotContact: boolean
}

interface ClientActivity {
  id: string
  activityType: string
  customerName: string | null
  subject: string | null
  notes: string
  outcome: string | null
  recordedBy: string | null
  followUpDate: string | null
  createdAt: string
}

interface AssocTask {
  id: string
  subject: string
  taskType: string
  priority: string
  status: string
  dueDate: string | null
  description: string | null
}

const TIER_COLORS: Record<string, string> = {
  vip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  standard: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  note: StickyNote,
  'in-store-visit': Store,
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  normal: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
  low: 'bg-zinc-800/50 text-zinc-500 border-zinc-700',
}

const MOCK_ORDERS = [
  { id: '1', date: '2026-03-15', products: 'Silk Blouse, Trousers', amount: 485.00 },
  { id: '2', date: '2026-02-08', products: 'Cashmere Sweater', amount: 320.00 },
  { id: '3', date: '2026-01-20', products: 'Evening Dress, Clutch Bag', amount: 1250.00 },
  { id: '4', date: '2025-12-05', products: 'Wool Coat', amount: 695.00 },
  { id: '5', date: '2025-11-18', products: 'Scarf, Leather Gloves', amount: 215.00 },
]

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [activities, setActivities] = useState<ClientActivity[]>([])
  const [tasks, setTasks] = useState<AssocTask[]>([])
  const [tab, setTab] = useState<'profile' | 'history' | 'activities' | 'tasks'>('profile')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Partial<CustomerProfile>>({})
  const [saving, setSaving] = useState(false)
  const [prefTags, setPrefTags] = useState<{ categories: string[]; brands: string[]; sizes: string[] }>({ categories: [], brands: [], sizes: [] })
  const [prefInput, setPrefInput] = useState({ categories: '', brands: '', sizes: '' })
  const [showActForm, setShowActForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [actForm, setActForm] = useState({ activityType: 'call', subject: '', notes: '', outcome: '', followUpDate: '', recordedBy: '' })
  const [taskForm, setTaskForm] = useState({ subject: '', taskType: 'clienteling', priority: 'normal', description: '', dueDate: '', assignedTo: '' })

  async function load() {
    const [custRes, actRes, taskRes] = await Promise.all([
      fetch(`/api/clienteling/customers/${id}`),
      fetch(`/api/clienteling/activities?customerId=${id}`),
      fetch(`/api/clienteling/tasks?customerId=${id}`),
    ])
    const [cust, acts, taskData] = await Promise.all([custRes.json(), actRes.json(), taskRes.json()])
    setCustomer(cust)
    setProfile(cust)
    const prefs = JSON.parse(cust.preferences || '{}')
    setPrefTags({
      categories: prefs.categories || [],
      brands: prefs.brands || [],
      sizes: prefs.sizes || [],
    })
    setActivities(acts)
    setTasks(taskData)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function saveProfile() {
    setSaving(true)
    const prefs = JSON.stringify(prefTags)
    await fetch(`/api/clienteling/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, preferences: prefs }),
    })
    setSaving(false)
    load()
  }

  async function logActivity() {
    if (!actForm.notes.trim()) return
    setSaving(true)
    await fetch('/api/clienteling/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...actForm, customerId: id, customerName: customer?.customerName }),
    })
    setActForm({ activityType: 'call', subject: '', notes: '', outcome: '', followUpDate: '', recordedBy: '' })
    setShowActForm(false)
    setSaving(false)
    load()
  }

  async function createTask() {
    if (!taskForm.subject.trim()) return
    setSaving(true)
    await fetch('/api/clienteling/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskForm, customerId: id, customerName: customer?.customerName }),
    })
    setTaskForm({ subject: '', taskType: 'clienteling', priority: 'normal', description: '', dueDate: '', assignedTo: '' })
    setShowTaskForm(false)
    setSaving(false)
    load()
  }

  async function completeTask(taskId: string) {
    await fetch(`/api/clienteling/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    load()
  }

  function addPrefTag(field: 'categories' | 'brands' | 'sizes') {
    const val = prefInput[field].trim()
    if (!val) return
    setPrefTags(prev => ({ ...prev, [field]: [...prev[field], val] }))
    setPrefInput(prev => ({ ...prev, [field]: '' }))
  }

  function removePrefTag(field: 'categories' | 'brands' | 'sizes', idx: number) {
    setPrefTags(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }))
  }

  function daysSince(dateStr: string | null) {
    if (!dateStr) return null
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  }

  if (loading) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>
  if (!customer) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Customer not found</div>

  const days = daysSince(customer.lastPurchaseDate)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/clienteling/customers" className="mt-1 text-zinc-400 hover:text-zinc-100">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{customer.customerName}</h1>
            <span className={`text-sm px-2.5 py-0.5 rounded-full border font-semibold ${TIER_COLORS[customer.tier]}`}>
              {customer.tier.toUpperCase()}
            </span>
            {customer.doNotContact && (
              <span className="text-xs px-2 py-0.5 rounded border bg-red-500/20 text-red-400 border-red-500/30">Do Not Contact</span>
            )}
          </div>
          {customer.assignedAssociate && (
            <p className="text-sm text-zinc-500 mt-0.5">Assigned associate: {customer.assignedAssociate}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Lifetime Value', value: `$${customer.lifetimeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-green-400' },
          { icon: ShoppingCart, label: 'Total Orders', value: customer.totalOrders.toString(), color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Avg Order Value', value: `$${customer.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-zinc-100' },
          { icon: Calendar, label: 'Days Since Last Purchase', value: days !== null ? `${days} days` : 'Never', color: days && days > 90 ? 'text-red-400' : 'text-zinc-100' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['profile', 'history', 'activities', 'tasks'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
            }`}>
            {t} {t === 'activities' ? `(${activities.length})` : t === 'tasks' ? `(${tasks.filter(t => t.status === 'open').length})` : ''}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email</label>
                <input value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Phone</label>
                <input value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Preferred Store</label>
                <input value={profile.preferredStore || ''} onChange={e => setProfile({ ...profile, preferredStore: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Assigned Associate</label>
                <input value={profile.assignedAssociate || ''} onChange={e => setProfile({ ...profile, assignedAssociate: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Birthday</label>
                <input type="date" value={profile.birthday ? profile.birthday.substring(0, 10) : ''}
                  onChange={e => setProfile({ ...profile, birthday: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Anniversary</label>
                <input type="date" value={profile.anniversary ? profile.anniversary.substring(0, 10) : ''}
                  onChange={e => setProfile({ ...profile, anniversary: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tier</label>
                <select value={profile.tier || 'standard'} onChange={e => setProfile({ ...profile, tier: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="dnc" checked={profile.doNotContact || false}
                  onChange={e => setProfile({ ...profile, doNotContact: e.target.checked })}
                  className="accent-red-500 w-4 h-4" />
                <label htmlFor="dnc" className="text-sm text-zinc-300">Do Not Contact</label>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea value={profile.notes || ''} onChange={e => setProfile({ ...profile, notes: e.target.value })}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Preferences</h2>
            {(['categories', 'brands', 'sizes'] as const).map(field => (
              <div key={field}>
                <label className="block text-xs text-zinc-400 mb-2 capitalize">{field}</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {prefTags[field].map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300">
                      {tag}
                      <button onClick={() => removePrefTag(field, i)} className="text-zinc-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={prefInput[field]} onChange={e => setPrefInput({ ...prefInput, [field]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && addPrefTag(field)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder={`Add ${field.slice(0, -1)}...`} />
                  <button onClick={() => addPrefTag(field)}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-zinc-300">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase History Tab */}
      {tab === 'history' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold">Purchase History</h2>
          </div>
          {MOCK_ORDERS.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No purchase history available.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Products</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {MOCK_ORDERS.map(o => (
                  <tr key={o.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-sm text-zinc-400">{new Date(o.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-zinc-100">{o.products}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-zinc-100">
                      ${o.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Activities Tab */}
      {tab === 'activities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowActForm(!showActForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Log Activity
            </button>
          </div>

          {showActForm && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Type</label>
                  <select value={actForm.activityType} onChange={e => setActForm({ ...actForm, activityType: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="in-store-visit">In-Store Visit</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Subject</label>
                  <input value={actForm.subject} onChange={e => setActForm({ ...actForm, subject: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Outcome</label>
                  <select value={actForm.outcome} onChange={e => setActForm({ ...actForm, outcome: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="">None</option>
                    <option value="interested">Interested</option>
                    <option value="not-interested">Not Interested</option>
                    <option value="converted">Converted</option>
                    <option value="follow-up-needed">Follow Up Needed</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Notes *</label>
                  <textarea value={actForm.notes} onChange={e => setActForm({ ...actForm, notes: e.target.value })}
                    rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
                </div>
                <div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Follow-Up Date</label>
                    <input type="date" value={actForm.followUpDate} onChange={e => setActForm({ ...actForm, followUpDate: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-zinc-400 mb-1">Recorded By</label>
                    <input value={actForm.recordedBy} onChange={e => setActForm({ ...actForm, recordedBy: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Associate name" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={logActivity} disabled={saving || !actForm.notes.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium">
                  {saving ? 'Logging...' : 'Log Activity'}
                </button>
                <button onClick={() => setShowActForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {activities.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No activities logged yet.</div>
          ) : (
            <div className="space-y-3">
              {activities.map(act => {
                const Icon = ACTIVITY_ICONS[act.activityType] || StickyNote
                return (
                  <div key={act.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-500 capitalize">{act.activityType.replace('-', ' ')}</span>
                        {act.subject && <span className="text-xs text-zinc-400">— {act.subject}</span>}
                        {act.outcome && (
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${
                            act.outcome === 'converted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            act.outcome === 'interested' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-zinc-700/50 text-zinc-400 border-zinc-600'
                          }`}>{act.outcome}</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300">{act.notes}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {act.recordedBy && <span className="text-xs text-zinc-600">by {act.recordedBy}</span>}
                        {act.followUpDate && <span className="text-xs text-amber-400">Follow up: {new Date(act.followUpDate).toLocaleDateString()}</span>}
                        <span className="text-xs text-zinc-600 ml-auto">{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTaskForm(!showTaskForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div>

          {showTaskForm && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Task Type</label>
                  <select value={taskForm.taskType} onChange={e => setTaskForm({ ...taskForm, taskType: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="clienteling">Clienteling</option>
                    <option value="follow-up">Follow Up</option>
                    <option value="birthday-outreach">Birthday Outreach</option>
                    <option value="lapsed-win-back">Lapsed Win-Back</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Subject *</label>
                  <input value={taskForm.subject} onChange={e => setTaskForm({ ...taskForm, subject: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Task subject" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Assigned To</label>
                  <input value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Associate" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={createTask} disabled={saving || !taskForm.subject.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium">
                  {saving ? 'Creating...' : 'Create Task'}
                </button>
                <button onClick={() => setShowTaskForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No tasks for this customer.</div>
          ) : (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-4">
                  <span className={`text-xs px-2 py-0.5 rounded border ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.normal}`}>
                    {t.priority}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-100">{t.subject}</div>
                    {t.description && <div className="text-xs text-zinc-500 truncate">{t.description}</div>}
                  </div>
                  {t.dueDate && (
                    <span className="text-xs text-zinc-500">{new Date(t.dueDate).toLocaleDateString()}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    t.status === 'open' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    t.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-zinc-700/50 text-zinc-400 border-zinc-600'
                  }`}>{t.status}</span>
                  {t.status === 'open' && (
                    <button onClick={() => completeTask(t.id)}
                      className="text-xs px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors">
                      Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
