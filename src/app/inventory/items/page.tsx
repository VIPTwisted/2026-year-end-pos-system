'use client'

import { useEffect, useState, useCallback } from 'react'
import TopBar from '@/components/layout/TopBar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Item {
  itemNo: string
  description: string
  itemGroup: string
  category: 'Finished' | 'Raw Material' | 'Service' | 'BOM' | 'Consumable'
  uom: string
  standardCost: number | null
  salesPrice: number | null
  onHand: number | null
  leadTime: string | null
  // detail fields
  weight?: number | null
  volume?: number | null
  countryOfOrigin?: string
  vendor?: string
  lastPurchaseDate?: string
  reorderPoint?: number
  safetyStock?: number
}

// ─── Static data ─────────────────────────────────────────────────────────────

const ITEMS: Item[] = [
  { itemNo: '1000', description: 'Widget Assembly A100',      itemGroup: 'Finished Goods',  category: 'Finished',     uom: 'EA', standardCost: 22.00,  salesPrice: 34.99,  onHand: 450,   leadTime: '14 days', vendor: 'IndusTech Mfg',    countryOfOrigin: 'USA',    reorderPoint: 100, safetyStock: 50 },
  { itemNo: '1001', description: 'Motor Housing B200',         itemGroup: 'Components',      category: 'Raw Material', uom: 'EA', standardCost: 89.00,  salesPrice: null,   onHand: 28,    leadTime: '21 days', vendor: 'PrecisionParts Co', countryOfOrigin: 'Germany',reorderPoint: 20,  safetyStock: 10 },
  { itemNo: '1002', description: 'Control Panel C300',         itemGroup: 'Components',      category: 'BOM',          uom: 'EA', standardCost: 145.00, salesPrice: 229.99, onHand: 0,     leadTime: '7 days',  vendor: 'ElectroPro',       countryOfOrigin: 'USA',    reorderPoint: 5,   safetyStock: 2 },
  { itemNo: '1003', description: 'Drive Unit D400',            itemGroup: 'Components',      category: 'Raw Material', uom: 'EA', standardCost: 210.00, salesPrice: null,   onHand: 75,    leadTime: '28 days', vendor: 'DriveWorks Ltd',   countryOfOrigin: 'Japan',  reorderPoint: 15,  safetyStock: 8 },
  { itemNo: '1004', description: 'Standard Bolt M8 x25',       itemGroup: 'Hardware',        category: 'Raw Material', uom: 'EA', standardCost: 0.12,   salesPrice: null,   onHand: 12400, leadTime: '3 days',  vendor: 'FastenerWorld',    countryOfOrigin: 'Taiwan', reorderPoint: 2000,safetyStock: 500 },
  { itemNo: '1005', description: 'Packaging Box Small',         itemGroup: 'Packaging',       category: 'Consumable',   uom: 'EA', standardCost: 0.45,   salesPrice: null,   onHand: 2800,  leadTime: '5 days',  vendor: 'PackagePro Inc',   countryOfOrigin: 'USA',    reorderPoint: 500, safetyStock: 200 },
  { itemNo: '1006', description: 'Premium Coffee Blend',        itemGroup: 'Retail',          category: 'Finished',     uom: 'LB', standardCost: 8.50,   salesPrice: 15.99,  onHand: 340,   leadTime: '2 days',  vendor: 'BeanSource LLC',   countryOfOrigin: 'Colombia',reorderPoint:100,  safetyStock: 40 },
  { itemNo: 'SRV-001', description: 'Installation Service',    itemGroup: 'Services',        category: 'Service',      uom: 'HR', standardCost: 85.00,  salesPrice: 125.00, onHand: null,  leadTime: null,      vendor: 'Internal',         countryOfOrigin: 'N/A',    reorderPoint: 0,   safetyStock: 0 },
  { itemNo: '1007', description: 'Sensor Module E500',          itemGroup: 'Electronics',     category: 'Raw Material', uom: 'EA', standardCost: 34.50,  salesPrice: null,   onHand: 156,   leadTime: '10 days', vendor: 'SensorTech',       countryOfOrigin: 'South Korea', reorderPoint: 30, safetyStock: 15 },
  { itemNo: '1008', description: 'Aluminum Frame F600',         itemGroup: 'Components',      category: 'Raw Material', uom: 'EA', standardCost: 67.00,  salesPrice: null,   onHand: 44,    leadTime: '14 days', vendor: 'MetalWorks Co',    countryOfOrigin: 'USA',    reorderPoint: 10,  safetyStock: 5 },
  { itemNo: '1009', description: 'T-Shirt Classic White S',     itemGroup: 'Apparel',         category: 'Finished',     uom: 'EA', standardCost: 4.20,   salesPrice: 19.99,  onHand: 380,   leadTime: '7 days',  vendor: 'GarmentHub',       countryOfOrigin: 'Bangladesh', reorderPoint: 50, safetyStock: 20 },
  { itemNo: '1010', description: 'T-Shirt Classic Black M',     itemGroup: 'Apparel',         category: 'Finished',     uom: 'EA', standardCost: 4.20,   salesPrice: 19.99,  onHand: 410,   leadTime: '7 days',  vendor: 'GarmentHub',       countryOfOrigin: 'Bangladesh', reorderPoint: 50, safetyStock: 20 },
  { itemNo: '1011', description: 'Lubricant Oil 1L',            itemGroup: 'MRO',             category: 'Consumable',   uom: 'LT', standardCost: 6.75,   salesPrice: null,   onHand: 88,    leadTime: '4 days',  vendor: 'IndusChem',        countryOfOrigin: 'USA',    reorderPoint: 20,  safetyStock: 8 },
  { itemNo: '1012', description: 'Safety Gloves (Pair)',        itemGroup: 'Safety',          category: 'Consumable',   uom: 'PR', standardCost: 2.30,   salesPrice: null,   onHand: 240,   leadTime: '5 days',  vendor: 'SafetyFirst Inc',  countryOfOrigin: 'China',  reorderPoint: 50,  safetyStock: 20 },
  { itemNo: '1013', description: 'Bearing Assembly G700',       itemGroup: 'Components',      category: 'Raw Material', uom: 'EA', standardCost: 18.90,  salesPrice: null,   onHand: 92,    leadTime: '12 days', vendor: 'BearingWorld',     countryOfOrigin: 'Sweden', reorderPoint: 20,  safetyStock: 10 },
  { itemNo: '1014', description: 'Cable Harness H800',          itemGroup: 'Electronics',     category: 'BOM',          uom: 'EA', standardCost: 41.00,  salesPrice: 68.50,  onHand: 33,    leadTime: '9 days',  vendor: 'WireWorks LLC',    countryOfOrigin: 'Mexico', reorderPoint: 10,  safetyStock: 5 },
  { itemNo: '1015', description: 'Foam Insert (Custom)',        itemGroup: 'Packaging',       category: 'Consumable',   uom: 'EA', standardCost: 1.10,   salesPrice: null,   onHand: 1200,  leadTime: '6 days',  vendor: 'FoamPak Co',       countryOfOrigin: 'USA',    reorderPoint: 200, safetyStock: 100 },
  { itemNo: '1016', description: 'Gasket Seal Ring (10-pack)',  itemGroup: 'Hardware',        category: 'Raw Material', uom: 'PK', standardCost: 3.40,   salesPrice: null,   onHand: 760,   leadTime: '3 days',  vendor: 'SealTech',         countryOfOrigin: 'USA',    reorderPoint: 100, safetyStock: 50 },
  { itemNo: '1017', description: 'LED Panel 24V',               itemGroup: 'Electronics',     category: 'Raw Material', uom: 'EA', standardCost: 29.00,  salesPrice: null,   onHand: 105,   leadTime: '8 days',  vendor: 'LightSource Inc',  countryOfOrigin: 'China',  reorderPoint: 20,  safetyStock: 10 },
  { itemNo: '1018', description: 'Display Module I900',         itemGroup: 'Electronics',     category: 'BOM',          uom: 'EA', standardCost: 112.00, salesPrice: 189.00, onHand: 17,    leadTime: '15 days', vendor: 'DisplayPro',       countryOfOrigin: 'South Korea', reorderPoint: 5, safetyStock: 3 },
  { itemNo: '1019', description: 'Spring Clip (100-pack)',      itemGroup: 'Hardware',        category: 'Raw Material', uom: 'PK', standardCost: 4.80,   salesPrice: null,   onHand: 330,   leadTime: '3 days',  vendor: 'FastenerWorld',    countryOfOrigin: 'Taiwan', reorderPoint: 50,  safetyStock: 20 },
  { itemNo: '1020', description: 'Power Supply 12V 5A',         itemGroup: 'Electronics',     category: 'Raw Material', uom: 'EA', standardCost: 22.50,  salesPrice: null,   onHand: 64,    leadTime: '7 days',  vendor: 'PowerPlus LLC',    countryOfOrigin: 'China',  reorderPoint: 15,  safetyStock: 5 },
  { itemNo: 'SRV-002', description: 'Maintenance Contract',    itemGroup: 'Services',        category: 'Service',      uom: 'MO', standardCost: 300.00, salesPrice: 450.00, onHand: null,  leadTime: null,      vendor: 'Internal',         countryOfOrigin: 'N/A',    reorderPoint: 0,   safetyStock: 0 },
  { itemNo: '1021', description: 'Coffee Grind Coarse 5LB',    itemGroup: 'Retail',          category: 'Finished',     uom: 'BG', standardCost: 36.00,  salesPrice: 59.99,  onHand: 120,   leadTime: '2 days',  vendor: 'BeanSource LLC',   countryOfOrigin: 'Ethiopia',reorderPoint: 30,  safetyStock: 10 },
  { itemNo: '1022', description: 'Thermal Transfer Label Roll', itemGroup: 'Packaging',       category: 'Consumable',   uom: 'RL', standardCost: 12.00,  salesPrice: null,   onHand: 85,    leadTime: '4 days',  vendor: 'LabelPro Corp',    countryOfOrigin: 'USA',    reorderPoint: 10,  safetyStock: 5 },
]

