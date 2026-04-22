'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BomListItem {
  id: string
  name: string
  version: string
  status: 'Active' | 'Draft'
}

interface BomLine {
  lineNo: number
  itemNo: string
  description: string
  type: 'Item' | 'Labor' | 'Overhead'
  qtyPer: number | string
  uom: string
  scrap: string
  leadTime: string
  costPerUnit: string
  lineCost: string
  warehouse: string
  notes: string
}

// ─── Static data ─────────────────────────────────────────────────────────────

const BOM_LIST: BomListItem[] = [
  { id: 'a100', name: 'Widget Assembly A100',   version: 'v3', status: 'Active' },
  { id: 'b200', name: 'Motor Housing B200',     version: 'v2', status: 'Active' },
  { id: 'c300', name: 'Control Panel C300',     version: 'v1', status: 'Active' },
  { id: 'coff', name: 'Coffee Blend Premium',   version: 'v1', status: 'Active' },
  { id: 'x400', name: 'Circuit Board X400',     version: 'v2', status: 'Draft'  },
]

const BOM_LINES: BomLine[] = [
  { lineNo: 10,  itemNo: '1003',        description: 'Drive Unit D400',       type: 'Item',     qtyPer: 1,    uom: 'EA', scrap: '0%', leadTime: '28 days', costPerUnit: '$210.00', lineCost: '$210.00', warehouse: 'Main', notes: '' },
  { lineNo: 20,  itemNo: '1004',        description: 'Standard Bolt M8',      type: 'Item',     qtyPer: 24,   uom: 'EA', scrap: '5%', leadTime: '3 days',  costPerUnit: '$0.12',   lineCost: '$2.88',   warehouse: 'Main', notes: '' },
  { lineNo: 30,  itemNo: '1005',        description: 'Packaging Box',         type: 'Item',     qtyPer: 1,    uom: 'EA', scrap: '0%', leadTime: '5 days',  costPerUnit: '$0.45',   lineCost: '$0.45',   warehouse: 'Main', notes: '' },
  { lineNo: 40,  itemNo: 'LABOR-ASSEM', description: 'Assembly Labor',        type: 'Labor',    qtyPer: 0.5,  uom: 'HR', scrap: '—',  leadTime: '—',       costPerUnit: '$45.00',  lineCost: '$22.50',  warehouse: '—',    notes: '' },
  { lineNo: 50,  itemNo: 'OVERHEAD',    description: 'Plant Overhead',        type: 'Overhead', qtyPer: 1,    uom: 'EA', scrap: '—',  leadTime: '—',       costPerUnit: '$8.00',   lineCost: '$8.00',   warehouse: '—',    notes: '' },
  { lineNo: 60,  itemNo: '1006',        description: 'Steel Frame Insert',    type: 'Item',     qtyPer: 2,    uom: 'EA', scrap: '2%', leadTime: '10 days', costPerUnit: '$3.10',   lineCost: '$6.20',   warehouse: 'Main', notes: '' },
  { lineNo: 70,  itemNo: '1007',        description: 'Rubber Gasket Set',     type: 'Item',     qtyPer: 1,    uom: 'EA', scrap: '1%', leadTime: '7 days',  costPerUnit: '$1.25',   lineCost: '$1.25',   warehouse: 'Main', notes: '' },
  { lineNo: 80,  itemNo: '1008',        description: 'Mounting Bracket',      type: 'Item',     qtyPer: 4,    uom: 'EA', scrap: '0%', leadTime: '5 days',  costPerUnit: '$0.85',   lineCost: '$3.40',   warehouse: 'Main', notes: '' },
  { lineNo: 90,  itemNo: '1009',        description: 'Control Chip CC-01',    type: 'Item',     qtyPer: 1,    uom: 'EA', scrap: '3%', leadTime: '14 days', costPerUnit: '$6.20',   lineCost: '$6.20',   warehouse: 'Main', notes: 'Critical' },
  { lineNo: 100, itemNo: '1010',        description: 'Wiring Harness WH-50',  type: 'Item',     qtyPer: 1,    uom: 'EA', scrap: '0%', leadTime: '7 days',  costPerUnit: '$4.50',   lineCost: '$4.50',   warehouse: 'Main', notes: '' },
  { lineNo: 110, itemNo: 'RAW-003',     description: 'Thermal Compound',      type: 'Item',     qtyPer: 5,    uom: 'G',  scrap: '5%', leadTime: '3 days',  costPerUnit: '$0.09',   lineCost: '$0.45',   warehouse: 'Main', notes: '' },
  { lineNo: 120, itemNo: 'LABEL-001',   description: 'Product Label Set',     type: 'Item',     qtyPer: 1,    uom: 'EA', scrap: '0%', leadTime: '2 days',  costPerUnit: '$0.00',   lineCost: '$0.00',   warehouse: 'Main', notes: '' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusChip(s: string) {
  if (s === 'Active') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  if (s === 'Draft')  return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
  return 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
}

function typeChip(t: string) {
  if (t === 'Item')     return { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }
  if (t === 'Labor')    return { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }
  if (t === 'Overhead') return { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' }
  return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' }
}

// ─── BOM Tree SVG ─────────────────────────────────────────────────────────────

function BomTree() {
  const BOX_W = 150, BOX_H = 44, GAP_X = 30, GAP_Y = 20

  type TreeNode = { id: string; label: string; sub: string; qty: string; children?: TreeNode[] }

  const tree: TreeNode = {
    id: 'root', label: '1000', sub: 'Widget Assembly A100', qty: '1 EA',
    children: [
      {
        id: 'n1', label: '1003', sub: 'Drive Unit D400', qty: '1 EA',
        children: [
          { id: 'n1a', label: 'RAW-010', sub: 'Motor Coil', qty: '2 EA' },
          { id: 'n1b', label: 'RAW-011', sub: 'Shaft Rod', qty: '1 EA' },
        ],
      },
      { id: 'n2', label: '1004', sub: 'Bolt M8', qty: '24 EA' },
      { id: 'n3', label: '1005', sub: 'Packaging Box', qty: '1 EA' },
      { id: 'n4', label: '1006', sub: 'Steel Frame', qty: '2 EA' },
    ],
  }

  interface BoxPos { node: TreeNode; x: number; y: number }
  const positions: BoxPos[] = []

  function layout(node: TreeNode, depth: number, indexAtDepth: number, totalAtDepth: number) {
    const startY = depth === 0 ? 10 : 10 + depth * (BOX_H + GAP_Y) * 1.6
    const startX = depth === 0
      ? (500 - BOX_W) / 2
      : 10 + indexAtDepth * (BOX_W + GAP_X)
    positions.push({ node, x: startX, y: startY })
    if (node.children) {
      node.children.forEach((child, i) =>
        layout(child, depth + 1, i, node.children!.length)
      )
    }
  }

  layout(tree, 0, 0, 1)

  function getPos(id: string) {
    return positions.find(p => p.node.id === id)!
  }

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
  function buildLines(node: TreeNode) {
    const p = getPos(node.id)
    if (node.children) {
      node.children.forEach(child => {
        const c = getPos(child.id)
        lines.push({
          x1: p.x + BOX_W / 2,
          y1: p.y + BOX_H,
          x2: c.x + BOX_W / 2,
          y2: c.y,
        })
        buildLines(child)
      })
    }
  }
  buildLines(tree)

  const svgH = 10 + 3 * (BOX_H + GAP_Y) * 1.6 + BOX_H + 10

  return (
    <svg width="100%" viewBox={`0 0 500 ${svgH}`} style={{ overflow: 'visible' }}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill="rgba(99,102,241,0.5)" />
        </marker>
      </defs>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="rgba(99,102,241,0.35)"
          strokeWidth="1.5"
          markerEnd="url(#arr)"
        />
      ))}
      {positions.map(({ node, x, y }) => (
        <g key={node.id}>
          <rect
            x={x} y={y} width={BOX_W} height={BOX_H} rx={6}
            fill="#16213e"
            stroke={node.id === 'root' ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.25)'}
            strokeWidth={node.id === 'root' ? 1.5 : 1}
          />
          <text x={x + 8} y={y + 16} fontSize={11} fontWeight={600} fill="#a5b4fc" fontFamily="monospace">
            {node.label}
          </text>
          <text x={x + 8} y={y + 28} fontSize={9} fill="#94a3b8">
            {node.sub.length > 17 ? node.sub.slice(0, 17) + '…' : node.sub}
          </text>
          <text x={x + 8} y={y + 40} fontSize={9} fill="#6366f1">
            {node.qty}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BomPage() {
  const [selectedId, setSelectedId] = useState('a100')
  const [costOpen, setCostOpen] = useState(false)
  const [linesOpen, setLinesOpen] = useState(true)

  useEffect(() => {
    document.title = 'Bill of Materials — NovaPOS'
  }, [])

  const selected = BOM_LIST.find(b => b.id === selectedId) ?? BOM_LIST[0]

  const topBarActions = (
    <>
      <button
        className="px-3 py-1.5 rounded text-xs font-semibold"
        style={{ background: '#6366f1', color: '#fff' }}
      >
        New BOM
      </button>
      {['Copy BOM', 'Check Availability'].map(lbl => (
        <button
          key={lbl}
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {lbl}
        </button>
      ))}
    </>
  )

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Bill of Materials"
        breadcrumb={[{ label: 'Manufacturing', href: '/manufacturing' }, { label: 'Bill of Materials', href: '/manufacturing/bom' }]}
        actions={topBarActions}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — BOM list */}
        <div
          className="flex-shrink-0 border-r overflow-y-auto"
          style={{ width: 220, borderColor: 'rgba(99,102,241,0.15)', background: '#0d0e24' }}
        >
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
            Bills of Materials
          </div>
          {BOM_LIST.map(b => {
            const sel = b.id === selectedId
            return (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{
                  background: sel ? 'rgba(99,102,241,0.1)' : 'transparent',
                  borderLeft: sel ? '3px solid #6366f1' : '3px solid transparent',
                }}
              >
                <div className="text-[12px] font-medium leading-snug" style={{ color: sel ? '#e2e8f0' : '#94a3b8' }}>
                  {b.name}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-mono" style={{ color: '#6366f1' }}>{b.version}</span>
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusChip(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* BOM Header */}
            <div className="rounded-xl p-4 border" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: '#94a3b8' }}>
                BOM Header
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-[13px]">
                {[
                  ['Item', '1000 — Widget Assembly A100'],
                  ['BOM Version', 'v3'],
                  ['Status', 'Active'],
                  ['Effective', 'Jan 1, 2026'],
                  ['Quantity', '1 EA'],
                  ['Site', 'Main Plant'],
                  ['Warehouse', 'Main Warehouse'],
                  ['Lead Time', '5 days'],
                  ['Scrap %', '2%'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>{label}</div>
                    <div className="font-medium" style={{ color: '#e2e8f0' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOM Lines FastTab */}
            <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <details open={linesOpen} onToggle={e => setLinesOpen((e.target as HTMLDetailsElement).open)}>
                <summary
                  className="flex items-center justify-between px-4 py-3 cursor-pointer border-b list-none"
                  style={{ borderColor: 'rgba(99,102,241,0.12)' }}
                >
                  <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
                    BOM Lines
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d={linesOpen ? 'M3 5L7 9L11 5' : 'M5 3L9 7L5 11'} stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                        {['Line #', 'Item No.', 'Description', 'Type', 'Qty Per', 'UOM', 'Scrap%', 'Lead Time', 'Cost/Unit', 'Line Cost', 'Warehouse', 'Notes'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[10px] uppercase font-medium tracking-wide whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {BOM_LINES.map((line, i) => {
                        const tc = typeChip(line.type)
                        return (
                          <tr
                            key={i}
                            className="border-b hover:brightness-110 transition-all"
                            style={{ borderColor: 'rgba(99,102,241,0.07)' }}
                          >
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#94a3b8' }}>{line.lineNo}</td>
                            <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: '#6366f1' }}>{line.itemNo}</td>
                            <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>{line.description}</td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: tc.bg, color: tc.color }}>
                                {line.type}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#e2e8f0' }}>{line.qtyPer}</td>
                            <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>{line.uom}</td>
                            <td className="px-3 py-2.5" style={{ color: line.scrap !== '0%' && line.scrap !== '—' ? '#f59e0b' : '#94a3b8' }}>{line.scrap}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#94a3b8' }}>{line.leadTime}</td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#e2e8f0' }}>{line.costPerUnit}</td>
                            <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: '#e2e8f0' }}>{line.lineCost}</td>
                            <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>{line.warehouse}</td>
                            <td className="px-3 py-2.5 text-[11px]" style={{ color: line.notes ? '#f59e0b' : '#94a3b8' }}>{line.notes || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}>
                        <td colSpan={9} className="px-3 py-3 text-right text-[12px] font-semibold" style={{ color: '#94a3b8' }}>
                          Total Component Cost: <span style={{ color: '#e2e8f0' }}>$243.83</span>
                          &nbsp;|&nbsp; Overhead: <span style={{ color: '#e2e8f0' }}>$8.00</span>
                          &nbsp;|&nbsp; Labor: <span style={{ color: '#e2e8f0' }}>$22.50</span>
                          &nbsp;|&nbsp; Total BOM Cost: <span style={{ color: '#a5b4fc' }}>$274.33</span>
                          &nbsp;|&nbsp; Sales Price: <span style={{ color: '#e2e8f0' }}>$34.99</span>
                          &nbsp;|&nbsp; Margin: <span style={{ color: '#f87171' }}>-683%</span>
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </details>
            </div>

            {/* Cost Rollup FastTab */}
            <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <details open={costOpen} onToggle={e => setCostOpen((e.target as HTMLDetailsElement).open)}>
                <summary
                  className="flex items-center justify-between px-4 py-3 cursor-pointer border-b list-none"
                  style={{ borderColor: 'rgba(99,102,241,0.12)' }}
                >
                  <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
                    Cost Rollup
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d={costOpen ? 'M3 5L7 9L11 5' : 'M5 3L9 7L5 11'} stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="p-4 space-y-2 text-[13px]">
                  {[
                    ['Material Cost',      '$213.83', '#e2e8f0'],
                    ['Labor Cost',         '$22.50',  '#e2e8f0'],
                    ['Overhead',           '$8.00',   '#e2e8f0'],
                    ['Scrap Allowance',    '$4.28',   '#f59e0b'],
                    ['Total Standard Cost','$248.61', '#a5b4fc'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                      <span style={{ color: '#94a3b8' }}>{label}</span>
                      <span className="font-mono font-semibold" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Right — BOM Tree View */}
          <div
            className="flex-shrink-0 border-l overflow-y-auto p-4"
            style={{ width: 300, borderColor: 'rgba(99,102,241,0.15)', background: '#0d0e24' }}
          >
            <div className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: '#94a3b8' }}>
              BOM Tree View
            </div>
            <BomTree />
          </div>
        </div>
      </div>
    </div>
  )
}
