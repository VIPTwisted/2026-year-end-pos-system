'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Search,
  RefreshCw,
  X,
  ChevronRight,
  Shield,
  ShieldOff,
  Wallet,
  WalletCards,
  CreditCard,
  Users,
  Package,
  Tag,
  RotateCcw,
  Settings,
  Layers,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface POSOperation {
  id: string
  operationId: number
  operationName: string
  description: string | null
  category: string
  requiresManager: boolean
  allowWithoutDrawer: boolean
  isActive: boolean
  isBuiltIn: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'Cash & Drawer',
  'Payments',
  'Customer',
  'Inventory',
  'Discounts',
  'Returns',
  'Manager',
  'Other',
] as const

type Category = (typeof CATEGORIES)[number]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All': <Layers className="w-3.5 h-3.5" />,
  'Cash & Drawer': <Wallet className="w-3.5 h-3.5" />,
  'Payments': <CreditCard className="w-3.5 h-3.5" />,
  'Customer': <Users className="w-3.5 h-3.5" />,
  'Inventory': <Package className="w-3.5 h-3.5" />,
  'Discounts': <Tag className="w-3.5 h-3.5" />,
  'Returns': <RotateCcw className="w-3.5 h-3.5" />,
  'Manager': <Shield className="w-3.5 h-3.5" />,
  'Other': <Settings className="w-3.5 h-3.5" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  'Cash & Drawer': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Payments': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Customer': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'Inventory': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Discounts': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Returns': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Manager': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Other': 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
        checked ? 'bg-zinc-200' : 'bg-zinc-700',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

// ─── Edit Drawer ──────────────────────────────────────────────────────────────

