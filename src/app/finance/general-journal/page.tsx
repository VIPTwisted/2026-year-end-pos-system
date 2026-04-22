'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const THEME = {
  bg: '#0d0e24',
  card: '#16213e',
  border: 'rgba(99,102,241,0.15)',
  accent: 'rgba(99,102,241,0.3)',
  text: '#e2e8f0',
  muted: '#94a3b8',
}

const JOURNAL_TYPES = [
  { label: 'General journal', active: true },
  { label: 'Vendor invoice journal' },
  { label: 'Customer payment journal' },
  { label: 'Project expense journal' },
  { label: 'Fixed asset journal' },
  { label: 'Periodic journals' },
]

const BATCHES = [
  { name: 'GJ-2026-041', desc: 'April Accruals', lines: 24, status: 'Draft', postedBy: 'Alice Chen', modified: 'Apr 22' },
  { name: 'GJ-2026-040', desc: 'Depreciation Run', lines: 12, status: 'Pending Approval', postedBy: 'System', modified: 'Apr 21' },
  { name: 'GJ-2026-039', desc: 'Intercompany Reclass', lines: 8, status: 'Posted', postedBy: 'Bob Wilson', modified: 'Apr 20' },
  { name: 'GJ-2026-038', desc: 'Month-End Accruals', lines: 36, status: 'Posted', postedBy: 'Alice Chen', modified: 'Apr 19' },
  { name: 'GJ-2026-037', desc: 'Payroll Allocation', lines: 18, status: 'Posted', postedBy: 'HR System', modified: 'Apr 18' },
  { name: 'GJ-2026-036', desc: 'Tax Provisions Q1', lines: 6, status: 'Rejected', postedBy: 'Carlos M.', modified: 'Apr 17' },
  { name: 'GJ-2026-035', desc: 'Prepaid Amortization', lines: 9, status: 'Posted', postedBy: 'Alice Chen', modified: 'Apr 16' },
  { name: 'GJ-2026-034', desc: 'FX Revaluation', lines: 14, status: 'Posted', postedBy: 'System', modified: 'Apr 15' },
]

const JOURNAL_LINES = [
  { line: 1, accType: 'Ledger', accNo: '1100', accName: 'Cash & Equivalents', debit: '$12,000.00', credit: '', desc: 'April accrual entry', dim: 'CC-001' },
  { line: 2, accType: 'Ledger', accNo: '6200', accName: 'Accrued Expenses', debit: '', credit: '$12,000.00', desc: 'April accrual offset', dim: 'CC-001' },
  { line: 3, accType: 'Ledger', accNo: '5100', accName: 'Cost of Goods Sold', debit: '$8,320.00', credit: '', desc: 'COGS accrual Apr', dim: 'CC-002' },
  { line: 4, accType: 'Ledger', accNo: '2100', accName: 'Accounts Payable', debit: '', credit: '$8,320.00', desc: 'AP accrual Apr', dim: 'CC-002' },
  { line: 5, accType: 'Ledger', accNo: '7300', accName: 'Rent Expense', debit: '$6,500.00', credit: '', desc: 'April rent accrual', dim: 'CC-001' },
  { line: 6, accType: 'Ledger', accNo: '2300', accName: 'Accrued Liabilities', debit: '', credit: '$6,500.00', desc: 'Rent accrual offset', dim: 'CC-001' },
  { line: 7, accType: 'Ledger', accNo: '7200', accName: 'Utilities Expense', debit: '$4,200.00', credit: '', desc: 'Utilities accrual', dim: 'CC-003' },
  { line: 8, accType: 'Ledger', accNo: '2300', accName: 'Accrued Liabilities', debit: '', credit: '$4,200.00', desc: 'Utilities offset', dim: 'CC-003' },
]

