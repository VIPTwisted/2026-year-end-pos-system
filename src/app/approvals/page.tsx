'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Plus,
  Trash2,
  ChevronRight,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApprovalStep {
  id: string
  stepOrder: number
  approverRole: string
  approverName: string | null
  isRequired: boolean
}

interface ApprovalAction {
  id: string
  stepOrder: number
  action: string
  actorName: string
  actorRole: string
  comment: string | null
  createdAt: string
}

interface ApprovalWorkflow {
  id: string
  name: string
  entityType: string
  description: string | null
  isActive: boolean
  createdAt: string
  steps: ApprovalStep[]
  _count: { requests: number }
}

interface ApprovalRequest {
  id: string
  workflowId: string
  entityType: string
  entityId: string
  entityRef: string
  requestedBy: string
  currentStep: number
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
  workflow: { id: string; name: string; entityType: string }
  actions: ApprovalAction[]
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  PURCHASE_ORDER: 'Purchase Order',
  VENDOR_INVOICE: 'Vendor Invoice',
  SALES_ORDER: 'Sales Order',
  JOURNAL_ENTRY: 'Journal Entry',
  BUDGET: 'Budget',
  CUSTOMER: 'Customer',
}

const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABELS)

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${
        cls[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'
      }`}
    >
      {status}
    </span>
  )
}

function DocTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
      {(ENTITY_TYPE_LABELS[type] ?? type).replace(/_/g, ' ')}
    </span>
  )
}

// ─── Approve/Reject Modal ─────────────────────────────────────────────────────

interface ActionModalProps {
  request: ApprovalRequest
  defaultAction: 'approve' | 'reject'
  onClose: () => void
  onDone: () => void
}

function ActionModal({ request, defaultAction, onClose, onDone }: ActionModalProps) {
  const [action, setAction] = useState<'approve' | 'reject'>(defaultAction)
  const [actorName, setActorName] = useState('')
  const [actorRole, setActorRole] = useState('manager')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

  const submit = async () => {
    if (!actorName.trim()) {
      setError('Your name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/approvals/${request.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorName: actorName.trim(),
          actorRole,
          comment: comment.trim() || undefined,
        }),
      })
      const data: { error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')
      onDone()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Decision</p>
            <h3 className="text-[15px] font-semibold text-zinc-100">{request.entityRef}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Action toggle */}
          <div>
            <label className={labelCls}>Decision</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAction('approve')}
                className={`flex-1 h-9 rounded text-[12px] font-semibold border transition-colors ${
                  action === 'approve'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`flex-1 h-9 rounded text-[12px] font-semibold border transition-colors ${
                  action === 'reject'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Reject
              </button>
            </div>
          </div>

          {/* Actor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Your Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={actorName}
                onChange={e => setActorName(e.target.value)}
                placeholder="Enter your name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Your Role</label>
              <select value={actorRole} onChange={e => setActorRole(e.target.value)} className={inputCls}>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className={labelCls}>Response Note</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a note or reason…"
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-800/50">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 hover:bg-zinc-800/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className={`h-8 px-5 rounded text-[12px] font-semibold text-white transition-colors disabled:opacity-60 ${
              action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Submitting…' : action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Workflow Modal ────────────────────────────────────────────────────────

interface AddWorkflowModalProps {
  onClose: () => void
  onDone: () => void
}

interface StepDraft {
  stepOrder: number
  approverRole: string
  approverName: string
  isRequired: boolean
}

function AddWorkflowModal({ onClose, onDone }: AddWorkflowModalProps) {
  const [name, setName] = useState('')
  const [entityType, setEntityType] = useState('PURCHASE_ORDER')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<StepDraft[]>([
    { stepOrder: 1, approverRole: 'manager', approverName: '', isRequired: true },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

  const addStep = () =>
    setSteps(prev => [
      ...prev,
      { stepOrder: prev.length + 1, approverRole: 'manager', approverName: '', isRequired: true },
    ])

  const removeStep = (idx: number) =>
    setSteps(prev =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepOrder: i + 1 }))
    )

  const updateStep = (idx: number, key: keyof StepDraft, value: string | boolean | number) =>
    setSteps(prev => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)))

  const submit = async () => {
    if (!name.trim()) { setError('Workflow name is required'); return }
    if (steps.length === 0) { setError('At least one step is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/approvals/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          entityType,
          description: description.trim() || undefined,
          isActive: true,
          steps: steps.map(s => ({
            stepOrder: s.stepOrder,
            approverRole: s.approverRole,
            approverName: s.approverName.trim() || undefined,
            isRequired: s.isRequired,
          })),
        }),
      })
      const data: { error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      onDone()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50 shrink-0">
          <h3 className="text-[15px] font-semibold text-zinc-100">Add Workflow Rule</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className={labelCls}>Workflow Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Purchase Order Approval"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Applies To <span className="text-red-400">*</span></label>
              <select value={entityType} onChange={e => setEntityType(e.target.value)} className={inputCls}>
                {ENTITY_TYPES.map(t => (
                  <option key={t} value={t}>{ENTITY_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + ' mb-0'}>Approval Steps</label>
              <button
                onClick={addStep}
                className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Step {step.stepOrder}
                    </span>
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(idx)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Approver Role</label>
                      <select
                        value={step.approverRole}
                        onChange={e => updateStep(idx, 'approverRole', e.target.value)}
                        className={inputCls}
                      >
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="accountant">Accountant</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Name (optional)</label>
                      <input
                        type="text"
                        value={step.approverName}
                        onChange={e => updateStep(idx, 'approverName', e.target.value)}
                        placeholder="e.g. John Smith"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`req-${idx}`}
                      checked={step.isRequired}
                      onChange={e => updateStep(idx, 'isRequired', e.target.checked)}
                      className="w-3.5 h-3.5 accent-blue-600"
                    />
                    <label htmlFor={`req-${idx}`} className="text-[11px] text-zinc-400 cursor-pointer">
                      Required step
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-800/50 shrink-0">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 hover:bg-zinc-800/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="h-8 px-5 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create Workflow'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'requests' | 'workflows'

export default function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>('requests')

  // Requests state
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [reqLoading, setReqLoading] = useState(true)
  const [reqError, setReqError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Workflows state
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([])
  const [wfLoading, setWfLoading] = useState(true)
  const [wfError, setWfError] = useState<string | null>(null)

  // Modal state
  const [actionModal, setActionModal] = useState<{
    request: ApprovalRequest
    action: 'approve' | 'reject'
  } | null>(null)
  const [showAddWorkflow, setShowAddWorkflow] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadRequests = useCallback(() => {
    setReqLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('entityType', typeFilter)
    fetch(`/api/approvals?${params.toString()}`)
      .then(r => r.json())
      .then((d: ApprovalRequest[] | { error: string }) => {
        if (Array.isArray(d)) setRequests(d)
        else { setReqError('Failed to load'); setRequests([]) }
      })
      .catch(() => setReqError('Failed to load'))
      .finally(() => setReqLoading(false))
  }, [statusFilter, typeFilter])

  const loadWorkflows = useCallback(() => {
    setWfLoading(true)
    fetch('/api/approvals/workflows')
      .then(r => r.json())
      .then((d: ApprovalWorkflow[] | { error: string }) => {
        if (Array.isArray(d)) setWorkflows(d)
        else { setWfError('Failed to load workflows'); setWorkflows([]) }
      })
      .catch(() => setWfError('Failed to load workflows'))
      .finally(() => setWfLoading(false))
  }, [])

  useEffect(() => { loadRequests() }, [loadRequests])
  useEffect(() => { loadWorkflows() }, [loadWorkflows])

  // Stats
  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  }

  const toggleWorkflowActive = async (wf: ApprovalWorkflow) => {
    try {
      const res = await fetch(`/api/approvals/workflows/${wf.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !wf.isActive }),
      })
      if (!res.ok) throw new Error('Update failed')
      notify(wf.isActive ? 'Workflow deactivated' : 'Workflow activated')
      loadWorkflows()
    } catch {
      notify('Failed to update workflow', 'err')
    }
  }

  const deleteWorkflow = async (wf: ApprovalWorkflow) => {
    try {
      const res = await fetch(`/api/approvals/workflows/${wf.id}`, { method: 'DELETE' })
      const data: { error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      notify('Workflow deleted')
      loadWorkflows()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'err')
    }
  }

  const tabCls = (t: Tab) =>
    `h-9 px-5 text-[13px] font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-blue-500 text-blue-400'
        : 'border-transparent text-zinc-500 hover:text-zinc-300'
    }`

  return (
    <>
      <TopBar title="Approval Workflows" />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Operations</p>
              <h2 className="text-xl font-bold text-zinc-100">Approvals</h2>
              <p className="text-xs text-zinc-500 mt-0.5">D365-style approval workflows for POs, journals, and expenses</p>
            </div>
            {tab === 'workflows' && (
              <button
                onClick={() => setShowAddWorkflow(true)}
                className="h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </button>
            )}
          </div>

          {/* Stats row (always visible) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pending',   value: stats.pending,   icon: Clock,        color: 'text-amber-400'   },
              { label: 'Approved',  value: stats.approved,  icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Rejected',  value: stats.rejected,  icon: XCircle,      color: 'text-red-400'     },
              { label: 'Cancelled', value: stats.cancelled, icon: Ban,          color: 'text-zinc-500'    },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${color}`} />
                  requests
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-800/50 flex gap-0">
            <button className={tabCls('requests')} onClick={() => setTab('requests')}>
              Pending Requests
            </button>
            <button className={tabCls('workflows')} onClick={() => setTab('workflows')}>
              Workflow Rules
            </button>
          </div>

          {/* ── Tab: Pending Requests ── */}
          {tab === 'requests' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {['', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`h-7 px-3 rounded text-[11px] font-medium capitalize transition-colors border ${
                        statusFilter === s
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                      }`}
                    >
                      {s || 'All'}
                    </button>
                  ))}
                </div>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="h-7 px-2 rounded text-[11px] bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">All Types</option>
                  {ENTITY_TYPES.map(t => (
                    <option key={t} value={t}>{ENTITY_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              {reqLoading ? (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : reqError ? (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-12 text-red-400 text-sm">
                  {reqError}
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
                  <Clock className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-[13px]">No approval requests found.</p>
                </div>
              ) : (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-zinc-800/60">
                        <tr>
                          {['Request #', 'Type', 'Document Ref', 'Requested By', 'Amount', 'Requested At', 'Status', 'Actions'].map(h => (
                            <th
                              key={h}
                              className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${
                                h === 'Amount' || h === 'Status' ? 'text-center' : h === 'Actions' ? 'text-right' : 'text-left'
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40">
                        {requests.map(r => (
                          <tr key={r.id} className="hover:bg-zinc-800/20 transition-colors group">
                            <td className="px-4 py-3">
                              <span className="font-mono text-[12px] text-zinc-300">APR-{r.id.slice(-6).toUpperCase()}</span>
                            </td>
                            <td className="px-4 py-3">
                              <DocTypeBadge type={r.entityType} />
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-[13px] font-medium text-zinc-100">{r.entityRef}</span>
                              {r.workflow && (
                                <p className="text-[10px] text-zinc-600 mt-0.5 truncate max-w-[140px]">{r.workflow.name}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">{r.requestedBy}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-zinc-500">—</td>
                            <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              {r.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setActionModal({ request: r, action: 'approve' })}
                                    className="h-7 px-2.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setActionModal({ request: r, action: 'reject' })}
                                    className="h-7 px-2.5 rounded text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <a
                                  href={`/approvals/${r.id}`}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-[11px] text-zinc-500 hover:text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800/60 transition-colors"
                                >
                                  View
                                  <ChevronRight className="w-3 h-3" />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Workflow Rules ── */}
          {tab === 'workflows' && (
            <div className="space-y-4">
              {wfLoading ? (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : wfError ? (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-12 text-red-400 text-sm">
                  {wfError}
                </div>
              ) : workflows.length === 0 ? (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
                  <p className="text-[13px]">No workflow rules defined yet.</p>
                  <button
                    onClick={() => setShowAddWorkflow(true)}
                    className="mt-3 h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Add First Rule
                  </button>
                </div>
              ) : (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-zinc-800/60">
                        <tr>
                          {['Document Type', 'Name', 'Steps / Approvers', 'Requests', 'Active', 'Actions'].map(h => (
                            <th
                              key={h}
                              className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${
                                h === 'Active' || h === 'Requests' ? 'text-center' : h === 'Actions' ? 'text-right' : 'text-left'
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40">
                        {workflows.map(wf => (
                          <tr key={wf.id} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="px-4 py-3">
                              <DocTypeBadge type={wf.entityType} />
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-zinc-200">{wf.name}</p>
                              {wf.description && (
                                <p className="text-[11px] text-zinc-600 mt-0.5 truncate max-w-[200px]">{wf.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {wf.steps.map(step => (
                                  <div
                                    key={step.id}
                                    className="inline-flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/60 rounded px-2 py-0.5"
                                  >
                                    <span className="text-[10px] font-mono text-zinc-600">{step.stepOrder}.</span>
                                    <span className="text-[11px] text-zinc-300 capitalize">{step.approverRole}</span>
                                    {step.approverName && (
                                      <span className="text-[10px] text-zinc-500">({step.approverName})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-sm tabular-nums text-zinc-400">
                              {wf._count.requests}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {/* Toggle active */}
                              <button
                                onClick={() => toggleWorkflowActive(wf)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                  wf.isActive ? 'bg-emerald-500' : 'bg-zinc-700'
                                }`}
                                title={wf.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                    wf.isActive ? 'translate-x-4' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => deleteWorkflow(wf)}
                                className="h-7 w-7 inline-flex items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                                title="Delete workflow"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Action modal */}
      {actionModal && (
        <ActionModal
          request={actionModal.request}
          defaultAction={actionModal.action}
          onClose={() => setActionModal(null)}
          onDone={() => {
            setActionModal(null)
            notify(actionModal.action === 'approve' ? 'Request approved' : 'Request rejected')
            loadRequests()
          }}
        />
      )}

      {/* Add workflow modal */}
      {showAddWorkflow && (
        <AddWorkflowModal
          onClose={() => setShowAddWorkflow(false)}
          onDone={() => {
            setShowAddWorkflow(false)
            notify('Workflow created')
            loadWorkflows()
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-lg text-sm font-medium shadow-xl border transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/50'
              : 'bg-red-950/90 text-red-300 border-red-800/50'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
