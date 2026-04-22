'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef, KeyboardEvent } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import {
  CheckCircle, FileCheck, Upload, Download, TestTube2,
  Trash2, Plus, RefreshCw, ChevronDown,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface JournalLine {
  id: string
  lineNo: number
  postingDate: string
  documentType: string
  documentNo: string
  accountType: string
  accountNo: string
  accountName: string
  description: string
  debitAmount: number
  creditAmount: number
  balAccountType: string
  balAccountNo: string
  currency: string
  status: string
}

interface Batch {
  id: string
  batchName: string
  batchType: string
  status: string
  lines: JournalLine[]
}

type EditableRow = Omit<JournalLine, 'id' | 'lineNo' | 'status' | 'accountName'> & { id?: string; _dirty?: boolean }

const BATCHES = ['GENERAL', 'CASH', 'ASSETS', 'INTERCO', 'RECURRING', 'ACCRUALS', 'DEFERRALS']

const DOC_TYPES = ['', 'Invoice', 'Credit Memo', 'Payment', 'Refund']

const ACCOUNT_TYPES = ['G/L Account', 'Customer', 'Vendor', 'Bank Account', 'Fixed Asset', 'IC Partner']

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'MXN', 'JPY']

function emptyRow(): EditableRow {
  return {
    postingDate: new Date().toISOString().slice(0, 10),
    documentType: '',
    documentNo: '',
    accountType: 'G/L Account',
    accountNo: '',
    description: '',
    debitAmount: 0,
    creditAmount: 0,
    balAccountType: 'G/L Account',
    balAccountNo: '',
    currency: 'USD',
    _dirty: false,
  }
}

const fmtAmt = (n: number) =>
  n === 0 ? '' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

// ─── Cell component ──────────────────────────────────────────────────────────

function Cell({
  children,
  className = '',
  right = false,
}: {
  children: React.ReactNode
  className?: string
  right?: boolean
}) {
  return (
    <td
      className={`border-r border-zinc-800/60 px-0 py-0 text-xs ${right ? 'text-right' : ''} ${className}`}
      style={{ minWidth: 0 }}
    >
      {children}
    </td>
  )
}

