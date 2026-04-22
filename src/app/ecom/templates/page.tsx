'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Search, LayoutTemplate, Filter } from 'lucide-react'

interface ContentTemplate {
  id: string
  templateId: string
  templateName: string
  templateType: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  page: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  email: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  banner: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  product: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  category: 'bg-rose-500/15 text-rose-300 border border-rose-500/25',
  checkout: 'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  landing: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
}

const TEMPLATE_ICONS: Record<string, string> = {
  page: 'PG',
  email: 'EM',
  banner: 'BN',
  product: 'PD',
  category: 'CT',
  checkout: 'CK',
  landing: 'LP',
}

// Fake usage counts for display (real system would track this)
function mockUsage(id: string): number {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return hash % 24
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [cloning, setCloning] = useState<string | null>(null)
  const [clonedMsg, setClonedMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ecommerce/templates')
      .then(r => r.json())
      .then(d => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const types = ['All', ...Array.from(new Set(templates.map(t => t.templateType))).sort()]

  const filtered = templates.filter(t => {
    const matchType = typeFilter === 'All' || t.templateType === typeFilter
    const q = search.toLowerCase()
    return matchType && (!q || t.templateName.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q))
  })

  async function handleClone(templateId: string, name: string) {
    setCloning(templateId)
    await fetch('/api/ecommerce/templates/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceTemplateId: templateId, newName: `${name} (Copy)` }),
    }).catch(() => {})
    setCloning(null)
    setClonedMsg(templateId)
    setTimeout(() => setClonedMsg(null), 2500)
    // Refresh
    fetch('/api/ecommerce/templates')
      .then(r => r.json())
      .then(d => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {})
  }

  const active = templates.filter(t => t.isActive).length
  const systemCount = templates.filter(t => t.isSystem).length

  return (
    <>
      <TopBar title="Template Library" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Templates', value: templates.length, color: 'text-zinc-100' },
            { label: 'Active', value: active, color: 'text-emerald-400' },
            { label: 'System Templates', value: systemCount, color: 'text-blue-400' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{k.label}</p>
                <p className={`text-3xl font-bold ${k.color}`}>{loading ? '—' : k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-zinc-600 mr-1" />
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${typeFilter === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutTemplate className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No templates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(tmpl => {
              const usage = mockUsage(tmpl.id)
              const icon = TEMPLATE_ICONS[tmpl.templateType] ?? tmpl.templateType.slice(0, 2).toUpperCase()
              const colorClass = TYPE_COLORS[tmpl.templateType] ?? 'bg-zinc-700 text-zinc-300'
              return (
                <div key={tmpl.id} className={`rounded-xl border bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col ${!tmpl.isActive ? 'opacity-50' : ''}`}>
                  {/* Preview placeholder */}
                  <div className="h-28 bg-zinc-800/60 border-b border-zinc-800 flex items-center justify-center relative">
                    <div className="w-14 h-14 rounded-xl bg-zinc-700/60 flex items-center justify-center">
                      <span className="text-xl font-bold font-mono text-zinc-400">{icon}</span>
                    </div>
                    {tmpl.isSystem && (
                      <span className="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/25">System</span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{tmpl.templateName}</p>
                        {tmpl.description && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{tmpl.description}</p>}
                      </div>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded capitalize ${colorClass}`}>{tmpl.templateType}</span>
                    </div>

                    <div className="mt-auto pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-600">{usage} page{usage !== 1 ? 's' : ''} using</span>
                      <button
                        onClick={() => handleClone(tmpl.id, tmpl.templateName)}
                        disabled={cloning === tmpl.id}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${clonedMsg === tmpl.id ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'} disabled:opacity-40`}>
                        <Copy className="w-3 h-3" />
                        {clonedMsg === tmpl.id ? 'Cloned!' : cloning === tmpl.id ? 'Cloning...' : 'Clone'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
