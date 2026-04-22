'use client'

/**
 * Physical Inventory Count Detail
 * Route: /inventory/physical-count/[id]/
 *
 * Editable count entry table: expected qty, counted qty, variance, variance amount.
 * Post action finalizes and adjusts inventory.
 *
 * Data: /api/inventory/counts/[id] (existing, working endpoint)
 * TODO: Migrate to /api/inventory/physical-count/[id] once PhysicalCount model is expanded.
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Loader2, CheckCircle2, AlertTriangle,
  ClipboardCheck, Save, Play, SendHorizonal,
} from 'lucide-react'

interface Product   { id: string; name: string; sku: string }
interface CountLine {
  id: string; countId: string; productId: string
  systemQty: number; countedQty: number | null; variance: number | null; notes: string | null
  product: Product
}
interface StoreInfo { id: string; name: string }
interface PhysicalCount {
  id: string; countNumber: string; storeId: string; status: string
  notes: string | null; postedAt: string | null; createdAt: string
  store: StoreInfo; lines: CountLine[]
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:       'bg-zinc-700/60 text-zinc-400',
    in_progress: 'bg-amber-500/10 text-amber-400',
    completed:   'bg-blue-500/10 text-blue-400',
    posted:      'bg-emerald-500/10 text-emerald-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${map[status] ?? 'bg-zinc-700/60 text-zinc-400'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default function PhysicalCountDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()

  const [count,    setCount]    = useState<PhysicalCount | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [toast,    setToast]    = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [posting,  setPosting]  = useState(false)
  const [edits,    setEdits]    = useState<Record<string, { countedQty: string; notes: string }>>({})

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/inventory/counts/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json() as PhysicalCount
      setCount(data)
      const init: Record<string, { countedQty: string; notes: string }> = {}
      for (const l of data.lines) {
        init[l.id] = { countedQty: l.countedQty !== null ? String(l.countedQty) : '', notes: l.notes ?? '' }
      }
      setEdits(init)
    } catch {
      setError('Failed to load count')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadCount() }, [loadCount])

  const handleStatusChange = async (newStatus: string) => {
    if (!count) return
    const res = await fetch(`/api/inventory/counts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) { notify('Failed to update status', 'err'); return }
    const updated = await res.json() as PhysicalCount
    setCount(updated)
    notify(`Count ${newStatus.replace('_', ' ')}`)
  }

  const buildLinePayload = () =>
    (count?.lines ?? [])
      .filter(l => (edits[l.id]?.countedQty ?? '') !== '')
      .map(l => ({
        id:         l.id,
        countedQty: parseInt(edits[l.id]?.countedQty ?? '0', 10),
        notes:      edits[l.id]?.notes || undefined,
      }))
      .filter(l => !isNaN(l.countedQty))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/inventory/counts/${id}/lines`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: buildLinePayload() }),
      })
      if (!res.ok) { notify('Save failed', 'err'); return }
      await loadCount()
      notify('Progress saved')
    } catch { notify('Save failed', 'err') }
    finally { setSaving(false) }
  }

  const handlePost = async () => {
    setPosting(true)
    try {
      const payload = buildLinePayload()
      if (payload.length > 0) {
        const saveRes = await fetch(`/api/inventory/counts/${id}/lines`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lines: payload }),
        })
        if (!saveRes.ok) throw new Error('Failed to save lines before posting')
      }
      const res = await fetch(`/api/inventory/counts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'posted' }),
      })
      if (!res.ok) { const d = await res.json() as { error?: string }; throw new Error(d.error ?? 'Post failed') }
      const updated = await res.json() as PhysicalCount
      setCount(updated)
      notify('Count posted — inventory updated')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Post failed', 'err')
    } finally { setPosting(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[100dvh] bg-[#0f0f1a]"><Loader2 className="w-6 h-6 text-zinc-500 animate-spin" /></div>
  if (error || !count) return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#0f0f1a]">
      <p className="text-red-400 text-sm">{error ?? 'Count not found'}</p>
      <Link href="/inventory/physical-count" className="mt-4 text-blue-400 text-sm hover:underline">Back to Counts</Link>
    </div>
  )

  const isEditable  = count.status !== 'posted'
  const totalLines  = count.lines.length
  const countedSoFar = count.lines.filter(l => l.countedQty !== null).length
  const variances   = count.lines.filter(l => l.variance !== null && l.variance !== 0).length
  const allCounted  = countedSoFar === totalLines && totalLines > 0

  const sortedLines = [...count.lines].sort((a, b) => {
    if (a.countedQty === null && b.countedQty !== null) return -1
    if (a.countedQty !== null && b.countedQty === null) return 1
    return a.product.name.localeCompare(b.product.name)
  })

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/40' : 'bg-red-500/20 text-red-300 border border-red-600/40'
        }`}>{toast.msg}</div>
      )}

      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link href="/inventory/physical-count" className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          <ChevronLeft className="w-4 h-4" />Counts
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-zinc-100 font-mono">{count.countNumber}</h1>
          <StatusBadge status={count.status} />
        </div>
        <div className="ml-auto flex items-center gap-3">
          {count.status === 'draft' && (
            <button onClick={() => handleStatusChange('in_progress')} className="flex items-center gap-2 px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors">
              <Play className="w-3.5 h-3.5" />Start Count
            </button>
          )}
          {count.status === 'in_progress' && (
            <>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-1.5 rounded border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : 'Save Progress'}
              </button>
              {allCounted && (
                <button onClick={handlePost} disabled={posting} className="flex items-center gap-2 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                  {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SendHorizonal className="w-3.5 h-3.5" />}
                  {posting ? 'Posting…' : 'Post Count'}
                </button>
              )}
            </>
          )}
          {count.status === 'posted' && count.postedAt && (
            <span className="text-xs text-zinc-500">Posted {new Date(count.postedAt).toLocaleString()}</span>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Store</div><div className="text-zinc-100">{count.store.name}</div></div>
              <div><div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Created</div><div className="text-zinc-100">{new Date(count.createdAt).toLocaleDateString()}</div></div>
              <div><div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Status</div><StatusBadge status={count.status} /></div>
              {count.notes && <div><div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Notes</div><div className="text-zinc-300">{count.notes}</div></div>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'TOTAL PRODUCTS', value: totalLines,   color: 'text-zinc-100' },
              { label: 'COUNTED SO FAR', value: countedSoFar, color: 'text-blue-400', sub: `${totalLines > 0 ? Math.round((countedSoFar / totalLines) * 100) : 0}% complete` },
              { label: 'VARIANCES FOUND', value: variances,   color: variances > 0 ? 'text-amber-400' : 'text-emerald-400', sub: 'Lines with discrepancy' },
            ].map(s => (
              <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                {s.sub && <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full">
              <thead className="bg-[#16213e] border-b border-zinc-800">
                <tr>
                  {['Product', 'SKU', 'Expected Qty', 'Counted Qty', 'Variance', 'Variance Amt', 'Notes'].map((h, i) => (
                    <th key={h} className={`text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-3 px-4 ${
                      i >= 2 && i <= 5 ? 'text-right' : 'text-left'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#16213e]">
                {sortedLines.map(line => {
                  const editState   = edits[line.id] ?? { countedQty: '', notes: '' }
                  const parsedQty   = editState.countedQty !== '' ? parseInt(editState.countedQty, 10) : null
                  const displayVar  = parsedQty !== null && !isNaN(parsedQty) ? parsedQty - line.systemQty : line.variance
                  // Variance amount: variance × system unit cost — system unit cost not available on this model,
                  // so we display unit variance only. TODO: multiply by product.cost once model has it.
                  const isUncounted = line.countedQty === null && editState.countedQty === ''

                  return (
                    <tr key={line.id} className={`border-t border-zinc-800 hover:bg-zinc-800/20 transition-colors ${isUncounted && count.status === 'in_progress' ? 'bg-zinc-900/30' : ''}`}>
                      <td className="py-2.5 px-4">
                        <div className="text-sm font-medium text-zinc-100">{line.product.name}</div>
                        {isUncounted && count.status === 'in_progress' && <div className="text-[11px] text-amber-400/70 mt-0.5">Not counted yet</div>}
                      </td>
                      <td className="py-2.5 px-4 text-sm font-mono text-zinc-500">{line.product.sku}</td>
                      <td className="py-2.5 px-4 text-sm text-right tabular-nums font-semibold text-zinc-100">{line.systemQty}</td>
                      <td className="py-2.5 px-4 text-right">
                        {isEditable ? (
                          <input
                            type="number" min="0"
                            value={editState.countedQty}
                            onChange={e => setEdits(prev => ({ ...prev, [line.id]: { ...prev[line.id], countedQty: e.target.value } }))}
                            placeholder="—"
                            className="w-20 h-8 px-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 text-right tabular-nums focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-sm tabular-nums text-zinc-100">{line.countedQty ?? '—'}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {displayVar !== null ? (
                          <span className={`text-sm font-semibold tabular-nums ${displayVar > 0 ? 'text-emerald-400' : displayVar < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                            {displayVar > 0 ? `+${displayVar}` : displayVar}
                          </span>
                        ) : <span className="text-zinc-600 text-sm">—</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right text-xs text-zinc-600">
                        {/* TODO: multiply variance × product.costPrice once model is expanded */}
                        {displayVar !== null && displayVar !== 0 ? <span className="text-amber-500/70">—</span> : <span>—</span>}
                      </td>
                      <td className="py-2.5 px-4">
                        {isEditable ? (
                          <input
                            type="text"
                            value={editState.notes}
                            onChange={e => setEdits(prev => ({ ...prev, [line.id]: { ...prev[line.id], notes: e.target.value } }))}
                            placeholder="Optional…"
                            className="w-full h-8 px-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                          />
                        ) : <span className="text-sm text-zinc-400">{line.notes ?? '—'}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {count.lines.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-[#16213e]">
                <ClipboardCheck className="w-8 h-8 text-zinc-700 mb-2" />
                <p className="text-sm text-zinc-500">No lines — no active inventory found for this store</p>
              </div>
            )}
          </div>

          {isEditable && count.status === 'in_progress' && count.lines.length > 0 && (
            <div className="flex items-center justify-between bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                {allCounted ? (
                  <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 font-medium">All products counted — ready to post</span></>
                ) : (
                  <><AlertTriangle className="w-4 h-4 text-amber-400" /><span>{totalLines - countedSoFar} product{totalLines - countedSoFar !== 1 ? 's' : ''} remaining</span></>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? 'Saving…' : 'Save Progress'}
                </button>
                {allCounted && (
                  <button onClick={handlePost} disabled={posting} className="flex items-center gap-2 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SendHorizonal className="w-3.5 h-3.5" />}
                    {posting ? 'Posting…' : 'Post Count'}
                  </button>
                )}
              </div>
            </div>
          )}

          {count.status === 'posted' && (
            <div className="flex items-center gap-3 px-5 py-4 bg-emerald-950/20 rounded-lg border border-emerald-800/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Count Posted</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Inventory quantities updated · {variances} adjustment{variances !== 1 ? 's' : ''} applied
                  {count.postedAt ? ` · ${new Date(count.postedAt).toLocaleString()}` : ''}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
