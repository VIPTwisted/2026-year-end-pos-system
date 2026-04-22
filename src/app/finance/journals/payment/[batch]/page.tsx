'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef, KeyboardEvent } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import {
  CheckCircle, Plus, Trash2, RefreshCw, Wand2, ChevronDown,
  FileCheck, Download,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaymentLine {
  id: string
  lineNo: number
  postingDate: string
  documentType: string
  accountType: string
  accountNo: string | null
  accountName: string | null
  appliesToDocType: string | null
  appliesToDocNo: string | null
  description: string | null
  amount: number
  balAccountType: string
  balAccountNo: string | null
  currencyCode: string
  status: string
}

interface Batch {
  id: string
  batchName: string
  batchType: string
  status: string
  lines: PaymentLine[]
}

type EditRow = {
  id?: string
  postingDate: string
  documentType: string
  documentNo: string
  accountType: string
  accountNo: string
  vendorName: string
  externalDocNo: string
  description: string
  amount: number | string
  dueDate: string
  appliesToDocType: string
  appliesToDocNo: string
  balAccountType: string
  balAccountNo: string
  currency: string
  _dirty?: boolean
}

const PAYMENT_BATCHES = ['PAYMENTS', 'PAYJNL', 'VENDOR-PAY', 'EFT']
const DOC_TYPES = ['Payment', 'Refund', '']
const ACCOUNT_TYPES = ['Vendor', 'Customer', 'G/L Account', 'Bank Account']
const BAL_TYPES = ['Bank Account', 'G/L Account']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'MXN']
const APPLIES_TYPES = ['Invoice', 'Credit Memo', '']

function emptyRow(): EditRow {
  return {
    postingDate: new Date().toISOString().slice(0, 10),
    documentType: 'Payment',
    documentNo: '',
    accountType: 'Vendor',
    accountNo: '',
    vendorName: '',
    externalDocNo: '',
    description: '',
    amount: 0,
    dueDate: '',
    appliesToDocType: 'Invoice',
    appliesToDocNo: '',
    balAccountType: 'Bank Account',
    balAccountNo: '',
    currency: 'USD',
    _dirty: false,
  }
}

