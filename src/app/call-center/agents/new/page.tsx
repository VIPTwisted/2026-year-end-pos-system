'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Headphones } from 'lucide-react'

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    extension: '',
    isActive: true,
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const toggle = () => setForm(prev => ({ ...prev, isActive: !prev.isActive }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/call-center/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          extension: form.extension.trim() || undefined,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/call-center/agents')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Agent" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/call-center/agents" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Agents
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Headphones className="w-4 h-4 text-zinc-400" />
                Create Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Agent full name" className={inputCls} required />
                </div>

                <div>
                  <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="agent@company.com" className={inputCls} required />
                </div>

                <div>
                  <label className={labelCls}>Phone Extension</label>
                  <input type="text" value={form.extension} onChange={set('extension')} placeholder="e.g. 1021" className={inputCls} />
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-200">Active Agent</p>
                    <p className="text-xs text-zinc-500">Inactive agents are excluded from dashboards</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggle}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/call-center/agents">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Agent'}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
