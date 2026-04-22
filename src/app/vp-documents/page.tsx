'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen, ExternalLink, AlertTriangle } from 'lucide-react'

type Doc = {
  id: string; name: string; docType: string; url: string | null; expiresAt: string | null; status: string
  vendor: { id: string; name: string; vendorNumber: string }
}

const FILTERS = ['all', 'expiring-soon', 'expired']

function DocStatusBadge({ d }: { d: Doc }) {
  const now = new Date()
  if (!d.expiresAt || d.status === 'active') {
    const exp = d.expiresAt ? new Date(d.expiresAt) : null
    if (exp) {
      const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      if (diff < 0) return <span className="text-xs px-2 py-0.5 rounded bg-red-500/15 text-red-400">Expired</span>
      if (diff <= 30) return <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">Expiring Soon</span>
    }
    return <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Active</span>
  }
  if (d.status === 'expired') return <span className="text-xs px-2 py-0.5 rounded bg-red-500/15 text-red-400">Expired</span>
  if (d.status === 'pending-renewal') return <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">Pending Renewal</span>
  return <span className="text-xs px-2 py-0.5 rounded bg-zinc-700/40 text-zinc-400 capitalize">{d.status}</span>
}

export default function VpDocumentsPage() {
  const [docs, setDocs]     = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    // Load all vendor documents by fetching all vendors then their docs
    const vRes = await fetch('/api/vp-vendors')
    const vendors = await vRes.json()

    const allDocs: Doc[] = []
    await Promise.all(
      vendors.map(async (v: { id: string; name: string; vendorNumber: string }) => {
        const dRes = await fetch(`/api/vp-vendors/${v.id}/documents`)
        const ds = await dRes.json()
        ds.forEach((d: Omit<Doc, 'vendor'>) => allDocs.push({ ...d, vendor: v }))
      })
    )

    allDocs.sort((a, b) => (a.expiresAt ?? '9999').localeCompare(b.expiresAt ?? '9999'))
    setDocs(allDocs)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const now = new Date()
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const filtered = docs.filter(d => {
    if (filter === 'all') return true
    const exp = d.expiresAt ? new Date(d.expiresAt) : null
    if (filter === 'expired') return exp && exp < now
    if (filter === 'expiring-soon') return exp && exp >= now && exp <= thirtyDays
    return true
  })

  async function deleteDoc(vendorId: string, docId: string) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/vp-vendors/${vendorId}/documents/${docId}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <TopBar title="Vendor Documents" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Vendor Documents</h2>
          {filtered.some(d => {
            const exp = d.expiresAt ? new Date(d.expiresAt) : null
            return exp && exp <= thirtyDays
          }) && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {docs.filter(d => { const exp = d.expiresAt ? new Date(d.expiresAt) : null; return exp && exp >= now && exp <= thirtyDays }).length} expiring within 30 days
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-zinc-800">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                filter === f ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >{f.replace(/-/g,' ')}</button>
          ))}
        </div>

        {loading ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-zinc-600">
              <FolderOpen className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No documents found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Vendor</th>
                  <th className="text-left pb-3 font-medium">Document Name</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-left pb-3 font-medium">Expires</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map(d => {
                  const exp = d.expiresAt ? new Date(d.expiresAt) : null
                  const isExpired = exp && exp < now
                  return (
                    <tr key={d.id} className="hover:bg-zinc-900/30">
                      <td className="py-3 pr-4">
                        <Link href={`/vp-vendors/${d.vendor.id}`} className="text-zinc-100 hover:text-blue-400 text-sm font-medium">{d.vendor.name}</Link>
                        <div className="text-xs text-zinc-500">{d.vendor.vendorNumber}</div>
                      </td>
                      <td className="py-3 pr-4 text-zinc-100">{d.name}</td>
                      <td className="py-3 pr-4 text-zinc-400 capitalize">{d.docType}</td>
                      <td className={`py-3 pr-4 text-xs ${isExpired ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>
                        {exp ? exp.toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-4 text-center"><DocStatusBadge d={d} /></td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {d.url && (
                            <a href={d.url} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline">
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />View
                              </Button>
                            </a>
                          )}
                          <button onClick={() => deleteDoc(d.vendor.id, d.id)}
                            className="text-xs text-red-500 hover:text-red-400 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
