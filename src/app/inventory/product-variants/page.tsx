'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProductMaster {
  id: string
  name: string
  variantCount: number
}

interface Variant {
  variantNo: string
  color: string
  size: string
  style: string
  status: 'Active' | 'Discontinued'
  onHand: number
  unitCost: number
  salesPrice: number
}

// ─── Static data ─────────────────────────────────────────────────────────────

const PRODUCT_MASTERS: ProductMaster[] = [
  { id: 'A100', name: 'Widget Assembly A100', variantCount: 12 },
  { id: 'B200', name: 'Motor Housing B200', variantCount: 6 },
  { id: 'C300', name: 'Control Panel C300', variantCount: 8 },
  { id: 'TSC', name: 'T-Shirt Classic', variantCount: 24 },
  { id: 'CBP', name: 'Coffee Blend Premium', variantCount: 4 },
]

const VARIANTS_A100: Variant[] = [
  { variantNo: 'A100-RED-S', color: 'Red',    size: 'Small',  style: 'Standard', status: 'Active',       onHand: 45,  unitCost: 22.00, salesPrice: 34.99 },
  { variantNo: 'A100-RED-M', color: 'Red',    size: 'Medium', style: 'Standard', status: 'Active',       onHand: 38,  unitCost: 22.50, salesPrice: 34.99 },
  { variantNo: 'A100-RED-L', color: 'Red',    size: 'Large',  style: 'Standard', status: 'Active',       onHand: 12,  unitCost: 23.00, salesPrice: 36.99 },
  { variantNo: 'A100-BLU-S', color: 'Blue',   size: 'Small',  style: 'Standard', status: 'Active',       onHand: 67,  unitCost: 22.00, salesPrice: 34.99 },
  { variantNo: 'A100-BLU-M', color: 'Blue',   size: 'Medium', style: 'Standard', status: 'Active',       onHand: 54,  unitCost: 22.50, salesPrice: 34.99 },
  { variantNo: 'A100-BLU-L', color: 'Blue',   size: 'Large',  style: 'Standard', status: 'Active',       onHand: 23,  unitCost: 23.00, salesPrice: 36.99 },
  { variantNo: 'A100-BLK-S', color: 'Black',  size: 'Small',  style: 'Standard', status: 'Active',       onHand: 89,  unitCost: 22.00, salesPrice: 34.99 },
  { variantNo: 'A100-BLK-M', color: 'Black',  size: 'Medium', style: 'Standard', status: 'Active',       onHand: 71,  unitCost: 22.50, salesPrice: 34.99 },
  { variantNo: 'A100-BLK-L', color: 'Black',  size: 'Large',  style: 'Standard', status: 'Active',       onHand: 30,  unitCost: 23.00, salesPrice: 36.99 },
  { variantNo: 'A100-SLV-S', color: 'Silver', size: 'Small',  style: 'Standard', status: 'Discontinued', onHand: 5,   unitCost: 22.00, salesPrice: 32.99 },
  { variantNo: 'A100-SLV-M', color: 'Silver', size: 'Medium', style: 'Standard', status: 'Discontinued', onHand: 3,   unitCost: 22.50, salesPrice: 32.99 },
  { variantNo: 'A100-SLV-L', color: 'Silver', size: 'Large',  style: 'Standard', status: 'Discontinued', onHand: 0,   unitCost: 23.00, salesPrice: 34.99 },
]

const COLOR_DOTS: Record<string, string> = {
  Red: '#ef4444', Blue: '#3b82f6', Black: '#374151', Silver: '#94a3b8',
}

