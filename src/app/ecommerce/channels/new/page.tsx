'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Wifi } from 'lucide-react'

export default function NewChannelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    domain: '',
    description: '',
    currency: 'USD',
    language: 'en-US',
    allowGuestCheckout: true,
    requiresEmailVerification: false,
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const toggle = (k: 'allowGuestCheckout' | 'requiresEmailVerification') =>
    setForm(prev => ({ ...prev, [k]: !prev[k] }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ecommerce/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          domain: form.domain.trim() || undefined,
          description: form.description.trim() || undefined,
          currency: form.currency,
          language: form.language,
          allowGuestCheckout: form.allowGuestCheckout,
          requiresEmailVerification: form.requiresEmailVerification,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/ecommerce/channels')
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
      <TopBar title="New Channel" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/ecommerce/channels" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Channels
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="w-4 h-4 text-zinc-400" />
                Create E-Commerce Channel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Channel Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Main Website" className={inputCls} required />
                </div>

                <div>
                  <label className={labelCls}>Domain</label>
                  <input type="text" value={form.domain} onChange={set('domain')} placeholder="shop.example.com" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={set('description')} placeholder="Channel description…" rows={2} className={inputCls + ' resize-none'} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Currency</label>
                    <select value={form.currency} onChange={set('currency')} className={inputCls}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Language</label>
                    <select value={form.language} onChange={set('language')} className={inputCls}>
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div>
                      <p className="text-sm text-zinc-200">Allow Guest Checkout</p>
                      <p className="text-xs text-zinc-500">Customers can order without an account</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle('allowGuestCheckout')}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.allowGuestCheckout ? 'bg-blue-600' : 'bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.allowGuestCheckout ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div>
                      <p className="text-sm text-zinc-200">Require Email Verification</p>
                      <p className="text-xs text-zinc-500">New accounts must verify email before ordering</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle('requiresEmailVerification')}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.requiresEmailVerification ? 'bg-blue-600' : 'bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.requiresEmailVerification ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/ecommerce/channels">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Channel'}
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
