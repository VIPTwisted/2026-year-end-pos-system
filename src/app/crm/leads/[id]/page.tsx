'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, RefreshCw, CheckCircle2, ChevronDown, XCircle,
  Paperclip, MoreHorizontal, ArrowDown, Info, ChevronLeft, ChevronRight, Save,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadActivity {
  id: string
  activityType: string
  subject?: string
  notes?: string
  outcome?: string
  recordedBy?: string
  createdAt: string
}

interface Lead {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  mobilePhone?: string
  company?: string
  jobTitle?: string
  website?: string
  source: string
  status: string
  topic?: string
  type?: string
  score: number
  assignedTo?: string
  notes?: string
  bpfStage?: string
  bpfDays?: number
  activities: LeadActivity[]
  convertedAt?: string | null
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BPF_STEPS = ['Qualify', 'Develop', 'Propose', 'Close']

const SOURCES = ['Web', 'Referral', 'Social Media', 'Event', 'Cold Call', 'Walk-in', 'Partner', 'Other']
const TYPES = ['Item based', 'Service based', 'Mixed', 'Unknown']
const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost']

const TAB_LIST = ['Summary', 'Details', 'Related'] as const
type Tab = typeof TAB_LIST[number]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '??'
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return new Date(iso).toLocaleDateString()
}

function groupLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'TODAY'
  if (days < 7) return 'EARLIER THIS WEEK'
  if (days < 30) return 'EARLIER THIS MONTH'
  return 'OLDER'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RibbonBtn({
  icon: Icon, label, onClick, variant = 'default', chevron = false,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  variant?: 'default' | 'primary' | 'danger'
  chevron?: boolean
}) {
  const base = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap'
  const styles = {
    default: 'text-zinc-300 hover:bg-white/10',
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    danger: 'text-red-400 hover:bg-red-500/10',
  }
  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
      {chevron && <ChevronDown className="w-3 h-3 opacity-60" />}
    </button>
  )
}

