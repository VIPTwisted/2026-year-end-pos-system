'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Monitor, Plus, RefreshCw, ChevronRight } from 'lucide-react'

interface Terminal {
  id: string
  terminalId: string
  storeId: string | null
  storeName: string | null
  name: string
  hardwareProfile: string | null
  screenLayout: string | null
  status: string
  createdAt: string
}

export default function TerminalsPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/terminals')
      const data = await res.json()
      setTerminals(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <TopBar title="POS Terminals" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">POS Terminals</h1>
            <p className="text-sm text-zinc-500">{terminals.length} terminal(s) configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/commerce/terminals/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Terminal
            </Link>
          </div>
        </div>

        {loading ? (
          <Card><CardContent className="flex items-center justify-center py-16 text-zinc-600">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
          </CardContent></Card>
        ) : terminals.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Monitor className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No terminals configured yet.</p>
            <Link href="/commerce/terminals/new" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">
              Create your first terminal
            </Link>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-3">Terminal ID</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Store</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Name</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Hardware Profile</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Screen Layout</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
                      <th className="text-right px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {terminals.map(t => (
                      <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-mono text-xs bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded">{t.terminalId}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{t.storeName ?? t.storeId ?? '—'}</td>
                        <td className="px-4 py-3 font-medium text-zinc-200">{t.name}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{t.hardwareProfile ?? '—'}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{t.screenLayout ?? '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            t.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
                          }`}>{t.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