const COLOR_LABELS = ['Red', 'Blue', 'Black', 'Silver']
const SIZE_LABELS  = ['Small', 'Medium', 'Large']
const STYLE_LABELS = ['Standard']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function StatusChip({ status }: { status: 'Active' | 'Discontinued' }) {
  return status === 'Active' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-700/60 text-zinc-400 border border-zinc-600/30">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
      Discontinued
    </span>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductVariantsPage() {
  const [selectedId, setSelectedId]     = useState<string>('A100')
  const [variants, setVariants]         = useState<Variant[]>([])
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/inventory/product-variants?productId=${selectedId}`)
      .then(r => r.json())
      .then(d => setVariants(d.variants ?? VARIANTS_A100))
      .catch(() => setVariants(VARIANTS_A100))
      .finally(() => setLoading(false))
  }, [selectedId])

  const selected = PRODUCT_MASTERS.find(p => p.id === selectedId)!

  return (
    <div style={{ background: '#0d0e24', minHeight: '100dvh' }} className="flex flex-col">
      <TopBar
        title="Product Variants"
        breadcrumb={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Product Variants', href: '/inventory/product-variants' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              New Product Master
            </button>
            <button className="h-8 px-3 rounded text-[12px] font-medium border text-[#e2e8f0] hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'transparent' }}>
              Generate Variants
            </button>
            <button className="h-8 px-3 rounded text-[12px] font-medium border text-[#94a3b8] hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(99,102,241,0.15)', background: 'transparent' }}>
              Configuration
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <aside
          className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
          style={{ width: 220, background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}
        >
          <div className="px-3 py-2.5 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">Product Masters</span>
          </div>
          {PRODUCT_MASTERS.map(pm => (
            <button
              key={pm.id}
              onClick={() => setSelectedId(pm.id)}
              className="w-full text-left px-3 py-3 border-b transition-colors hover:bg-indigo-500/5"
              style={{
                borderColor: 'rgba(99,102,241,0.08)',
                borderLeft: pm.id === selectedId ? '3px solid #6366f1' : '3px solid transparent',
                background: pm.id === selectedId ? 'rgba(99,102,241,0.08)' : 'transparent',
              }}
            >
              <div className="text-[12px] font-medium" style={{ color: pm.id === selectedId ? '#e2e8f0' : '#94a3b8' }}>
                {pm.name}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>
                {pm.variantCount} variants
              </div>
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Product Master Header Card */}
          <div
            className="rounded-lg px-5 py-4 border"
            style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)' }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Item No. {selected.id}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">Product Master</span>
                </div>
                <h2 className="text-[15px] font-semibold text-[#e2e8f0]">{selected.name}</h2>
              </div>
              <div className="flex flex-wrap gap-4 text-[11px]">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[#94a3b8] mb-0.5">Config Technology</div>
                  <div className="text-[#e2e8f0] font-medium">Predefined variants</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[#94a3b8] mb-0.5">Product Dimensions</div>
                  <div className="text-[#e2e8f0] font-medium">Color, Size, Style</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[#94a3b8] mb-0.5">Storage Dimensions</div>
                  <div className="text-[#e2e8f0] font-medium">Site, Warehouse</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[#94a3b8] mb-0.5">Tracking</div>
                  <div className="text-[#e2e8f0] font-medium">Serial No.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dimension Values FastTab */}
          <details open className="rounded-lg border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <summary
              className="px-4 py-3 cursor-pointer flex items-center gap-2 select-none hover:bg-indigo-500/5 transition-colors"
              style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}
            >
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[12px] font-semibold text-[#e2e8f0]">Dimension Values</span>
              <span className="ml-auto text-[10px] text-[#94a3b8]">4 colors · 3 sizes · 1 style</span>
            </summary>
            <div className="p-4 grid grid-cols-3 gap-4">
              {/* Colors */}
              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold text-[#94a3b8] mb-2">
                  Colors ({COLOR_LABELS.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_LABELS.map(c => (
                    <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#e2e8f0] border"
                      style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLOR_DOTS[c] }} />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {/* Sizes */}
              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold text-[#94a3b8] mb-2">
                  Sizes ({SIZE_LABELS.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SIZE_LABELS.map(s => (
                    <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-[#e2e8f0] border"
                      style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {/* Styles */}
              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold text-[#94a3b8] mb-2">
                  Styles ({STYLE_LABELS.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_LABELS.map(s => (
                    <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-[#e2e8f0] border"
                      style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </details>

          {/* Product Variants Table */}
          <div className="rounded-lg border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
              <span className="text-[12px] font-semibold text-[#e2e8f0]">Product Variants</span>
              <span className="text-[11px] text-[#94a3b8]">
                {loading ? 'Loading…' : `${variants.length} variants`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.04)' }}>
                    {['Variant #', 'Color', 'Size', 'Style', 'Status', 'On Hand', 'Unit Cost', 'Sales Price'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(loading ? [] : variants).map((v, i) => (
                    <tr
                      key={v.variantNo}
                      className="transition-colors hover:bg-indigo-500/5"
                      style={{ borderBottom: i < variants.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}
                    >
                      <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-indigo-300">{v.variantNo}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[#e2e8f0]">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_DOTS[v.color] ?? '#64748b' }} />
                          {v.color}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[#e2e8f0]">{v.size}</td>
                      <td className="px-3 py-2.5 text-[#94a3b8]">{v.style}</td>
                      <td className="px-3 py-2.5"><StatusChip status={v.status} /></td>
                      <td className={`px-3 py-2.5 font-medium text-right ${v.onHand > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {v.onHand.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#94a3b8]">{fmtCurrency(v.unitCost)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-[#e2e8f0]">{fmtCurrency(v.salesPrice)}</td>
                    </tr>
                  ))}
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-[#94a3b8] text-[12px]">Loading variants…</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Variant Configuration Card */}
          <div className="rounded-lg border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
              <span className="text-[12px] font-semibold text-[#e2e8f0]">Variant Configuration Matrix</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {VARIANTS_A100.map(v => (
                  <div
                    key={v.variantNo}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded border text-[11px]"
                    style={{
                      background: v.status === 'Active' ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                      borderColor: v.status === 'Active' ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLOR_DOTS[v.color] ?? '#64748b' }} />
                      <span className="truncate font-mono text-[10px]" style={{ color: v.status === 'Active' ? '#e2e8f0' : '#94a3b8' }}>
                        {v.color[0]}/{v.size[0]}
                      </span>
                    </div>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${v.status === 'Active' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-[#94a3b8]">
                Green dot = Active · Gray = Discontinued · Click variant row to edit
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
