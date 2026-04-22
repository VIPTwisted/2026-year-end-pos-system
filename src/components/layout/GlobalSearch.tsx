'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Users,
  Box,
  ShoppingCart,
  User,
  Truck,
  X,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface CustomerResult {
  id: string
  name: string
  email: string
  phone: string
  type: 'customer'
  href: string
}

interface ProductResult {
  id: string
  name: string
  sku: string
  price: number
  isActive: boolean
  type: 'product'
  href: string
}

interface OrderResult {
  id: string
  orderNumber: string
  total: number
  date: string
  status: string
  type: 'order'
  href: string
}

interface EmployeeResult {
  id: string
  name: string
  position: string
  department: string
  type: 'employee'
  href: string
}

interface SupplierResult {
  id: string
  name: string
  contactName: string
  email: string
  type: 'supplier'
  href: string
}

type AnyResult =
  | CustomerResult
  | ProductResult
  | OrderResult
  | EmployeeResult
  | SupplierResult

interface SearchResults {
  customers: CustomerResult[]
  products: ProductResult[]
  orders: OrderResult[]
  employees: EmployeeResult[]
  suppliers: SupplierResult[]
}

interface SearchResponse {
  query: string
  results: SearchResults
  totalCount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function buildFlat(results: SearchResults): AnyResult[] {
  return [
    ...results.customers,
    ...results.products,
    ...results.orders,
    ...results.employees,
    ...results.suppliers,
  ]
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultIcon({ type }: { type: AnyResult['type'] }) {
  const cls = 'w-3.5 h-3.5 shrink-0'
  switch (type) {
    case 'customer': return <Users className={cls} />
    case 'product':  return <Box className={cls} />
    case 'order':    return <ShoppingCart className={cls} />
    case 'employee': return <User className={cls} />
    case 'supplier': return <Truck className={cls} />
  }
}

function ResultSubtitle({ item }: { item: AnyResult }) {
  switch (item.type) {
    case 'customer':
      return <span>{item.email || item.phone || 'Customer'}</span>
    case 'product':
      return <span>SKU {item.sku} · {formatCurrency(item.price)}</span>
    case 'order':
      return (
        <span>
          {formatCurrency(item.total)} · {item.status} ·{' '}
          {new Date(item.date).toLocaleDateString()}
        </span>
      )
    case 'employee':
      return <span>{item.position}{item.department ? ` · ${item.department}` : ''}</span>
    case 'supplier':
      return <span>{item.contactName || item.email || 'Supplier'}</span>
  }
}

interface GroupProps {
  label: string
  items: AnyResult[]
  flatItems: AnyResult[]
  activeIdx: number
  onHover: (idx: number) => void
  onSelect: (href: string) => void
}

function ResultGroup({ label, items, flatItems, activeIdx, onHover, onSelect }: GroupProps) {
  if (items.length === 0) return null
  return (
    <div>
      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-900/60">
        {label}
      </div>
      {items.map(item => {
        const flatIdx = flatItems.indexOf(item)
        const isActive = flatIdx === activeIdx
        return (
          <button
            key={item.id}
            onMouseEnter={() => onHover(flatIdx)}
            onClick={() => onSelect(item.href)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors
              ${isActive
                ? 'bg-blue-600/20 text-zinc-100'
                : 'text-zinc-300 hover:bg-zinc-800/60'}`}
          >
            <span className={isActive ? 'text-blue-400' : 'text-zinc-500'}>
              <ResultIcon type={item.type} />
            </span>
            <div className="min-w-0">
              <div className="text-[12px] font-medium truncate">{item.type === 'order' ? item.orderNumber : item.name}</div>
              <div className="text-[11px] text-zinc-500 truncate">
                <ResultSubtitle item={item} />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [activeIdx, setActiveIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch with debounce
  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`)
      .then(r => {
        if (!r.ok) throw new Error('search failed')
        return r.json() as Promise<SearchResponse>
      })
      .then(d => {
        setData(d)
        setActiveIdx(-1)
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  // Outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const flatItems = data ? buildFlat(data.results) : []

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
    setData(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    switch (e.key) {
      case 'Escape':
        setOpen(false)
        inputRef.current?.blur()
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, flatItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIdx >= 0 && flatItems[activeIdx]) {
          navigate(flatItems[activeIdx].href)
        } else if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`)
          setOpen(false)
        }
        break
    }
  }

  const showDropdown = open && (loading || (data !== null && data.totalCount > 0))

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search everything..."
          className={`pl-8 pr-7 h-7 text-[12px] bg-zinc-900/60 border border-zinc-800/60
            placeholder:text-zinc-600 focus:border-blue-600/60 focus:outline-none
            rounded text-zinc-200 transition-all duration-200
            ${open ? 'w-64' : 'w-48'}`}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setData(null); setOpen(false) }}
            className="absolute right-2 text-zinc-600 hover:text-zinc-400"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-1 right-0 w-80 bg-[#16213e] border border-zinc-800/60 rounded-lg shadow-2xl z-50 overflow-hidden">
          {loading ? (
            <div className="px-3 py-4 text-center text-[12px] text-zinc-500">
              Searching...
            </div>
          ) : data && data.totalCount === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-zinc-500">
              No results for &ldquo;{data.query}&rdquo;
            </div>
          ) : data ? (
            <>
              <div className="max-h-[400px] overflow-y-auto">
                <ResultGroup
                  label="Customers"
                  items={data.results.customers}
                  flatItems={flatItems}
                  activeIdx={activeIdx}
                  onHover={setActiveIdx}
                  onSelect={navigate}
                />
                <ResultGroup
                  label="Products"
                  items={data.results.products}
                  flatItems={flatItems}
                  activeIdx={activeIdx}
                  onHover={setActiveIdx}
                  onSelect={navigate}
                />
                <ResultGroup
                  label="Orders"
                  items={data.results.orders}
                  flatItems={flatItems}
                  activeIdx={activeIdx}
                  onHover={setActiveIdx}
                  onSelect={navigate}
                />
                <ResultGroup
                  label="Employees"
                  items={data.results.employees}
                  flatItems={flatItems}
                  activeIdx={activeIdx}
                  onHover={setActiveIdx}
                  onSelect={navigate}
                />
                <ResultGroup
                  label="Suppliers"
                  items={data.results.suppliers}
                  flatItems={flatItems}
                  activeIdx={activeIdx}
                  onHover={setActiveIdx}
                  onSelect={navigate}
                />
              </div>
              <div className="border-t border-zinc-800/60 px-3 py-2">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`)
                    setOpen(false)
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View all results for &ldquo;{query}&rdquo; →
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
