'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const DAYS = ['Mon\nApr 14', 'Tue\nApr 15', 'Wed\nApr 16', 'Thu\nApr 17', 'Fri\nApr 18', 'Sat\nApr 19', 'Sun\nApr 20']
const DAY_SHORT = ['Mon Apr 14', 'Tue Apr 15', 'Wed Apr 16', 'Thu Apr 17', 'Fri Apr 18', 'Sat Apr 19', 'Sun Apr 20']
const WEEKEND = [5, 6]

const HISTORY_STATUS: Record<string, string> = {
  approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  submitted: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
  open: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
}

type TSRow = { project: string; activity: string; hours: number[] }
type HistoryRow = { week: string; total: number; status: string }
type TSData = { week: { label: string }; status: string; rows: TSRow[]; history: HistoryRow[] }

export default function TimesheetsPage() {
  const [data, setData] = useState<TSData | null>(null)
  const [grid, setGrid] = useState<number[][]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/timesheets')
      .then(r => r.json())
      .then((d: TSData) => {
        setData(d)
        setGrid(d.rows.map(r => [...r.hours]))
      })
      .finally(() => setLoading(false))
  }, [])

  function updateCell(rowIdx: number, dayIdx: number, val: string) {
    const n = Math.min(24, Math.max(0, parseInt(val) || 0))
    setGrid(g => g.map((row, r) => r === rowIdx ? row.map((h, d) => d === dayIdx ? n : h) : row))
  }

  const dailyTotals = grid.length > 0 ? DAYS.map((_, di) => grid.reduce((sum, row) => sum + row[di], 0)) : Array(7).fill(0)
  const rowTotals = grid.map(row => row.reduce((a, b) => a + b, 0))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <TopBar
        title="Timesheets"
        breadcrumb={[{ label: 'Projects', href: '/projects' }, { label: 'Timesheets', href: '/projects/timesheets' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Submit for Approval</button>
            <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>New Timesheet</button>
          </>
        }
      />

      <div style={{ padding: '20px 24px' }}>
        {/* Week selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#94a3b8', padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>‹</button>
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 600, color: '#e2e8f0', minWidth: 200, textAlign: 'center' }}>
            {data?.week.label || 'Apr 14 – Apr 20, 2026'}
          </div>
          <button style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#94a3b8', padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>›</button>
          <button style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 5, color: '#a5b4fc', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>This Week</button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {data && (
              <span className={HISTORY_STATUS[data.status] || 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} style={{ borderRadius: 5, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                Submitted — Pending Approval
              </span>
            )}
          </div>
        </div>

        {/* Timesheet grid */}
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading…</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.05)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, width: 200, minWidth: 200 }}>Project / Activity</th>
                    {DAY_SHORT.map((d, i) => (
                      <th key={d} style={{ padding: '10px 12px', textAlign: 'center', color: WEEKEND.includes(i) ? '#475569' : '#94a3b8', fontWeight: WEEKEND.includes(i) ? 400 : 600, background: WEEKEND.includes(i) ? 'rgba(0,0,0,0.15)' : 'transparent', whiteSpace: 'pre-line', fontSize: 11, minWidth: 80 }}>
                        {d.split(' ').map((p, pi) => <span key={pi} style={{ display: 'block' }}>{p}</span>)}
                      </th>
                    ))}
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, minWidth: 60 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '8px 14px', color: '#e2e8f0' }}>
                        <div style={{ fontWeight: 600, fontSize: 11, color: '#6366f1' }}>{row.project}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{row.activity}</div>
                      </td>
                      {(grid[ri] || row.hours).map((h, di) => (
                        <td key={di} style={{ padding: '6px 8px', background: WEEKEND.includes(di) ? 'rgba(0,0,0,0.12)' : 'transparent', textAlign: 'center' }}>
                          <input
                            type="number" min="0" max="24" value={h || ''}
                            onChange={e => updateCell(ri, di, e.target.value)}
                            placeholder="0"
                            style={{ width: 48, height: 30, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4, color: h > 0 ? '#e2e8f0' : '#475569', textAlign: 'center', fontSize: 13, fontWeight: h > 0 ? 600 : 400, outline: 'none' }}
                          />
                        </td>
                      ))}
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: rowTotals[ri] > 0 ? '#a5b4fc' : '#475569' }}>
                        {rowTotals[ri]}h
                      </td>
                    </tr>
                  ))}

                  {/* Daily totals row */}
                  <tr style={{ borderTop: '2px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#e2e8f0', fontSize: 12 }}>TOTAL</td>
                    {dailyTotals.map((t, i) => (
                      <td key={i} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: 13, color: t === 0 ? '#475569' : t < 8 ? '#f59e0b' : '#10b981', background: WEEKEND.includes(i) ? 'rgba(0,0,0,0.12)' : 'transparent' }}>
                        {t}h
                      </td>
                    ))}
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, fontSize: 14, color: grandTotal >= 40 ? '#10b981' : '#f59e0b' }}>
                      {grandTotal}h
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Grand total callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: grandTotal >= 40 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${grandTotal >= 40 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, color: grandTotal >= 40 ? '#10b981' : '#f59e0b' }}>
            {grandTotal}h total — {grandTotal >= 40 ? 'At target (40h)' : `${40 - grandTotal}h under target`}
          </div>
        </div>

        {/* Comments */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Comments (optional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment for the approver…"
            rows={3}
            style={{ width: '100%', background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, color: '#e2e8f0', fontSize: 13, padding: '10px 14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Timesheet History */}
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Timesheet History</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.04)' }}>
                {['Week','Total Hours','Status'].map(h => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: 'left', color: '#475569', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.history.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                  <td style={{ padding: '9px 16px', color: '#e2e8f0' }}>{h.week}</td>
                  <td style={{ padding: '9px 16px', color: '#a5b4fc', fontWeight: 600 }}>{h.total}h</td>
                  <td style={{ padding: '9px 16px' }}>
                    <span className={HISTORY_STATUS[h.status] || ''} style={{ borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                      {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
