'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

type Classification = 'active' | 'slow_moving' | 'aging' | 'dead_stock'
type Tab = 'all' | Classification

export interface AgingItem {
  productId: string
  name: string
  sku: string
  category: string | null
  currentQty: number
  unitCost: number
  stockValue: number
  lastSoldDate: string | null
  daysSinceLastSold: number
  classification: Classification
  velocity30d: number
  velocity90d: number
}

interface Props {
  items: AgingItem[]
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'slow_moving', label: 'Slow Moving' },
  { key: 'aging', label: 'Aging' },
  { key: 'dead_stock', label: 'Dead Stock' },
]

const BADGE_STYLES: Record<Classification, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  slow_moving: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  aging: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  dead_stock: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const BADGE_LABELS: Record<Classification, string> = {
  active: 'Active',
  slow_moving: 'Slow Moving',
  aging: 'Aging',
  dead_stock: 'Dead Stock',
}

function relativeDate(isoDate: string | null): string {
  if (!isoDate) return 'Never'
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`
  return `${Math.floor(diff / 365)}y ago`
}

function markdownDiscount(item: AgingItem): string | null {
  if (item.classification === 'aging') return '10% off'
  if (item.classification === 'dead_stock') {
    return item.daysSinceLastSold > 365 ? '50% off' : '25% off'
  }
  return null
}

export function AgingTable({ items }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.classification === activeTab)

  const tabCount = (key: Tab) =>
    key === 'all' ? items.length : items.filter((i) => i.classification === key).length

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-zinc-800/50 pb-0">
        {TABS.map((tab) => {
          const count = tabCount(tab.key)
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-[13px] font-medium rounded-t transition-colors relative
                ${active
                  ? 'text-zinc-100 bg-[#16213e] border border-b-0 border-zinc-800/50'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-semibold
                  ${active ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800/60 text-zinc-600'}`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-zinc-600 text-[13px]">
            No items in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/40">
                  {[
                    'Product',
                    'SKU',
                    'Category',
                    'Qty',
                    'Unit Cost',
                    'Stock Value',
                    'Last Sold',
                    'Days',
                    '30d Sales',
                    'Classification',
                    'Markdown',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const discount = markdownDiscount(item)
                  return (
                    <tr
                      key={item.productId}
                      className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                    >
                      {/* Product */}
                      <td className="py-2.5 px-3 text-[13px]">
                        <span className="font-medium text-zinc-100">{item.name}</span>
                      </td>
                      {/* SKU */}
                      <td className="py-2.5 px-3 text-[13px] font-mono text-zinc-500 whitespace-nowrap">
                        {item.sku}
                      </td>
                      {/* Category */}
                      <td className="py-2.5 px-3 text-[13px] text-zinc-400 whitespace-nowrap">
                        {item.category ?? <span className="text-zinc-600">—</span>}
                      </td>
                      {/* Qty */}
                      <td className="py-2.5 px-3 text-[13px] text-right tabular-nums font-semibold text-zinc-100 whitespace-nowrap">
                        {item.currentQty}
                      </td>
                      {/* Unit Cost */}
                      <td className="py-2.5 px-3 text-[13px] text-right tabular-nums text-zinc-400 whitespace-nowrap">
                        {formatCurrency(item.unitCost)}
                      </td>
                      {/* Stock Value */}
                      <td className="py-2.5 px-3 text-[13px] text-right tabular-nums font-semibold text-zinc-200 whitespace-nowrap">
                        {formatCurrency(item.stockValue)}
                      </td>
                      {/* Last Sold */}
                      <td className="py-2.5 px-3 text-[13px] text-zinc-400 whitespace-nowrap">
                        {relativeDate(item.lastSoldDate)}
                      </td>
                      {/* Days */}
                      <td className="py-2.5 px-3 text-[13px] tabular-nums text-right text-zinc-400 whitespace-nowrap">
                        {item.daysSinceLastSold}
                      </td>
                      {/* 30d Sales */}
                      <td className="py-2.5 px-3 text-[13px] tabular-nums text-right text-zinc-400 whitespace-nowrap">
                        {item.velocity30d}
                      </td>
                      {/* Classification badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${BADGE_STYLES[item.classification]}`}
                        >
                          {BADGE_LABELS[item.classification]}
                        </span>
                      </td>
                      {/* Markdown suggestion */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {discount ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 text-[11px] font-semibold">
                            {discount}
                          </span>
                        ) : (
                          <span className="text-zinc-700 text-[12px]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      <p className="text-[12px] text-zinc-600 px-1">
        Showing {filtered.length} of {items.length} items
      </p>
    </div>
  )
}
