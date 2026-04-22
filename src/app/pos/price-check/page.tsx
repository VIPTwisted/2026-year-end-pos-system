'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ScanLine, Search } from 'lucide-react'

type PriceCheckProduct = {
  id: string
  sku: string
  barcode: string | null
  name: string
  salePrice: number
  taxable: boolean
  unit: string
  category: string | null
  imageUrl: string | null
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default function PriceCheckPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PriceCheckProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/pos/price-check?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json() as PriceCheckProduct[]
        setResults(data)
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchProducts(query)
    }, 280)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchProducts])

  // Refocus input after each result set loads
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus()
    }
  }, [loading])

  // Initial focus
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link
          href="/pos"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to POS
        </Link>
        <div className="flex-1" />
        <span className="text-[12px] text-gray-400 font-medium">Price Check</span>
      </div>

      {/* Search bar */}
      <div className="px-6 pt-10 pb-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <ScanLine className="w-5 h-5 text-[#0078d4]" />
            <p className="text-[14px] font-medium text-gray-500">Scan or search for an item</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="SKU, barcode, or product name…"
              className="w-full pl-12 pr-4 py-4 text-[18px] border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0078d4] transition-colors text-gray-800 placeholder:text-gray-300"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-6 pb-10">
        <div className="max-w-3xl mx-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#0078d4] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScanLine className="w-14 h-14 text-gray-200 mb-4" />
              <p className="text-[18px] font-semibold text-gray-400">No product found</p>
              <p className="text-[14px] text-gray-300 mt-1">Try scanning again or search by name</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map(product => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="text-gray-300">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="2" width="20" height="20" rx="2" />
                          <path d="M6 12h12M12 6v12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[17px] font-semibold text-gray-900 leading-tight truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[12px] font-mono text-gray-400">
                            SKU: {product.sku}
                          </span>
                          {product.barcode && (
                            <span className="text-[12px] font-mono text-gray-400">
                              · {product.barcode}
                            </span>
                          )}
                          {product.category && (
                            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#0078d4] border border-blue-100">
                              {product.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <div
                          className="font-bold tabular-nums leading-none"
                          style={{ fontSize: '2.25rem', color: '#0078d4' }}
                        >
                          {formatPrice(product.salePrice)}
                        </div>
                        <div className="text-[12px] text-gray-400 mt-1">
                          {product.taxable ? '+ tax' : 'Tax included'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