function BPFBar({ steps, activeStep, daysActive }: { steps: string[]; activeStep: string; daysActive: number }) {
  const activeIdx = steps.indexOf(activeStep)
  return (
    <div className="flex items-stretch rounded-lg overflow-hidden border border-zinc-700/60 text-xs">
      {/* Left banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0"
        style={{ background: 'linear-gradient(90deg,#c2410c,#ea580c)' }}>
        <span className="font-semibold text-white text-[11px]">Lead to Opportunity Sale...</span>
        <span className="text-orange-200 text-[10px]">Active for {daysActive} days</span>
      </div>

      {/* Steps */}
      <div className="flex items-center bg-[#16213e] flex-1 px-2">
        {steps.map((step, i) => {
          const done = i < activeIdx
          const active = i === activeIdx
          return (
            <div key={step} className="flex items-center">
              {i > 0 && (
                <div className={`h-px w-6 mx-1 ${done || active ? 'bg-blue-500' : 'bg-zinc-700'}`} />
              )}
              <div className="flex items-center gap-1.5 px-2 py-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                  active ? 'border-blue-500 bg-blue-500' :
                  done ? 'border-blue-400 bg-blue-400' :
                  'border-zinc-600 bg-transparent'
                }`}>
                  {(done || active) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={`font-medium ${active ? 'text-blue-400' : done ? 'text-blue-300' : 'text-zinc-500'}`}>
                  {step}
                </span>
                {active && (
                  <span className="text-[9px] text-zinc-500 ml-0.5">({daysActive} D)</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Arrow nav */}
      <div className="flex items-center gap-0.5 px-2 bg-[#16213e] border-l border-zinc-700/60">
        <button className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function FormField({
  label, required, children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-zinc-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0d0e24] border border-zinc-700/70 rounded px-3 py-1.5 text-zinc-100 text-sm
        focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/20 transition-colors
        placeholder:text-zinc-600"
    />
  )
}

function SelectInput({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#0d0e24] border border-zinc-700/70 rounded px-3 py-1.5 text-zinc-100 text-sm
        focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/20 transition-colors
        appearance-none cursor-pointer"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TimelinePanel({
  activities, noteText, onNoteChange, onAddNote,
}: {
  activities: LeadActivity[]
  noteText: string
  onNoteChange: (v: string) => void
  onAddNote: () => void
}) {
  // Group by relative period
  const groups: Record<string, LeadActivity[]> = {}
  activities.forEach(a => {
    const label = groupLabel(a.createdAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(a)
  })

  return (
    <div className="bg-[#16213e] border border-zinc-700/50 rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50">
        <span className="text-sm font-semibold text-zinc-100">Timeline</span>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700/60 text-zinc-400 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700/60 text-zinc-400 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note input */}
      <div className="px-4 py-3 border-b border-zinc-700/40">
        <div className="flex items-center gap-2 bg-[#0d0e24] border border-zinc-700/60 rounded-lg px-3 py-2">
          <input
            value={noteText}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="Enter a note..."
            className="flex-1 bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
            onKeyDown={e => { if (e.key === 'Enter' && noteText.trim()) onAddNote() }}
          />
          <button
            onClick={onAddNote}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Attach"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(groups).length === 0 && (
          <div className="text-zinc-600 text-sm text-center py-8">No activities yet</div>
        )}
        {Object.entries(groups).map(([label, acts]) => (
          <div key={label}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold text-zinc-500 tracking-wider">{label}</span>
              <div className="flex-1 h-px bg-zinc-700/40" />
              <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <ArrowDown className="w-3 h-3" />
              </button>
              <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {acts.map(a => {
                const initStr = (a.recordedBy ?? 'System').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div key={a.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-blue-300 mt-0.5">
                      {initStr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-zinc-200">
                          {a.recordedBy ?? 'System'}
                        </span>
                        <span className="text-[11px] text-zinc-500 capitalize">
                          logged a {a.activityType}
                        </span>
                        <span className="text-[10px] text-zinc-600 ml-auto">
                          {relativeDate(a.createdAt)}
                        </span>
                      </div>
                      {a.subject && (
                        <div className="text-sm text-zinc-100 mt-0.5">{a.subject}</div>
                      )}
                      {a.notes && (
                        <div className="text-xs text-zinc-400 mt-0.5">{a.notes}</div>
                      )}
                      {a.outcome && (
                        <div className="text-xs text-green-400/80 mt-0.5">Outcome: {a.outcome}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Summary')
  const [noteText, setNoteText] = useState('')

  // Editable form state (mirrors lead fields)
  const [form, setForm] = useState({
    topic: '',
    type: 'Item based',
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    phone: '',
    mobilePhone: '',
    email: '',
    website: '',
    source: 'Web',
  })

  function setF(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function load() {
    setLoading(true)
    fetch(`/api/crm/leads/${id}`)
      .then(r => r.json())
      .then((d: Lead) => {
        setLead(d)
        setForm({
          topic: d.topic ?? '',
          type: d.type ?? 'Item based',
          firstName: d.firstName ?? '',
          lastName: d.lastName ?? '',
          jobTitle: d.jobTitle ?? '',
          company: d.company ?? '',
          phone: d.phone ?? '',
          mobilePhone: d.mobilePhone ?? '',
          email: d.email ?? '',
          website: d.website ?? '',
          source: d.source ?? 'Web',
        })
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [id])

  async function save() {
    setSaving(true)
    await fetch(`/api/crm/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    load()
  }

  async function qualify() {
    await fetch(`/api/crm/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'qualified', bpfStage: 'Develop' }),
    })
    load()
  }

  async function disqualify() {
    if (!confirm('Disqualify this lead?')) return
    await fetch(`/api/crm/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'lost' }),
    })
    load()
  }

  async function deleteLead() {
    if (!confirm('Delete this lead permanently?')) return
    await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' })
    router.push('/crm/leads')
  }

  async function addNote() {
    if (!noteText.trim()) return
    await fetch(`/api/crm/leads/${id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityType: 'note', subject: noteText, recordedBy: 'You' }),
    }).catch(() => {})
    setNoteText('')
    load()
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0d0e24] flex items-center justify-center">
        <div className="text-zinc-500 text-sm animate-pulse">Loading lead...</div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-[100dvh] bg-[#0d0e24] flex items-center justify-center">
        <div className="text-red-400 text-sm">Lead not found.</div>
      </div>
    )
  }

  const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unnamed Lead'
  const bpfStage = lead.bpfStage ?? 'Qualify'
  const bpfDays = lead.bpfDays ?? 0

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24' }}>
      {/* TopBar */}
      <TopBar
        title={fullName}
        breadcrumb={[
          { label: 'CRM', href: '/crm' },
          { label: 'Leads', href: '/crm/leads' },
        ]}
        actions={
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      {/* Action Ribbon */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-zinc-700/40 flex-wrap"
        style={{ background: '#16213e' }}>
        <RibbonBtn icon={Plus} label="New" variant="primary" onClick={() => router.push('/crm/leads/new')} />
        <div className="w-px h-5 bg-zinc-700/60 mx-1" />
        <RibbonBtn icon={Trash2} label="Delete" variant="danger" onClick={deleteLead} />
        <RibbonBtn icon={RefreshCw} label="Refresh" onClick={load} />
        <div className="w-px h-5 bg-zinc-700/60 mx-1" />
        <RibbonBtn icon={CheckCircle2} label="Qualify" onClick={qualify} />
        <RibbonBtn label="Process" chevron />
        <div className="w-px h-5 bg-zinc-700/60 mx-1" />
        <RibbonBtn icon={XCircle} label="Disqualify" chevron variant="danger" onClick={disqualify} />
        <div className="w-px h-5 bg-zinc-700/60 mx-1" />
        <RibbonBtn label="..." />
      </div>

      {/* Lead Header */}
      <div className="px-6 py-4 flex items-start gap-5 border-b border-zinc-700/40"
        style={{ background: '#16213e' }}>
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 text-lg font-bold text-white shadow-lg">
          {initials(lead.firstName, lead.lastName)}
        </div>

        {/* Name + label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] text-zinc-500 font-medium">Lead: Lead</span>
            <ChevronDown className="w-3 h-3 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight truncate">{fullName}</h1>
          {lead.jobTitle && (
            <div className="text-sm text-zinc-400 mt-0.5">{lead.jobTitle} · {lead.company}</div>
          )}
        </div>

        {/* Lead Source */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <label className="text-[11px] text-zinc-500">Lead Source</label>
          <div className="flex items-center gap-1 bg-[#0d0e24] border border-zinc-700/60 rounded px-3 py-1.5 text-sm text-zinc-200">
            {form.source}
            <ChevronDown className="w-3 h-3 ml-1 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* BPF Bar */}
      <div className="px-6 py-3 border-b border-zinc-700/40" style={{ background: '#16213e' }}>
        <BPFBar steps={BPF_STEPS} activeStep={bpfStage} daysActive={bpfDays} />
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-0 px-6 border-b border-zinc-700/40" style={{ background: '#16213e' }}>
        {TAB_LIST.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'Summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
            {/* Left: Contact card */}
            <div className="bg-[#16213e] border border-zinc-700/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-100 pb-1 border-b border-zinc-700/40">Contact</h2>

              <div className="space-y-3">
                <FormField label="Topic" required>
                  <TextInput value={form.topic} onChange={v => setF('topic', v)} placeholder="e.g. POS System Upgrade" />
                </FormField>

                <FormField label="Type" required>
                  <div className="relative">
                    <SelectInput value={form.type} onChange={v => setF('type', v)} options={TYPES} />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  </div>
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First Name" required>
                    <TextInput value={form.firstName} onChange={v => setF('firstName', v)} />
                  </FormField>
                  <FormField label="Last Name" required>
                    <TextInput value={form.lastName} onChange={v => setF('lastName', v)} />
                  </FormField>
                </div>

                <FormField label="Job Title">
                  <TextInput value={form.jobTitle} onChange={v => setF('jobTitle', v)} />
                </FormField>

                <FormField label="Company Name">
                  <TextInput value={form.company} onChange={v => setF('company', v)} />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Business Phone">
                    <TextInput value={form.phone} onChange={v => setF('phone', v)} type="tel" />
                  </FormField>
                  <FormField label="Mobile Phone">
                    <TextInput value={form.mobilePhone} onChange={v => setF('mobilePhone', v)} type="tel" />
                  </FormField>
                </div>

                <FormField label="Email">
                  <TextInput value={form.email} onChange={v => setF('email', v)} type="email" />
                </FormField>

                <FormField label="Website">
                  <TextInput value={form.website} onChange={v => setF('website', v)} type="url" placeholder="https://" />
                </FormField>

                <FormField label="Lead Source">
                  <div className="relative">
                    <SelectInput value={form.source} onChange={v => setF('source', v)} options={SOURCES} />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  </div>
                </FormField>
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors mt-2"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Right: Timeline */}
            <TimelinePanel
              activities={lead.activities ?? []}
              noteText={noteText}
              onNoteChange={setNoteText}
              onAddNote={addNote}
            />
          </div>
        )}

        {activeTab === 'Details' && (
          <div className="bg-[#16213e] border border-zinc-700/50 rounded-xl p-5 max-w-2xl space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100 pb-1 border-b border-zinc-700/40">Lead Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Status', value: lead.status },
                { label: 'Lead Score', value: String(lead.score) },
                { label: 'Assigned To', value: lead.assignedTo ?? '—' },
                { label: 'Created', value: new Date(lead.createdAt).toLocaleDateString() },
                { label: 'BPF Stage', value: bpfStage },
                { label: 'Days Active', value: String(bpfDays) },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-[11px] text-zinc-500 mb-0.5">{item.label}</div>
                  <div className="text-sm text-zinc-200 capitalize">{item.value}</div>
                </div>
              ))}
            </div>
            {lead.notes && (
              <div className="border-t border-zinc-700/40 pt-4">
                <div className="text-[11px] text-zinc-500 mb-1">Notes</div>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap">{lead.notes}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Related' && (
          <div className="bg-[#16213e] border border-zinc-700/50 rounded-xl p-8 max-w-lg text-center">
            <div className="text-zinc-600 text-sm">No related records found for this lead.</div>
          </div>
        )}
      </div>
    </div>
  )
}