const CATEGORIES = ['All', 'Finished', 'Raw Material', 'Service', 'BOM', 'Consumable']

const WH_BREAKDOWN = [
  { warehouse: 'WH-MAIN',  onHand: 280, reserved: 45 },
  { warehouse: 'WH-EAST',  onHand: 95,  reserved: 10 },
  { warehouse: 'WH-WEST',  onHand: 55,  reserved: 8  },
  { warehouse: 'WH-3PL',   onHand: 20,  reserved: 0  },
]

const CUSTOMER_PRICES = [
  { group: 'Wholesale',  price: 29.99, qty: 50 },
  { group: 'Distributor', price: 27.50, qty: 100 },
  { group: 'VIP',        price: 24.99, qty: 200 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(n: number | null) {
  if (n === null) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function CategoryChip({ cat }: { cat: Item['category'] }) {
  const map: Record<Item['category'], string> = {
    'Finished':     'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    'Raw Material': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    'Service':      'bg-sky-500/15 text-sky-300 border-sky-500/25',
    'BOM':          'bg-violet-500/15 text-violet-300 border-violet-500/25',
    'Consumable':   'bg-rose-500/15 text-rose-300 border-rose-500/25',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${map[cat]}`}>
      {cat}
    </span>
  )
}

const DETAIL_TABS = ['General', 'Purchase', 'Sales', 'Inventory', 'BOM', 'Routes'] as const
type DetailTab = typeof DETAIL_TABS[number]

// ─── Detail Panel ────────────────────────────────────────────────────────────

function DetailPanel({ item, onClose }: { item: Item; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>('General')

  return (
    <div
      className="fixed inset-y-0 right-0 w-[420px] flex flex-col z-50 shadow-2xl"
      style={{ background: '#0d0e24', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
        <div>
          <div className="text-[10px] text-indigo-400 font-mono font-bold">{item.itemNo}</div>
          <div className="text-[13px] font-semibold text-[#e2e8f0] mt-0.5">{item.description}</div>
        </div>
        <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0] p-1 rounded transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tab Strip */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
        {DETAIL_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-shrink-0 px-3 py-2 text-[11px] font-medium transition-colors"
            style={{
              color: tab === t ? '#e2e8f0' : '#94a3b8',
              borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'General' && (
          <div className="space-y-3">
            {[
              ['Item No.',      item.itemNo],
              ['Description',   item.description],
              ['Item Group',    item.itemGroup],
              ['Unit of Meas.', item.uom],
              ['Category',      item.category],
              ['Weight (kg)',   item.weight?.toString() ?? '—'],
              ['Volume (m³)',   item.volume?.toString() ?? '—'],
              ['Country of Origin', item.countryOfOrigin ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-[12px]">
                <span style={{ color: '#94a3b8' }}>{label}</span>
                <span style={{ color: '#e2e8f0' }} className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'Purchase' && (
          <div className="space-y-3">
            {[
              ['Vendor',          item.vendor ?? '—'],
              ['Lead Time',       item.leadTime ?? 'N/A'],
              ['Purchase Price',  fmtCurrency(item.standardCost)],
              ['Last Purchase',   item.lastPurchaseDate ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-[12px]">
                <span style={{ color: '#94a3b8' }}>{label}</span>
                <span style={{ color: '#e2e8f0' }} className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'Sales' && (
          <div className="space-y-4">
            <div className="flex justify-between text-[12px]">
              <span style={{ color: '#94a3b8' }}>Sales Price</span>
              <span style={{ color: '#e2e8f0' }} className="font-medium">{fmtCurrency(item.salesPrice)}</span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#94a3b8] mb-2">Customer Group Prices</div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                    {['Group', 'Price', 'Min Qty'].map(h => (
                      <th key={h} className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CUSTOMER_PRICES.map(cp => (
                    <tr key={cp.group} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td className="py-1.5" style={{ color: '#e2e8f0' }}>{cp.group}</td>
                      <td className="py-1.5 font-medium text-emerald-400">{fmtCurrency(cp.price)}</td>
                      <td className="py-1.5" style={{ color: '#94a3b8' }}>{cp.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'Inventory' && (
          <div className="space-y-4">
            <div className="flex gap-4 text-[12px]">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-[#94a3b8] mb-0.5">Reorder Point</div>
                <div className="font-semibold text-amber-400">{item.reorderPoint ?? 0}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-[#94a3b8] mb-0.5">Safety Stock</div>
                <div className="font-semibold text-indigo-400">{item.safetyStock ?? 0}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#94a3b8] mb-2">On Hand by Warehouse</div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                    {['Warehouse', 'On Hand', 'Reserved', 'Available'].map(h => (
                      <th key={h} className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WH_BREAKDOWN.map(wh => (
                    <tr key={wh.warehouse} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td className="py-1.5 font-mono text-[10px] text-indigo-300">{wh.warehouse}</td>
                      <td className="py-1.5 font-medium text-emerald-400">{wh.onHand}</td>
                      <td className="py-1.5 text-amber-400">{wh.reserved}</td>
                      <td className="py-1.5 text-[#e2e8f0]">{wh.onHand - wh.reserved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {(tab === 'BOM' || tab === 'Routes') && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <svg className="w-8 h-8 text-indigo-500/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[12px] text-[#94a3b8]">No {tab} records for this item.</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ItemsPage() {
  const [items, setItems]           = useState<Item[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('All')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/inventory/items')
      .then(r => r.json())
      .then(d => setItems(d.items ?? ITEMS))
      .catch(() => setItems(ITEMS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(it => {
    const matchCat = category === 'All' || it.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || it.itemNo.toLowerCase().includes(q) || it.description.toLowerCase().includes(q) || it.itemGroup.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const handleRowClick = useCallback((item: Item) => {
    setSelectedItem(prev => prev?.itemNo === item.itemNo ? null : item)
  }, [])

  return (
    <div style={{ background: '#0d0e24', minHeight: '100dvh' }} className="flex flex-col">
      <TopBar
        title="Items"
        breadcrumb={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Items', href: '/inventory/items' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              New
            </button>
            {['Copy Product', 'Item Statistics', 'Price'].map(label => (
              <button key={label} className="h-8 px-3 rounded text-[12px] font-medium border text-[#94a3b8] hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'transparent' }}>
                {label}
              </button>
            ))}
          </div>
        }
      />

      {/* Filter bar */}
      <div className="border-b px-5 py-3 flex flex-wrap items-center gap-3" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.12)' }}>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search item no. or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 px-3 rounded text-[12px] border outline-none w-52"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(99,102,241,0.25)', color: '#e2e8f0' }}
          />
        </div>
        <div className="flex items-center gap-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="h-7 px-3 rounded text-[11px] font-medium transition-colors"
              style={{
                background: category === c ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.05)',
                color: category === c ? '#e2e8f0' : '#94a3b8',
                border: `1px solid ${category === c ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}`,
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px]" style={{ color: '#94a3b8' }}>
          {loading ? 'Loading…' : `${filtered.length} items`}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[12px]" style={{ borderCollapse: 'collapse' }}>
          <thead className="sticky top-0" style={{ background: '#0d0e24', zIndex: 10 }}>
            <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <th className="w-8 px-3 py-3">
                <input type="checkbox" className="accent-indigo-500" />
              </th>
              {['Item No.', 'Description', 'Item Group', 'Category', 'UOM', 'Std Cost', 'Sales Price', 'On Hand', 'Lead Time'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider cursor-pointer hover:text-[#e2e8f0] transition-colors" style={{ color: '#94a3b8' }}>
                  {h}
                  <svg className="inline-block ml-1 w-2.5 h-2.5 opacity-40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr
                key={item.itemNo}
                onClick={() => handleRowClick(item)}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom: '1px solid rgba(99,102,241,0.07)',
                  background: selectedItem?.itemNo === item.itemNo
                    ? 'rgba(99,102,241,0.1)'
                    : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}
                onMouseEnter={e => { if (selectedItem?.itemNo !== item.itemNo) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.06)' }}
                onMouseLeave={e => { if (selectedItem?.itemNo !== item.itemNo) (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
              >
                <td className="px-3 py-2.5">
                  <input type="checkbox" className="accent-indigo-500" onClick={e => e.stopPropagation()} />
                </td>
                <td className="px-3 py-2.5 font-mono font-bold text-indigo-300 text-[11px]">{item.itemNo}</td>
                <td className="px-3 py-2.5 font-medium" style={{ color: '#e2e8f0' }}>{item.description}</td>
                <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>{item.itemGroup}</td>
                <td className="px-3 py-2.5"><CategoryChip cat={item.category} /></td>
                <td className="px-3 py-2.5 text-[#94a3b8]">{item.uom}</td>
                <td className="px-3 py-2.5 text-right font-medium" style={{ color: '#e2e8f0' }}>{fmtCurrency(item.standardCost)}</td>
                <td className="px-3 py-2.5 text-right font-medium text-emerald-400">{fmtCurrency(item.salesPrice)}</td>
                <td className="px-3 py-2.5 text-right" style={{ color: item.onHand === null ? '#94a3b8' : item.onHand === 0 ? '#ef4444' : '#e2e8f0' }}>
                  {item.onHand === null ? 'N/A' : item.onHand.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-[#94a3b8]">{item.leadTime ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t px-5 py-2 flex items-center justify-between" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.12)' }}>
        <span className="text-[11px]" style={{ color: '#94a3b8' }}>1–25 of 2,847 items</span>
        <div className="flex items-center gap-1">
          {['‹', '1', '2', '3', '…', '114', '›'].map((p, i) => (
            <button key={i} className="w-7 h-7 rounded text-[11px] font-medium transition-colors"
              style={{
                background: p === '1' ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: p === '1' ? '#e2e8f0' : '#94a3b8',
                border: `1px solid ${p === '1' ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}`,
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-in Detail Panel */}
      {selectedItem && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedItem(null)} />
          <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
        </>
      )}
    </div>
  )
}
