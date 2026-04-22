'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description: string
  module: string
  url: string
}

export function HelpSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/help/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.articles ?? [])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search help articles, modules, shortcuts..."
          className="w-full h-13 pl-12 pr-12 py-4 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-500">No results for &quot;{query}&quot;</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              <div className="px-4 py-2 text-xs text-zinc-500 font-medium uppercase tracking-wide border-b border-zinc-800">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.slice(0, 8).map(article => (
                <Link
                  key={article.id}
                  href={article.url}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0 group-hover:text-blue-400 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-200 font-medium group-hover:text-zinc-100">{article.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{article.description}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{article.module}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
