'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface Props {
  categories: { id: string; name: string }[]
  currentSearch: string
  currentCategory: string
  currentStatus: string
  currentStoreId: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

export default function VisibilityFilters({
  categories,
  currentSearch,
  currentCategory,
  currentStatus,
  currentStoreId,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    const values: Record<string, string> = {
      search,
      storeId: currentStoreId,
      categoryId: currentCategory,
      status: currentStatus,
      ...overrides,
    }
    for (const [k, v] of Object.entries(values)) {
      if (v) params.set(k, v)
    }
    return `/inventory/visibility?${params.toString()}`
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => router.push(buildUrl({ search })))
  }

  function clearAll() {
    setSearch('')
    router.push('/inventory/visibility' + (currentStoreId ? `?storeId=${currentStoreId}` : ''))
  }

  const hasFilters = currentSearch || currentCategory || currentStatus

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SKU or name…"
          className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 w-52"
        />
      </form>

      {/* Category filter */}
      <select
        value={currentCategory}
        onChange={(e) => startTransition(() => router.push(buildUrl({ categoryId: e.target.value })))}
        className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => startTransition(() => router.push(buildUrl({ status: e.target.value })))}
        className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear filters
        </button>
      )}
    </div>
  )
}
