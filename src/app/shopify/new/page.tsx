'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'

export default function ShopifyNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    shopDomain: '',
    accessToken: '',
    storefrontToken: '',
    webhookSecret: '',
    syncProducts: true,
    syncCustomers: true,
    syncOrders: true,
    syncInventory: true,
  })

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to connect store'); return }
      router.push('/shopify')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Link href="/shopify" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Shopify
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            Connect Shopify Store
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your Shopify store credentials to begin syncing</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Shop Domain *</label>
            <input
              value={form.shopDomain}
              onChange={e => set('shopDomain', e.target.value)}
              placeholder="your-store.myshopify.com"
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Admin API Access Token</label>
            <input
              type="password"
              value={form.accessToken}
              onChange={e => set('accessToken', e.target.value)}
              placeholder="shpat_..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Storefront Token</label>
            <input
              type="password"
              value={form.storefrontToken}
              onChange={e => set('storefrontToken', e.target.value)}
              placeholder="Optional storefront API token"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Webhook Secret</label>
            <input
              type="password"
              value={form.webhookSecret}
              onChange={e => set('webhookSecret', e.target.value)}
              placeholder="Optional webhook HMAC secret"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800/50">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Sync Settings</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['syncProducts', 'Products'],
                ['syncCustomers', 'Customers'],
                ['syncOrders', 'Orders'],
                ['syncInventory', 'Inventory'],
              ] as [keyof typeof form, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => set(key, !form[key])}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 relative ${form[key] ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/shopify"
              className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Connect Store
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
