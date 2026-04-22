'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Users, Box, ShoppingCart, User, Truck, Search } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

// ── Types ─────────────────────────────────────────────────────────────────────

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

function ResultIcon({ type }: { type: AnyResult['type'] }) {
  const cls = 'w-4 h-4 shrink-0'
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
      return <>{item.email || item.phone || 'Customer'}</>
    case 'product':
      return <>SKU {item.sku} · {formatCurrency(item.price)}{!item.isActive ? ' · Inactive' : ''}</>
    case 'order':
      return (
        <>
          {formatCurrency(item.total)} · {item.status} ·{' '}
          {new Date(item.date).toLocaleDateString()}
        </>
      )
    case 'employee':
      return <>{item.position}{item.department ? ` · ${item.department}` : ''}</>
    case 'supplier':
      return <>{item.contactName || item.email || 'Supplier'}</>
  }
}

// ── Group component ───────────────────────────────────────────────────────────

interface GroupProps {
  label: string
  icon: React.ReactNode
  items: AnyResult[]
}

function ResultGroup({ label, icon, items }: GroupProps) {
  if (items.length === 0) return null
  return (
    <section className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center gap-2">
        <span className="text-zinc-500">{icon}</span>
        <h2 className="text-[13px] font-semibold text-zinc-200">
          {label}{' '}
          <span className="text-zinc-500 font-normal">({items.length})</span>
        </h2>
      </div>
      <div className="divide-y divide-zinc-800/40">
        {items.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/40 transition-colors group"
          >
            <span className="text-zinc-600 group-hover:text-blue-400 transition-colors">
              <ResultIcon type={item.type} />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-zinc-100 truncate">
                {'orderNumber' in item ? item.orderNumber : item.name}
              </div>
              <div className="text-[12px] text-zinc-500 truncate">
                <ResultSubtitle item={item} />
              </div>
            </div>
            <span className="ml-auto text-[11px] text-zinc-700 group-hover:text-blue-500 transition-colors font-mono">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!q.trim()) {
      setData(null)
      return
    }
    setLoading(true)
    setError(null)
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20`)
      .then(r => {
        if (!r.ok) throw new Error('Search failed')
        return r.json() as Promise<SearchResponse>
      })
      .then(setData)
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false))
  }, [q])

  const totalCount = data?.totalCount ?? 0
  const results = data?.results

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Search Results"
        breadcrumb={[{ label: 'Home', href: '/' }]}
      />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-500" />
          {q ? (
            <p className="text-[14px] text-zinc-400">
              {loading
                ? 'Searching...'
                : `${totalCount} result${totalCount !== 1 ? 's' : ''} for `}
              {!loading && (
                <span className="text-zinc-100 font-semibold">&ldquo;{q}&rdquo;</span>
              )}
            </p>
          ) : (
            <p className="text-[14px] text-zinc-500">Enter a query to search.</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-[13px] text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 animate-pulse">
                <div className="h-3 w-24 bg-zinc-800 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-zinc-800/60 rounded" />
                  <div className="h-3 w-3/4 bg-zinc-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <>
            {totalCount === 0 ? (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-6 py-12 text-center">
                <Search className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-[14px] text-zinc-400">
                  No results for &ldquo;{q}&rdquo;
                </p>
                <p className="text-[12px] text-zinc-600 mt-1">
                  Try different keywords or check the spelling.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ResultGroup
                  label="Customers"
                  icon={<Users className="w-4 h-4" />}
                  items={results.customers}
                />
                <ResultGroup
                  label="Products"
                  icon={<Box className="w-4 h-4" />}
                  items={results.products}
                />
                <ResultGroup
                  label="Orders"
                  icon={<ShoppingCart className="w-4 h-4" />}
                  items={results.orders}
                />
                <ResultGroup
                  label="Employees"
                  icon={<User className="w-4 h-4" />}
                  items={results.employees}
                />
                <ResultGroup
                  label="Suppliers"
                  icon={<Truck className="w-4 h-4" />}
                  items={results.suppliers}
                />
              </div>
            )}
          </>
        )}

        {/* Empty state — no query */}
        {!loading && !data && !error && q === '' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-6 py-12 text-center">
            <Search className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-[14px] text-zinc-500">
              Search across customers, products, orders, employees, and suppliers.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