function batchStatusChip(s: string) {
  const map: Record<string, { bg: string; color: string }> = {
    'Draft': { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
    'Pending Approval': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    'Posted': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
    'Rejected': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  }
  const c = map[s] ?? { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
  return (
    <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
      {s}
    </span>
  )
}

export default function GeneralJournalPage() {
  const [selectedBatch, setSelectedBatch] = useState(BATCHES[0])
  const [, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/finance/general-journal').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'var(--font-geist-sans, system-ui)' }}>
      <TopBar
        title="General Journal"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'General Journal', href: '/finance/general-journal' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.9)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Journal</button>
            <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Post</button>
            <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Approve</button>
            <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Simulate</button>
          </>
        }
      />
      <div style={{ display: 'flex', height: 'calc(100dvh - 80px)' }}>

        {/* Left Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, background: THEME.card, borderRight: `1px solid ${THEME.border}`, padding: '16px 0', overflowY: 'auto' }}>
          <div style={{ padding: '0 12px 12px', fontSize: 11, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Journal Types</div>
          {JOURNAL_TYPES.map(t => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center',
              padding: '9px 16px', cursor: 'pointer', fontSize: 13,
              background: t.active ? THEME.accent : 'transparent',
              borderLeft: t.active ? '2px solid #6366f1' : '2px solid transparent',
              color: t.active ? THEME.text : THEME.muted,
            }}>
              {t.label}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Journal Batches Table */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${THEME.border}`, fontSize: 13, fontWeight: 600 }}>Journal Batches</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                    {['Batch Name', 'Description', 'Lines', 'Status', 'Posted By', 'Last Modified'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Lines' ? 'right' : 'left', color: THEME.muted, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: `1px solid ${THEME.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BATCHES.map((b, i) => (
                    <tr key={b.name} onClick={() => setSelectedBatch(b)} style={{
                      cursor: 'pointer',
                      background: selectedBatch.name === b.name ? 'rgba(99,102,241,0.08)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      borderBottom: `1px solid ${THEME.border}`,
                    }}>
                      <td style={{ padding: '10px 14px', color: '#818cf8', fontWeight: 600, fontFamily: 'monospace' }}>{b.name}</td>
                      <td style={{ padding: '10px 14px', color: THEME.text }}>{b.desc}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: THEME.muted, fontFamily: 'monospace' }}>{b.lines}</td>
                      <td style={{ padding: '10px 14px' }}>{batchStatusChip(b.status)}</td>
                      <td style={{ padding: '10px 14px', color: THEME.muted }}>{b.postedBy}</td>
                      <td style={{ padding: '10px 14px', color: THEME.muted }}>{b.modified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Journal Lines (expanded for selected batch) */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Journal Lines — </span>
                <span style={{ fontSize: 13, color: '#818cf8', fontFamily: 'monospace' }}>{selectedBatch.name}</span>
                <span style={{ fontSize: 12, color: THEME.muted, marginLeft: 8 }}>{selectedBatch.desc}</span>
              </div>
              <span style={{ fontSize: 12, color: THEME.muted }}>Showing 8 of {selectedBatch.lines} lines</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                    {['Line', 'Account Type', 'Account No.', 'Account Name', 'Debit', 'Credit', 'Description', 'Dimension'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: (i === 4 || i === 5) ? 'right' : 'left', color: THEME.muted, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: `1px solid ${THEME.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {JOURNAL_LINES.map((l, i) => (
                    <tr key={l.line} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: '9px 14px', color: THEME.muted, fontFamily: 'monospace' }}>{l.line}</td>
                      <td style={{ padding: '9px 14px', color: THEME.muted }}>{l.accType}</td>
                      <td style={{ padding: '9px 14px', color: '#818cf8', fontFamily: 'monospace', fontWeight: 600 }}>{l.accNo}</td>
                      <td style={{ padding: '9px 14px', color: THEME.text }}>{l.accName}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#34d399', fontFamily: 'monospace', fontWeight: 600 }}>{l.debit}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#f59e0b', fontFamily: 'monospace', fontWeight: 600 }}>{l.credit}</td>
                      <td style={{ padding: '9px 14px', color: THEME.muted }}>{l.desc}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '2px 7px', borderRadius: 4, fontSize: 11 }}>{l.dim}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'rgba(99,102,241,0.05)', borderTop: `1px solid ${THEME.border}` }}>
                    <td colSpan={4} style={{ padding: '10px 14px', fontSize: 12, color: THEME.muted, fontWeight: 600 }}>Totals</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>$31,020.00</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>$31,020.00</td>
                    <td colSpan={2} style={{ padding: '10px 14px' }}>
                      <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Balanced</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Action Bar */}
            <div style={{ padding: '14px 18px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(99,102,241,0.03)' }}>
              <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>Save Draft</button>
              <button style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Request Approval</button>
              <button style={{ background: 'rgba(99,102,241,0.9)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Post All Lines</button>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: THEME.muted }}>
                Total Debit = Total Credit = <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>$48,320.00</span>
                <span style={{ marginLeft: 10, background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Balanced</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
