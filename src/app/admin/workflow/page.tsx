'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Workflow {
  id: string; name: string; module: string; type: string; version: string
  status: 'Active' | 'Draft' | 'Inactive'; createdBy: string; lastModified: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const S = {
  bg:     '#0d0e24',
  card:   '#16213e',
  border: 'rgba(99,102,241,0.15)',
  text:   '#e2e8f0',
  muted:  '#94a3b8',
  indigo: '#6366f1',
}

const STATUS_CHIP: Record<string, { bg: string; color: string }> = {
  Active:   { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  Draft:    { bg: 'rgba(251,191,36,0.12)',   color: '#fbbf24' },
  Inactive: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
}

// ─── SVG Workflow Visualizer ──────────────────────────────────────────────────
function WorkflowDiagram() {
  const W = 820, H = 200
  // node definitions: [x, y, label, state]  state: idle|active|complete|rejected
  const nodes: Array<{ x: number; y: number; w: number; label: string; state: string; shape?: 'diamond' }> = [
    { x:  20, y: 80,  w: 110, label: 'Requester Submits',     state: 'complete' },
    { x: 175, y: 80,  w: 120, label: 'Dept Manager Review',   state: 'complete' },
    { x: 340, y: 70,  w:  80, label: 'Approved?',             state: 'complete', shape: 'diamond' },
    { x: 470, y: 80,  w: 110, label: 'Finance Review',        state: 'active'   },
    { x: 630, y: 70,  w:  80, label: 'Approved?',             state: 'idle',   shape: 'diamond' },
    { x: 760, y: 80,  w:  60, label: 'Posted',                state: 'idle'     },
  ]
  const rejectNode = { x: 340, y: 150, w: 140, label: 'Rejected — Return to Requester', state: 'rejected' }

  const stateColor = (s: string) => {
    if (s === 'complete')  return { border: '#4ade80', bg: 'rgba(34,197,94,0.08)',  text: '#4ade80' }
    if (s === 'active')    return { border: S.indigo,  bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc' }
    if (s === 'rejected')  return { border: '#f87171', bg: 'rgba(239,68,68,0.08)',  text: '#f87171' }
    return { border: 'rgba(99,102,241,0.3)', bg: '#16213e', text: S.muted }
  }

  const NodeRect = ({ n }: { n: typeof nodes[0] }) => {
    const c = stateColor(n.state)
    const cx = n.x + n.w / 2, cy = n.y + 20
    if (n.shape === 'diamond') {
      const hw = 36, hh = 22
      const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`
      return (
        <g>
          <polygon points={pts} fill={c.bg} stroke={c.border} strokeWidth={1.5} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill={c.text}>{n.label}</text>
        </g>
      )
    }
    return (
      <g>
        <rect x={n.x} y={n.y} width={n.w} height={40} rx={6} fill={c.bg} stroke={c.border} strokeWidth={1.5} />
        <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fontSize={10} fill={c.text}>{n.label}</text>
      </g>
    )
  }

  // Arrows
  const ArrowH = ({ x1, y, x2 }: { x1: number; y: number; x2: number }) => (
    <g>
      <line x1={x1} y1={y} x2={x2 - 7} y2={y} stroke="rgba(99,102,241,0.5)" strokeWidth={1.5} />
      <polygon points={`${x2},${y} ${x2 - 8},${y - 4} ${x2 - 8},${y + 4}`} fill="rgba(99,102,241,0.5)" />
    </g>
  )
  const ArrowDown = ({ x, y1, y2 }: { x: number; y1: number; y2: number }) => (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke="rgba(239,68,68,0.5)" strokeWidth={1.5} strokeDasharray="4 2" />
      <polygon points={`${x},${y2} ${x - 4},${y2 - 8} ${x + 4},${y2 - 8}`} fill="rgba(239,68,68,0.5)" />
    </g>
  )

  const c = stateColor(rejectNode.state)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Start circle */}
      <circle cx={12} cy={100} r={7} fill={S.indigo} />
      <ArrowH x1={19} y={100} x2={nodes[0].x} />
      {/* Requester → Dept Manager */}
      <ArrowH x1={nodes[0].x + nodes[0].w} y={100} x2={nodes[1].x} />
      {/* Dept Manager → Diamond 1 */}
      <ArrowH x1={nodes[1].x + nodes[1].w} y={100} x2={nodes[2].x + nodes[2].w / 2 - 36} />
      {/* Diamond 1 Yes → Finance */}
      <ArrowH x1={nodes[2].x + nodes[2].w / 2 + 36} y={100} x2={nodes[3].x} />
      {/* Finance → Diamond 2 */}
      <ArrowH x1={nodes[3].x + nodes[3].w} y={100} x2={nodes[4].x + nodes[4].w / 2 - 36} />
      {/* Diamond 2 Yes → Posted */}
      <ArrowH x1={nodes[4].x + nodes[4].w / 2 + 36} y={100} x2={nodes[5].x} />
      {/* End circle */}
      <circle cx={nodes[5].x + nodes[5].w + 10} cy={100} r={7} fill="rgba(34,197,94,0.6)" stroke="#4ade80" strokeWidth={1.5} />
      {/* Diamond 1 No → Rejected */}
      <ArrowDown x={nodes[2].x + nodes[2].w / 2} y1={100 + 22} y2={rejectNode.y} />
      {/* Rejected label "No" */}
      <text x={nodes[2].x + nodes[2].w / 2 + 5} y={138} fontSize={9} fill="rgba(239,68,68,0.7)">No</text>
      <text x={nodes[2].x + nodes[2].w / 2 + 37} y={94} fontSize={9} fill="rgba(34,197,94,0.7)">Yes</text>
      <text x={nodes[4].x + nodes[4].w / 2 + 37} y={94} fontSize={9} fill="rgba(34,197,94,0.7)">Yes</text>

      {/* Render nodes */}
      {nodes.map((n, i) => <NodeRect key={i} n={n} />)}

      {/* Rejected node */}
      <rect x={rejectNode.x} y={rejectNode.y} width={rejectNode.w} height={38} rx={6} fill={c.bg} stroke={c.border} strokeWidth={1.5} />
      <text x={rejectNode.x + rejectNode.w / 2} y={rejectNode.y + 14} textAnchor="middle" fontSize={9} fill={c.text}>Rejected</text>
      <text x={rejectNode.x + rejectNode.w / 2} y={rejectNode.y + 26} textAnchor="middle" fontSize={9} fill={c.text}>Return to Requester</text>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkflowManagementPage() {
  const [workflows, setWorkflows]   = useState<Workflow[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<'All Workflows' | 'Active' | 'Draft' | 'Inactive'>('All Workflows')
  const [selected, setSelected]     = useState<Workflow | null>(null)
  const [sortCol, setSortCol]       = useState<keyof Workflow>('id')
  const [sortAsc, setSortAsc]       = useState(true)

  useEffect(() => {
    fetch('/api/admin/workflow')
      .then(r => r.json())
      .then(d => { setWorkflows(d.workflows); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = workflows
    .filter(w => tab === 'All Workflows' || w.status === tab)
    .sort((a, b) => {
      const av = a[sortCol] as string, bv = b[sortCol] as string
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const toggleSort = (col: keyof Workflow) => {
    if (sortCol === col) setSortAsc(!sortAsc); else { setSortCol(col); setSortAsc(true) }
  }

  const ColHead = ({ col, label }: { col: keyof Workflow; label: string }) => (
    <th onClick={() => toggleSort(col)} style={{
      padding: '10px 14px', textAlign: 'left', fontSize: 11, color: S.muted, fontWeight: 600,
      cursor: 'pointer', userSelect: 'none', borderBottom: `1px solid ${S.border}`,
      whiteSpace: 'nowrap', background: S.card,
    }}>
      {label} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  )

  const TABS = ['All Workflows', 'Active', 'Draft', 'Inactive'] as const

  return (
    <div style={{ minHeight: '100dvh', background: S.bg, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title="Workflow Management"
        breadcrumb={[
          { label: 'Administration', href: '/admin' },
          { label: 'Workflow', href: '/admin/workflow' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>New Workflow</button>
            <button style={btnSecondary}>Import</button>
            <button style={btnSecondary}>Test</button>
          </>
        }
      />

      {/* Tab strip */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${S.border}`, paddingLeft: 24, background: S.card }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
            background: 'transparent', color: tab === t ? S.indigo : S.muted,
            borderBottom: tab === t ? `2px solid ${S.indigo}` : '2px solid transparent',
            transition: 'color .15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ flex: '0 0 auto', overflow: 'auto', maxHeight: '50vh' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: S.muted }}>Loading workflows...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <ColHead col="id"           label="Workflow ID" />
                <ColHead col="name"         label="Name" />
                <ColHead col="module"       label="Module" />
                <ColHead col="type"         label="Type" />
                <ColHead col="version"      label="Version" />
                <ColHead col="status"       label="Status" />
                <ColHead col="createdBy"    label="Created By" />
                <ColHead col="lastModified" label="Last Modified" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => {
                const chip = STATUS_CHIP[w.status]
                const isSelected = selected?.id === w.id
                return (
                  <tr
                    key={w.id}
                    onClick={() => setSelected(isSelected ? null : w)}
                    style={{
                      borderBottom: `1px solid ${S.border}`, cursor: 'pointer',
                      background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                      transition: 'background .12s',
                    }}
                  >
                    <td style={{ padding: '10px 14px', color: S.indigo, fontFamily: 'monospace', fontSize: 12 }}>{w.id}</td>
                    <td style={{ padding: '10px 14px', color: S.text, fontWeight: 500 }}>{w.name}</td>
                    <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{w.module}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>{w.type}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{w.version}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: chip.bg, color: chip.color, fontWeight: 600 }}>{w.status}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12, fontFamily: 'monospace' }}>{w.createdBy}</td>
                    <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{w.lastModified}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Workflow Visualizer */}
      <div style={{ margin: '20px 24px', borderRadius: 10, border: `1px solid ${S.border}`, background: S.card, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: S.text }}>Workflow Diagram</span>
          {selected ? (
            <span style={{ fontSize: 11, color: S.indigo }}>{selected.id} — {selected.name}</span>
          ) : (
            <span style={{ fontSize: 11, color: S.muted }}>Select a workflow row to visualize · Showing: WF-001 Purchase Order Approval</span>
          )}
          {/* Legend */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            {[['#4ade80','Complete'], ['#6366f1','Active'], [S.muted,'Idle'], ['#f87171','Rejected']].map(([color, label]) => (
              <span key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: S.muted }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color as string, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px 16px' }}>
          <WorkflowDiagram />
        </div>
      </div>
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: 'pointer', border: 'none',
  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
}
const btnSecondary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer',
  background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)',
}