function EditDrawer({
  operation,
  onClose,
  onSaved,
}: {
  operation: POSOperation | null
  onClose: () => void
  onSaved: (updated: POSOperation) => void
}) {
  const [form, setForm] = useState({
    requiresManager: false,
    allowWithoutDrawer: false,
    isActive: true,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (operation) {
      setForm({
        requiresManager: operation.requiresManager,
        allowWithoutDrawer: operation.allowWithoutDrawer,
        isActive: operation.isActive,
        notes: operation.notes ?? '',
      })
      setError(null)
    }
  }, [operation])

  const handleSave = async () => {
    if (!operation) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/settings/pos-operations/${operation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiresManager: form.requiresManager,
          allowWithoutDrawer: form.allowWithoutDrawer,
          isActive: form.isActive,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }
      const updated: POSOperation = await res.json()
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  if (!operation) return null

  const categoryColor = CATEGORY_COLORS[operation.category] ?? CATEGORY_COLORS['Other']

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-zinc-900 border-l border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-zinc-500">
                OP-{String(operation.operationId).padStart(3, '0')}
              </span>
              {operation.isBuiltIn && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wide">
                  Built-in
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-zinc-100 leading-tight">
              {operation.operationName}
            </h2>
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                categoryColor
              )}
            >
              {CATEGORY_ICONS[operation.category]}
              {operation.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {operation.description && (
            <p className="text-sm text-zinc-400 leading-relaxed">
              {operation.description}
            </p>
          )}

          {/* Toggles */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Permissions
            </h3>

            <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 divide-y divide-zinc-800">
              <div className="flex items-center justify-between p-4">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm font-medium text-zinc-200">
                      Manager Override Required
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Requires manager credentials to perform this operation
                  </p>
                </div>
                <Toggle
                  checked={form.requiresManager}
                  onChange={(v) => setForm((f) => ({ ...f, requiresManager: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <WalletCards className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-medium text-zinc-200">
                      Allow Without Open Drawer
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Can perform this operation without an open cash drawer
                  </p>
                </div>
                <Toggle
                  checked={form.allowWithoutDrawer}
                  onChange={(v) => setForm((f) => ({ ...f, allowWithoutDrawer: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    {form.isActive ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span className="text-sm font-medium text-zinc-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Operation is available at the POS terminal
                  </p>
                </div>
                <Toggle
                  checked={form.isActive}
                  onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              htmlFor="drawer-notes"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Notes
            </label>
            <textarea
              id="drawer-notes"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Add internal notes about this operation..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Info
            </h3>
            <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 divide-y divide-zinc-800 text-xs">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Operation ID</span>
                <span className="font-mono text-zinc-300">{operation.operationId}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Type</span>
                <span className="text-zinc-300">{operation.isBuiltIn ? 'Built-in (D365)' : 'Custom'}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Last updated</span>
                <span className="text-zinc-300">
                  {new Date(operation.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-700 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                'bg-zinc-100 text-zinc-900 hover:bg-white',
                saving && 'opacity-60 cursor-not-allowed'
              )}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function POSOperationsPage() {
  const [operations, setOperations] = useState<POSOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [category, setCategory] = useState<Category>('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<POSOperation | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const fetchOperations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      if (search) params.set('search', search)
      const res = await fetch(`/api/settings/pos-operations?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: POSOperation[] = await res.json()
      setOperations(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [category, search])

  // Auto-seed if empty
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/settings/pos-operations?count=true')
        const { count } = await res.json()
        if (count === 0) {
          await fetch('/api/settings/pos-operations/seed', { method: 'POST' })
        }
      } finally {
        fetchOperations()
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchOperations()
  }, [fetchOperations])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/settings/pos-operations/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        showToast(`Seeded ${data.seeded} operations`)
        fetchOperations()
      }
    } finally {
      setSeeding(false)
    }
  }

  const handleInlineToggle = async (
    op: POSOperation,
    field: 'requiresManager' | 'allowWithoutDrawer' | 'isActive',
    value: boolean
  ) => {
    // Optimistic update
    setOperations((prev) =>
      prev.map((o) => (o.id === op.id ? { ...o, [field]: value } : o))
    )
    try {
      const res = await fetch(`/api/settings/pos-operations/${op.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error('Failed')
      const updated: POSOperation = await res.json()
      setOperations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } catch {
      // Revert on failure
      setOperations((prev) =>
        prev.map((o) => (o.id === op.id ? { ...o, [field]: !value } : o))
      )
      showToast('Failed to update — reverted')
    }
  }

  const handleDrawerSaved = (updated: POSOperation) => {
    setOperations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    showToast('Operation saved')
  }

  const categoryColor = (cat: string) => CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Other']

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-200 shadow-xl">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          {toastMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              POS Operations
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              D365 Commerce — configure operation permissions and behavior
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className={cn(
              'flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm font-medium text-zinc-300',
              'hover:bg-zinc-800 hover:text-zinc-100 transition-colors',
              seeding && 'opacity-60 cursor-not-allowed'
            )}
          >
            {seeding ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {seeding ? 'Seeding...' : 'Seed Default Operations'}
          </button>
        </div>

        {/* Category Tabs + Search */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  category === cat
                    ? 'bg-zinc-200 text-zinc-900'
                    : 'bg-zinc-800/60 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                )}
              >
                {CATEGORY_ICONS[cat]}
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or operation ID..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-zinc-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading operations...
            </div>
          ) : operations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
              <ShieldOff className="w-8 h-8" />
              <p className="text-sm">No operations found</p>
              {!search && category === 'All' && (
                <button
                  onClick={handleSeed}
                  className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
                >
                  Seed default operations
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Op ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Operation Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Manager
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      No Drawer
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Active
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Notes
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {operations.map((op) => (
                    <tr
                      key={op.id}
                      className="group hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Op ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-zinc-400">
                          {String(op.operationId).padStart(3, '0')}
                        </span>
                      </td>

                      {/* Operation Name */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-zinc-200">
                          {op.operationName}
                        </span>
                        {!op.isBuiltIn && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 uppercase tracking-wide">
                            custom
                          </span>
                        )}
                      </td>

                      {/* Category badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                            categoryColor(op.category)
                          )}
                        >
                          {CATEGORY_ICONS[op.category]}
                          {op.category}
                        </span>
                      </td>

                      {/* Manager toggle */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Toggle
                            checked={op.requiresManager}
                            onChange={(v) =>
                              handleInlineToggle(op, 'requiresManager', v)
                            }
                          />
                        </div>
                      </td>

                      {/* Allow no drawer toggle */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Toggle
                            checked={op.allowWithoutDrawer}
                            onChange={(v) =>
                              handleInlineToggle(op, 'allowWithoutDrawer', v)
                            }
                          />
                        </div>
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Toggle
                            checked={op.isActive}
                            onChange={(v) =>
                              handleInlineToggle(op, 'isActive', v)
                            }
                          />
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <span
                          className="text-xs text-zinc-500 truncate block"
                          title={op.notes ?? ''}
                        >
                          {op.notes || '—'}
                        </span>
                      </td>

                      {/* Edit button */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(op)}
                          className={cn(
                            'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                            'opacity-0 group-hover:opacity-100',
                            'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60'
                          )}
                        >
                          Edit
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && operations.length > 0 && (
          <p className="mt-3 text-xs text-zinc-600">
            {operations.length} operation{operations.length !== 1 ? 's' : ''} shown
          </p>
        )}
      </div>

      {/* Edit Drawer */}
      {selected && (
        <EditDrawer
          operation={selected}
          onClose={() => setSelected(null)}
          onSaved={handleDrawerSaved}
        />
      )}
    </div>
  )
}