const fmtAmt = (n: number | string = 0) => {
  const num = parseFloat(String(n))
  return num === 0 ? '' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const fmtCurr = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

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
  value: string | number | undefined
  onChange: (v: string) => void
  onTab?: (e: KeyboardEvent<HTMLElement>) => void
  type?: 'text' | 'date' | 'number' | 'select'
  options?: string[]
  placeholder?: string
  right?: boolean
  width?: string
}) {
  const cls = `h-7 w-full bg-transparent text-xs text-zinc-100 px-2 focus:outline-none focus:bg-blue-900/30 border-none ${right ? 'text-right' : ''}`
  if (type === 'select' && options) {
    return (
      <td className="border-r border-zinc-800/60 px-0 py-0" style={{ width }}>
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} onKeyDown={onTab} className={cls + ' cursor-pointer'}>
          {options.map(o => <option key={o} value={o} className="bg-zinc-900">{o || '—'}</option>)}
        </select>
      </td>
    )
  }
  return (
    <td className="border-r border-zinc-800/60 px-0 py-0" style={{ width }}>
      <input
        type={type === 'number' ? 'text' : type}
        value={type === 'number' && (!value || value === 0) ? '' : value ?? ''}
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

export default function PaymentJournalEditorPage() {
  const params = useParams()
  const batchId = params?.batch as string

  const [batch, setBatch] = useState<Batch | null>(null)
  const [rows, setRows] = useState<EditRow[]>([emptyRow()])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [posting, setPosting] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState('PAYMENTS')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/finance/journals/payment?batchId=${batchId}`)
      .then(r => r.json())
      .then(d => {
        if (d.batch) {
          setBatch(d.batch)
          setSelectedBatch(d.batch.batchName)
          const existing: EditRow[] = d.batch.lines.map((l: PaymentLine) => ({
            id: l.id,
            postingDate: l.postingDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            documentType: l.documentType ?? 'Payment',
            documentNo: '',
            accountType: l.accountType ?? 'Vendor',
            accountNo: l.accountNo ?? '',
            vendorName: l.accountName ?? '',
            externalDocNo: '',
            description: l.description ?? '',
            amount: l.amount,
            dueDate: '',
            appliesToDocType: l.appliesToDocType ?? 'Invoice',
            appliesToDocNo: l.appliesToDocNo ?? '',
            balAccountType: l.balAccountType ?? 'Bank Account',
            balAccountNo: l.balAccountNo ?? '',
            currency: l.currencyCode ?? 'USD',
            _dirty: false,
          }))
          setRows(existing.length ? [...existing, emptyRow()] : [emptyRow()])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [batchId])

  useEffect(() => { load() }, [load])

  const totalPayments = rows.reduce((s, r) => s + (parseFloat(String(r.amount)) || 0), 0)
  const isPosted = batch?.status === 'posted'

  const updateRow = (idx: number, field: keyof EditRow, value: string) => {
    setRows(prev => prev.map((r, i) => i !== idx ? r : { ...r, [field]: value, _dirty: true }))
  }

  const TOTAL_COLS = 13
  const handleTab = useCallback(
    (ri: number, ci: number) => (e: KeyboardEvent<HTMLElement>) => {
      if (e.key !== 'Tab' && e.key !== 'Enter') return
      e.preventDefault()
      const next = ci + (e.shiftKey ? -1 : 1)
      const nextRi = e.key === 'Enter' ? ri + 1 : ri
      if (next >= TOTAL_COLS || e.key === 'Enter') {
        if (ri === rows.length - 1) setRows(r => [...r, emptyRow()])
        setTimeout(() => {
          const tds = tableRef.current?.querySelectorAll(`tr[data-row="${nextRi}"] input, tr[data-row="${nextRi}"] select`)
          if (tds?.[0]) (tds[0] as HTMLElement).focus()
        }, 10)
      } else if (next < 0) {
        const tds = tableRef.current?.querySelectorAll(`tr[data-row="${ri - 1}"] input, tr[data-row="${ri - 1}"] select`)
        if (tds) (tds[tds.length - 1] as HTMLElement).focus()
      } else {
        setTimeout(() => {
          const tds = tableRef.current?.querySelectorAll(`tr[data-row="${ri}"] input, tr[data-row="${ri}"] select`)
          if (tds?.[next]) (tds[next] as HTMLElement).focus()
        }, 0)
      }
    },
    [rows.length],
  )

  const saveLines = async () => {
    const dirty = rows.filter(r => r._dirty && (r.accountNo || r.description))
    if (!dirty.length) { notify('No changes to save', 'err'); return }
    setSaving(true)
    try {
      await Promise.all(
        dirty.map(r =>
          fetch('/api/finance/journals/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              batchId,
              postingDate: r.postingDate,
              documentType: r.documentType,
              accountType: r.accountType,
              accountNo: r.accountNo,
              description: r.description,
              amount: parseFloat(String(r.amount)) || 0,
              appliesToDocType: r.appliesToDocType,
              appliesToDocNo: r.appliesToDocNo,
              balAccountType: r.balAccountType,
              balAccountNo: r.balAccountNo,
              currencyCode: r.currency,
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

  const postJournal = async () => {
    if (!batch?.lines.length) { notify('No lines to post', 'err'); return }
    setPosting(true)
    try {
      const res = await fetch(`/api/finance/journals/payment?batchId=${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post' }),
      })
      if (!res.ok) throw new Error()
      notify('Payment journal posted')
      load()
    } catch {
      notify('Post failed', 'err')
    } finally {
      setPosting(false)
    }
  }

  const suggestVendorPayments = () => {
    const today = new Date().toISOString().slice(0, 10)
    const suggestions: EditRow[] = [
      { postingDate: today, documentType: 'Payment', documentNo: '', accountType: 'Vendor', accountNo: 'V-001', vendorName: 'Acme Supplies', externalDocNo: '', description: 'Payment to Acme Supplies', amount: 5250.00, dueDate: today, appliesToDocType: 'Invoice', appliesToDocNo: 'INV-2026-001', balAccountType: 'Bank Account', balAccountNo: 'BANK-MAIN', currency: 'USD', _dirty: true },
      { postingDate: today, documentType: 'Payment', documentNo: '', accountType: 'Vendor', accountNo: 'V-002', vendorName: 'Global Freight LLC', externalDocNo: '', description: 'Payment to Global Freight', amount: 1800.00, dueDate: today, appliesToDocType: 'Invoice', appliesToDocNo: 'INV-2026-042', balAccountType: 'Bank Account', balAccountNo: 'BANK-MAIN', currency: 'USD', _dirty: true },
    ]
    setRows([...suggestions, emptyRow()])
    notify('2 vendor payment suggestions loaded')
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Payment Journal"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Journals', href: '/finance/journals/payment' },
        ]}
        actions={
          !isPosted ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={suggestVendorPayments} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-violet-700/40 text-violet-300 border border-violet-700/40 hover:bg-violet-700/60 transition-colors">
                <Wand2 className="w-3 h-3" /> Suggest Vendor Payments
              </button>
              <button onClick={saveLines} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-40 transition-colors">
                <RefreshCw className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                <FileCheck className="w-3 h-3" /> Preview
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                <Download className="w-3 h-3" /> Export
              </button>
              {selectedRows.size > 0 && (
                <button onClick={() => { setRows(r => r.filter((_, i) => !selectedRows.has(i))); setSelectedRows(new Set()) }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-red-900/60 text-red-400 hover:bg-red-900 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete ({selectedRows.size})
                </button>
              )}
              <button onClick={postJournal} disabled={posting || !batch?.lines?.length}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                <CheckCircle className="w-3 h-3" /> {posting ? 'Posting…' : 'Post'}
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
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Batch selector bar */}
        <div className="flex items-center gap-4 px-5 py-3 bg-[#0f0f1a] border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Batch</label>
            <div className="relative">
              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} disabled={isPosted}
                className="appearance-none pl-3 pr-7 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                {PAYMENT_BATCHES.map(b => <option key={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
          </div>
          {batch && (
            <div className="text-xs text-zinc-500">
              Lines: <span className="text-zinc-300">{batch.lines?.length ?? 0}</span>
              <span className="mx-2 text-zinc-700">|</span>
              Status: <span className={`font-medium ${isPosted ? 'text-emerald-400' : 'text-amber-400'}`}>{batch.status}</span>
            </div>
          )}
          {!isPosted && (
            <button onClick={() => setRows(r => [...r, emptyRow()])}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors">
              <Plus className="w-3 h-3" /> Add Line
            </button>
          )}
        </div>

        {/* Editable grid */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="py-20 text-center text-sm text-zinc-500">Loading…</div>
          ) : (
            <table ref={tableRef} className="w-full text-xs border-collapse" style={{ minWidth: 1400 }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#0d0e24] border-b border-zinc-700">
                  <th className="w-8 px-2 py-2.5 border-r border-zinc-800/60" />
                  {['Posting Date', 'Doc Type', 'Account Type', 'Account No.', 'Vendor Name', 'Ext. Doc No.', 'Description', 'Amount', 'Due Date', 'Applies-to Type', 'Applies-to No.', 'Bal. Acct Type', 'Currency'].map(h => (
                    <th key={h} className="px-2 py-2.5 border-r border-zinc-800/60 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  const isSelected = selectedRows.has(ri)
                  const isLast = ri === rows.length - 1
                  return (
                    <tr key={ri} data-row={ri}
                      className={`border-b border-zinc-800/40 transition-colors ${isSelected ? 'bg-blue-900/20' : isLast && !isPosted ? 'bg-zinc-900/20' : 'hover:bg-zinc-800/10'}`}>
                      <td className="w-8 px-2 py-0 border-r border-zinc-800/60 text-center">
                        {!isPosted && !isLast && (
                          <input type="checkbox" checked={isSelected}
                            onChange={e => { const n = new Set(selectedRows); e.target.checked ? n.add(ri) : n.delete(ri); setSelectedRows(n) }}
                            className="w-3 h-3 accent-blue-500" />
                        )}
                      </td>
                      {isPosted ? (
                        <>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.postingDate}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.documentType}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.accountType}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 font-mono text-zinc-200">{row.accountNo || '—'}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.vendorName || '—'}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 font-mono text-zinc-400">{row.externalDocNo || '—'}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400 max-w-[160px] truncate">{row.description || '—'}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 font-mono text-right text-blue-300">{fmtAmt(row.amount)}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.dueDate || '—'}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.appliesToDocType || '—'}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 font-mono text-zinc-400">{row.appliesToDocNo || '—'}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.balAccountType}</td>
                          <td className="border-r border-zinc-800/60 px-2 py-1.5 text-zinc-400">{row.currency}</td>
                        </>
                      ) : (
                        <>
                          <EditCell type="date" value={row.postingDate} onChange={v => updateRow(ri, 'postingDate', v)} onTab={handleTab(ri, 0)} width="130px" />
                          <EditCell type="select" options={DOC_TYPES} value={row.documentType} onChange={v => updateRow(ri, 'documentType', v)} onTab={handleTab(ri, 1)} width="100px" />
                          <EditCell type="select" options={ACCOUNT_TYPES} value={row.accountType} onChange={v => updateRow(ri, 'accountType', v)} onTab={handleTab(ri, 2)} width="110px" />
                          <EditCell value={row.accountNo} onChange={v => updateRow(ri, 'accountNo', v)} onTab={handleTab(ri, 3)} placeholder="V-001" width="90px" />
                          <EditCell value={row.vendorName} onChange={v => updateRow(ri, 'vendorName', v)} onTab={handleTab(ri, 4)} placeholder="Vendor name" width="140px" />
                          <EditCell value={row.externalDocNo} onChange={v => updateRow(ri, 'externalDocNo', v)} onTab={handleTab(ri, 5)} placeholder="EXT-001" width="90px" />
                          <EditCell value={row.description} onChange={v => updateRow(ri, 'description', v)} onTab={handleTab(ri, 6)} placeholder="Description" width="180px" />
                          <EditCell type="number" value={row.amount} onChange={v => updateRow(ri, 'amount', v)} onTab={handleTab(ri, 7)} placeholder="0.00" right width="100px" />
                          <EditCell type="date" value={row.dueDate} onChange={v => updateRow(ri, 'dueDate', v)} onTab={handleTab(ri, 8)} width="120px" />
                          <EditCell type="select" options={APPLIES_TYPES} value={row.appliesToDocType} onChange={v => updateRow(ri, 'appliesToDocType', v)} onTab={handleTab(ri, 9)} width="110px" />
                          <EditCell value={row.appliesToDocNo} onChange={v => updateRow(ri, 'appliesToDocNo', v)} onTab={handleTab(ri, 10)} placeholder="INV-001" width="90px" />
                          <EditCell type="select" options={BAL_TYPES} value={row.balAccountType} onChange={v => updateRow(ri, 'balAccountType', v)} onTab={handleTab(ri, 11)} width="120px" />
                          <EditCell type="select" options={CURRENCIES} value={row.currency} onChange={v => updateRow(ri, 'currency', v)} onTab={handleTab(ri, 12)} width="70px" />
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer summary */}
        <div className="border-t border-zinc-800/60 bg-[#0d0e24] px-5 py-3 flex items-center gap-8">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Total Payments</span>
            <span className="font-mono font-bold text-blue-300 tabular-nums">{fmtCurr(totalPayments)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Lines</span>
            <span className="font-mono text-zinc-300">{rows.filter(r => r.accountNo || r.description).length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