function EditCell({
  value,
  onChange,
  onTab,
  type = 'text',
  options,
  placeholder,
  right = false,
  width,
}: {
  value: string | number
  onChange: (v: string) => void
  onTab?: (e: KeyboardEvent<HTMLElement>) => void
  type?: 'text' | 'date' | 'number' | 'select'
  options?: string[]
  placeholder?: string
  right?: boolean
  width?: string
}) {
  const cls =
    `h-7 w-full bg-transparent text-xs text-zinc-100 px-2 focus:outline-none focus:bg-blue-900/30
     border-none ${right ? 'text-right' : ''}`

  if (type === 'select' && options) {
    return (
      <td
        className="border-r border-zinc-800/60 px-0 py-0"
        style={{ minWidth: 0, width }}
      >
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onTab}
          className={cls + ' cursor-pointer'}
        >
          {options.map(o => (
            <option key={o} value={o} className="bg-zinc-900">
              {o || '—'}
            </option>
          ))}
        </select>
      </td>
    )
  }

  return (
    <td
      className="border-r border-zinc-800/60 px-0 py-0"
      style={{ minWidth: 0, width }}
    >
      <input
        type={type === 'number' ? 'text' : type}
        value={value === 0 && type === 'number' ? '' : value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onTab}
        placeholder={placeholder}
        className={cls}
        inputMode={type === 'number' ? 'decimal' : undefined}
      />
    </td>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GeneralJournalEditorPage() {
  const params = useParams()
  const batchParam = params?.batch as string

  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<EditableRow[]>([emptyRow()])
  const [saving, setSaving] = useState(false)
  const [posting, setPosting] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<string>('GENERAL')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const tableRef = useRef<HTMLTableElement>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load batch ─────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/finance/journals/general?batchId=${batchParam}`)
      .then(r => r.json())
      .then(d => {
        if (d.batch) {
          setBatch(d.batch)
          setSelectedBatch(d.batch.batchName)
          const existing: EditableRow[] = d.batch.lines.map((l: JournalLine) => ({
            id: l.id,
            postingDate: l.postingDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            documentType: l.documentType ?? '',
            documentNo: l.documentNo ?? '',
            accountType: l.accountType ?? 'G/L Account',
            accountNo: l.accountNo ?? '',
            description: l.description ?? '',
            debitAmount: l.debitAmount ?? 0,
            creditAmount: l.creditAmount ?? 0,
            balAccountType: l.balAccountType ?? 'G/L Account',
            balAccountNo: l.balAccountNo ?? '',
            currency: l.currency ?? 'USD',
            _dirty: false,
          }))
          setRows(existing.length ? [...existing, emptyRow()] : [emptyRow()])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [batchParam])

  useEffect(() => { load() }, [load])

  // ── Keyboard nav ───────────────────────────────────────────────────────────
  const handleTab = useCallback(
    (rowIdx: number, colIdx: number) => (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const totalCols = 11
        const next = colIdx + (e.shiftKey ? -1 : 1)
        if (next >= totalCols) {
          // move to next row
          if (rowIdx === rows.length - 1) {
            setRows(r => [...r, emptyRow()])
          }
          setTimeout(() => {
            const tds = tableRef.current?.querySelectorAll(`tr[data-row="${rowIdx + 1}"] input, tr[data-row="${rowIdx + 1}"] select`)
            if (tds?.[0]) (tds[0] as HTMLElement).focus()
          }, 10)
        } else if (next < 0) {
          const tds = tableRef.current?.querySelectorAll(`tr[data-row="${rowIdx - 1}"] input, tr[data-row="${rowIdx - 1}"] select`)
          if (tds) (tds[tds.length - 1] as HTMLElement).focus()
        } else {
          setTimeout(() => {
            const tds = tableRef.current?.querySelectorAll(`tr[data-row="${rowIdx}"] input, tr[data-row="${rowIdx}"] select`)
            if (tds?.[next]) (tds[next] as HTMLElement).focus()
          }, 0)
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (rowIdx === rows.length - 1) {
          setRows(r => [...r, emptyRow()])
        }
        setTimeout(() => {
          const tds = tableRef.current?.querySelectorAll(`tr[data-row="${rowIdx + 1}"] input, tr[data-row="${rowIdx + 1}"] select`)
          if (tds?.[0]) (tds[0] as HTMLElement).focus()
        }, 10)
      }
    },
    [rows.length],
  )

  // ── Update row cell ────────────────────────────────────────────────────────
  const updateRow = (idx: number, field: keyof EditableRow, value: string) => {
    setRows(prev =>
      prev.map((r, i) => {
        if (i !== idx) return r
        const updated = { ...r, [field]: value, _dirty: true }
        // auto-clear opposite amount
        if (field === 'debitAmount' && value) updated.creditAmount = 0
        if (field === 'creditAmount' && value) updated.debitAmount = 0
        return updated
      }),
    )
  }

  // ── Add empty row ──────────────────────────────────────────────────────────
  const addRow = () => {
    setRows(r => [...r, emptyRow()])
    setTimeout(() => {
      const allRows = tableRef.current?.querySelectorAll('tr[data-row]')
      if (allRows) {
        const lastRow = allRows[allRows.length - 1]
        const first = lastRow.querySelector('input, select') as HTMLElement
        first?.focus()
      }
    }, 30)
  }

  // ── Delete selected rows ───────────────────────────────────────────────────
  const deleteSelected = () => {
    if (!selectedRows.size) return
    setRows(prev => prev.filter((_, i) => !selectedRows.has(i)))
    setSelectedRows(new Set())
  }

  // ── Save all dirty rows ────────────────────────────────────────────────────
  const saveLines = async () => {
    const dirty = rows.filter(r => r._dirty && (r.accountNo || r.description))
    if (!dirty.length) { notify('No unsaved changes', 'err'); return }
    setSaving(true)
    try {
      await Promise.all(
        dirty.map(r =>
          fetch('/api/finance/journals/general', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              batchId: batchParam,
              postingDate: r.postingDate,
              documentType: r.documentType || null,
              documentNo: r.documentNo || null,
              accountType: r.accountType,
              accountNo: r.accountNo || null,
              description: r.description || null,
              debitAmount: parseFloat(String(r.debitAmount)) || 0,
              creditAmount: parseFloat(String(r.creditAmount)) || 0,
              balAccountType: r.balAccountType || null,
              balAccountNo: r.balAccountNo || null,
              currency: r.currency,
            }),
          }),
        ),
      )
      notify(`${dirty.length} line(s) saved`)
      load()
    } catch {
      notify('Save failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  // ── Post journal ───────────────────────────────────────────────────────────
  const postJournal = async () => {
    if (!batch?.lines.length) { notify('No lines to post', 'err'); return }
    if (!balanced) { notify('Journal is not balanced — cannot post', 'err'); return }
    setPosting(true)
    try {
      const res = await fetch(`/api/finance/journals/general?batchId=${batchParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post' }),
      })
      if (!res.ok) throw new Error()
      notify('Journal posted successfully')
      load()
    } catch {
      notify('Posting failed', 'err')
    } finally {
      setPosting(false)
    }
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalDebit = rows.reduce((s, r) => s + (parseFloat(String(r.debitAmount)) || 0), 0)
  const totalCredit = rows.reduce((s, r) => s + (parseFloat(String(r.creditAmount)) || 0), 0)
  const difference = totalDebit - totalCredit
  const balanced = Math.abs(difference) < 0.01
  const isPosted = batch?.status === 'posted'

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="General Journal"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Journals', href: '/finance/journals/general' },
        ]}
        actions={
          !isPosted ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={saveLines}
                disabled={saving}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-40 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                <FileCheck className="w-3 h-3" /> Preview Posting
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                <Upload className="w-3 h-3" /> Import
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                <Download className="w-3 h-3" /> Export
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                <TestTube2 className="w-3 h-3" /> Test Report
              </button>
              {selectedRows.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-red-900/60 text-red-400 hover:bg-red-900 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete ({selectedRows.size})
                </button>
              )}
              <button
                onClick={postJournal}
                disabled={posting || !balanced || !(batch?.lines?.length)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          ) : (
            <span className="text-xs text-emerald-400 font-medium px-3 py-1.5 rounded bg-emerald-900/20 border border-emerald-800/40">
              Posted — Read Only
            </span>
          )
        }
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium transition-all ${
            toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Batch selector bar ── */}
        <div className="flex items-center gap-4 px-5 py-3 bg-[#0f0f1a] border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Journal Batch</label>
            <div className="relative">
              <select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                disabled={isPosted}
                className="appearance-none pl-3 pr-7 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                {BATCHES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
          </div>
          {batch && (
            <>
              <div className="text-[10px] text-zinc-600">|</div>
              <div className="text-xs text-zinc-500">
                Type: <span className="text-zinc-300">{batch.batchType}</span>
              </div>
              <div className="text-xs text-zinc-500">
                Status:{' '}
                <span className={`font-medium ${isPosted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {batch.status}
                </span>
              </div>
              <div className="text-xs text-zinc-500">
                Lines: <span className="text-zinc-300">{batch.lines?.length ?? 0}</span>
              </div>
            </>
          )}
          {!isPosted && (
            <button
              onClick={addRow}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Line
            </button>
          )}
        </div>

        {/* ── Editable grid ── */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="py-20 text-center text-sm text-zinc-500">Loading…</div>
          ) : (
            <table
              ref={tableRef}
              className="w-full text-xs border-collapse"
              style={{ minWidth: 1200 }}
            >
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#0d0e24] border-b border-zinc-700">
                  <th className="w-8 px-2 py-2.5 border-r border-zinc-800/60 text-zinc-600 font-medium"></th>
                  {[
                    'Posting Date', 'Document Type', 'Document No.', 'Account Type',
                    'Account No.', 'Description', 'Debit Amount', 'Credit Amount',
                    'Bal. Account Type', 'Bal. Account No.', 'Currency',
                  ].map(h => (
                    <th
                      key={h}
                      className="px-2 py-2.5 border-r border-zinc-800/60 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  const isLast = ri === rows.length - 1
                  const isSelected = selectedRows.has(ri)
                  return (
                    <tr
                      key={ri}
                      data-row={ri}
                      className={`border-b border-zinc-800/40 transition-colors
                        ${isSelected ? 'bg-blue-900/20' : isLast && !isPosted ? 'bg-zinc-900/20' : 'hover:bg-zinc-800/10'}
                        ${isPosted ? 'opacity-70' : ''}`}
                    >
                      <td className="w-8 px-2 py-0 border-r border-zinc-800/60 text-center">
                        {!isPosted && !isLast && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              const next = new Set(selectedRows)
                              e.target.checked ? next.add(ri) : next.delete(ri)
                              setSelectedRows(next)
                            }}
                            className="w-3 h-3 accent-blue-500"
                          />
                        )}
                      </td>
                      {isPosted ? (
                        // Read-only mode
                        <>
                          <Cell>{row.postingDate}</Cell>
                          <Cell>{row.documentType || '—'}</Cell>
                          <Cell>{row.documentNo || '—'}</Cell>
                          <Cell>{row.accountType}</Cell>
                          <Cell className="font-mono text-zinc-200">{row.accountNo || '—'}</Cell>
                          <Cell className="max-w-[180px] truncate">{row.description || '—'}</Cell>
                          <Cell right className="font-mono text-blue-300">{fmtAmt(row.debitAmount)}</Cell>
                          <Cell right className="font-mono text-amber-300">{fmtAmt(row.creditAmount)}</Cell>
                          <Cell>{row.balAccountType || '—'}</Cell>
                          <Cell className="font-mono">{row.balAccountNo || '—'}</Cell>
                          <Cell>{row.currency}</Cell>
                        </>
                      ) : (
                        // Editable mode
                        <>
                          <EditCell
                            type="date"
                            value={row.postingDate}
                            onChange={v => updateRow(ri, 'postingDate', v)}
                            onTab={handleTab(ri, 0)}
                            width="130px"
                          />
                          <EditCell
                            type="select"
                            options={DOC_TYPES}
                            value={row.documentType}
                            onChange={v => updateRow(ri, 'documentType', v)}
                            onTab={handleTab(ri, 1)}
                            width="110px"
                          />
                          <EditCell
                            value={row.documentNo}
                            onChange={v => updateRow(ri, 'documentNo', v)}
                            onTab={handleTab(ri, 2)}
                            placeholder="DOC-001"
                            width="100px"
                          />
                          <EditCell
                            type="select"
                            options={ACCOUNT_TYPES}
                            value={row.accountType}
                            onChange={v => updateRow(ri, 'accountType', v)}
                            onTab={handleTab(ri, 3)}
                            width="120px"
                          />
                          <EditCell
                            value={row.accountNo}
                            onChange={v => updateRow(ri, 'accountNo', v)}
                            onTab={handleTab(ri, 4)}
                            placeholder="1000"
                            width="90px"
                          />
                          <EditCell
                            value={row.description}
                            onChange={v => updateRow(ri, 'description', v)}
                            onTab={handleTab(ri, 5)}
                            placeholder="Description"
                            width="200px"
                          />
                          <EditCell
                            type="number"
                            value={row.debitAmount}
                            onChange={v => updateRow(ri, 'debitAmount', v)}
                            onTab={handleTab(ri, 6)}
                            placeholder="0.00"
                            right
                            width="100px"
                          />
                          <EditCell
                            type="number"
                            value={row.creditAmount}
                            onChange={v => updateRow(ri, 'creditAmount', v)}
                            onTab={handleTab(ri, 7)}
                            placeholder="0.00"
                            right
                            width="100px"
                          />
                          <EditCell
                            type="select"
                            options={ACCOUNT_TYPES}
                            value={row.balAccountType}
                            onChange={v => updateRow(ri, 'balAccountType', v)}
                            onTab={handleTab(ri, 8)}
                            width="120px"
                          />
                          <EditCell
                            value={row.balAccountNo}
                            onChange={v => updateRow(ri, 'balAccountNo', v)}
                            onTab={handleTab(ri, 9)}
                            placeholder="2000"
                            width="90px"
                          />
                          <EditCell
                            type="select"
                            options={CURRENCIES}
                            value={row.currency}
                            onChange={v => updateRow(ri, 'currency', v)}
                            onTab={handleTab(ri, 10)}
                            width="70px"
                          />
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Balance footer ── */}
        <div className="border-t border-zinc-800/60 bg-[#0d0e24] px-5 py-3 flex items-center gap-8">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Total Debit</span>
            <span className="font-mono font-bold text-blue-300 tabular-nums">{fmtCurr(totalDebit)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Total Credit</span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">{fmtCurr(totalCredit)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Difference</span>
            <span
              className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded ${
                balanced
                  ? 'text-emerald-400 bg-emerald-900/20'
                  : 'text-red-400 bg-red-900/20'
              }`}
            >
              {fmtCurr(Math.abs(difference))}
            </span>
          </div>
          {!balanced && (
            <span className="text-[11px] text-red-400">Journal is out of balance — debit and credit must be equal to post.</span>
          )}
          {balanced && (batch?.lines?.length ?? 0) > 0 && (
            <span className="text-[11px] text-emerald-400">Balanced — ready to post.</span>
          )}
        </div>
      </div>
    </div>
  )
}
