'use client'
import { useEffect, useState, useRef, useCallback, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Play, Square, ChevronUp, ChevronDown, Plus, X, Zap,
  Star, MessageCircle, Timer, Trophy, ShoppingBag, DollarSign, Eye, Radio
} from 'lucide-react'

interface LiveShow {
  id: string
  title: string
  hostName: string | null
  platform: string
  status: string
  scheduledAt: string | null
  startedAt: string | null
  peakViewers: number
  totalViewers: number
  totalOrders: number
  totalRevenue: number
  products: LiveShowProduct[]
  events: LiveShowEvent[]
}

interface LiveShowProduct {
  id: string
  productName: string
  sku: string | null
  price: number
  salePrice: number | null
  imageUrl: string | null
  status: string
  unitsSold: number
  position: number
}

interface LiveShowEvent {
  id: string
  eventType: string
  data: string
  createdAt: string
}

interface FlashSale {
  id: string
  name: string
  productName: string
  salePrice: number
  quantity: number
  soldQty: number
  duration: number
  status: string
  startedAt: string | null
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  tiktok: 'bg-zinc-700 text-zinc-200 border-zinc-600',
  facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  custom: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

function EventRow({ event }: { event: LiveShowEvent }) {
  let data: Record<string, unknown> = {}
  try { data = JSON.parse(event.data) } catch {}
  const time = new Date(event.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })

  if (event.eventType === 'product-featured') return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
      <span className="text-blue-400 text-sm">🎥</span>
      <div className="flex-1 min-w-0">
        <span className="text-blue-300 text-xs font-medium">Now featuring: </span>
        <span className="text-blue-200 text-xs">{data.productName as string}</span>
        {data.price && <span className="text-blue-400 text-xs ml-1">— {fmt(data.price as number)}</span>}
      </div>
      <span className="text-zinc-600 text-xs shrink-0">{time}</span>
    </div>
  )
  if (event.eventType === 'order-placed') return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <span className="text-emerald-400 text-sm">✓</span>
      <div className="flex-1"><span className="text-emerald-300 text-xs">Order placed</span></div>
      <span className="text-zinc-600 text-xs shrink-0">{time}</span>
    </div>
  )
  if (event.eventType === 'viewer-spike') return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
      <span className="text-purple-400 text-sm">📈</span>
      <div className="flex-1"><span className="text-purple-300 text-xs">Viewer spike</span></div>
      <span className="text-zinc-600 text-xs shrink-0">{time}</span>
    </div>
  )
  if (event.eventType === 'flash-sale') return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <span className="text-amber-400 text-sm">⚡</span>
      <div className="flex-1">
        <span className="text-amber-300 text-xs font-medium">Flash sale started: </span>
        <span className="text-amber-200 text-xs">{data.productName as string}</span>
      </div>
      <span className="text-zinc-600 text-xs shrink-0">{time}</span>
    </div>
  )
  if (event.eventType === 'comment-pinned') return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800 border border-zinc-700">
      <span className="text-zinc-400 text-sm">📌</span>
      <div className="flex-1"><span className="text-zinc-300 text-xs">Comment pinned{data.comment ? `: "${data.comment}"` : ''}</span></div>
      <span className="text-zinc-600 text-xs shrink-0">{time}</span>
    </div>
  )
  if (event.eventType === 'countdown-started') return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800 border border-zinc-700">
      <span className="text-zinc-400 text-sm">⏱</span>
      <div className="flex-1"><span className="text-zinc-300 text-xs">Countdown started</span></div>
      <span className="text-zinc-600 text-xs shrink-0">{time}</span>
    </div>
  )
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-800">
      <span className="text-zinc-500 text-xs mt-0.5">{event.eventType}</span>
      <span className="text-zinc-600 text-xs shrink-0 ml-auto">{time}</span>
    </div>
  )
}

function FlashCountdown({ sale }: { sale: FlashSale }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!sale.startedAt || sale.status !== 'active') return
    const end = new Date(sale.startedAt).getTime() + sale.duration * 1000
    const update = () => {
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setRemaining(left)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [sale.startedAt, sale.duration, sale.status])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = sale.duration > 0 ? (remaining / sale.duration) * 100 : 0

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-amber-300 font-medium truncate">{sale.productName}</span>
        <span className={`text-sm font-mono font-bold ${remaining < 60 ? 'text-red-400' : 'text-amber-400'}`}>
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1 mb-1">
        <div className="bg-amber-500 h-1 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{sale.soldQty}/{sale.quantity} sold</span>
        <span>{fmt(sale.salePrice)}</span>
      </div>
    </div>
  )
}

export default function ShowControlRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [show, setShow] = useState<LiveShow | null>(null)
  const [events, setEvents] = useState<LiveShowEvent[]>([])
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showFlashForm, setShowFlashForm] = useState(false)
  const [productForm, setProductForm] = useState({ productName: '', sku: '', price: '', salePrice: '', imageUrl: '' })
  const [flashForm, setFlashForm] = useState({ name: '', productName: '', originalPrice: '', salePrice: '', quantity: '10', duration: '300' })
  const [viewerCount, setViewerCount] = useState(0)
  const eventsFeedRef = useRef<HTMLDivElement>(null)

  const loadShow = useCallback(async () => {
    const data = await fetch(`/api/live/shows/${id}`).then(r => r.json())
    setShow(data)
    if (loading) setLoading(false)
  }, [id, loading])

  const loadEvents = useCallback(async () => {
    const data = await fetch(`/api/live/shows/${id}/events`).then(r => r.json())
    setEvents(data)
    if (eventsFeedRef.current) eventsFeedRef.current.scrollTop = 0
  }, [id])

  const loadFlashSales = useCallback(async () => {
    const data = await fetch(`/api/live/flash-sales?status=active`).then(r => r.json())
    setFlashSales(data.filter((s: FlashSale) => true))
  }, [])

  useEffect(() => {
    loadShow()
    loadEvents()
    loadFlashSales()
  }, [id])

  useEffect(() => {
    const interval = setInterval(() => {
      loadEvents()
      if (show?.status === 'live') {
        setViewerCount(v => Math.max(0, v + Math.floor(Math.random() * 21) - 10))
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [show?.status, loadEvents])

  useEffect(() => {
    if (show?.status === 'live' && viewerCount === 0) {
      setViewerCount(show.totalViewers || Math.floor(Math.random() * 200) + 50)
    }
  }, [show?.status])

  async function handleGoLive() {
    await fetch(`/api/live/shows/${id}/start`, { method: 'POST' })
    loadShow()
  }

  async function handleEndShow() {
    await fetch(`/api/live/shows/${id}/end`, { method: 'POST' })
    loadShow()
  }

  async function handleFeature(productId: string) {
    await fetch(`/api/live/shows/${id}/feature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    loadShow()
    loadEvents()
  }

  async function handleProductStatus(pid: string, status: string) {
    await fetch(`/api/live/shows/${id}/products/${pid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadShow()
  }

  async function handleMoveProduct(pid: string, dir: 'up' | 'down') {
    if (!show) return
    const sorted = [...show.products].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(p => p.id === pid)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    await Promise.all([
      fetch(`/api/live/shows/${id}/products/${sorted[idx].id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: sorted[swapIdx].position }),
      }),
      fetch(`/api/live/shows/${id}/products/${sorted[swapIdx].id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: sorted[idx].position }),
      }),
    ])
    loadShow()
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/live/shows/${id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm),
    })
    setProductForm({ productName: '', sku: '', price: '', salePrice: '', imageUrl: '' })
    setShowAddProduct(false)
    loadShow()
  }

  async function addEvent(eventType: string, data: Record<string, unknown> = {}) {
    await fetch(`/api/live/shows/${id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, data }),
    })
    loadEvents()
  }

  async function handleStartFlashSale(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/live/flash-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...flashForm, showId: id }),
    })
    const sale = await res.json()
    await fetch(`/api/live/flash-sales/${sale.id}/start`, { method: 'POST' })
    setFlashForm({ name: '', productName: '', originalPrice: '', salePrice: '', quantity: '10', duration: '300' })
    setShowFlashForm(false)
    loadFlashSales()
    loadEvents()
  }

  if (loading || !show) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-zinc-500 text-sm">Loading control room...</div>
    </div>
  )

  const featured = show.products.find(p => p.status === 'featured')
  const sortedProducts = [...show.products].sort((a, b) => a.position - b.position)
  const activeFlash = flashSales.filter(s => s.status === 'active')
  const revenue = show.products.reduce((sum, p) => sum + (p.salePrice ?? p.price) * p.unitsSold, 0)

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <div className="flex items-center gap-4 px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <Link href="/live/shows" className="text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="font-semibold text-zinc-100 text-sm">{show.title}</h1>
          <span className={`px-2 py-0.5 rounded border text-xs capitalize ${PLATFORM_COLORS[show.platform] ?? PLATFORM_COLORS.custom}`}>
            {show.platform}
          </span>
          {show.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              LIVE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 capitalize">{show.status}</span>
          )}
          {show.status === 'live' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs">
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="font-mono">{viewerCount.toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {show.status === 'scheduled' && (
            <button onClick={handleGoLive}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
              <Radio className="w-4 h-4" /> Go Live
            </button>
          )}
          {show.status === 'live' && (
            <button onClick={handleEndShow}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm rounded-lg transition-colors">
              <Square className="w-4 h-4" /> End Show
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400">Product Queue</span>
            <button onClick={() => setShowAddProduct(!showAddProduct)}
              className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {showAddProduct && (
            <form onSubmit={handleAddProduct} className="p-3 border-b border-zinc-800 space-y-2 bg-zinc-800/50">
              <input required placeholder="Product name *" value={productForm.productName}
                onChange={e => setProductForm(f => ({ ...f, productName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
              <input placeholder="SKU" value={productForm.sku}
                onChange={e => setProductForm(f => ({ ...f, sku: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-1.5">
                <input required type="number" step="0.01" placeholder="Price *" value={productForm.price}
                  onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                <input type="number" step="0.01" placeholder="Sale price" value={productForm.salePrice}
                  onChange={e => setProductForm(f => ({ ...f, salePrice: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <input placeholder="Image URL" value={productForm.imageUrl}
                onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setShowAddProduct(false)}
                  className="flex-1 py-1 text-xs border border-zinc-700 text-zinc-400 rounded hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit"
                  className="flex-1 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">Add</button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800">
            {sortedProducts.length === 0 ? (
              <div className="p-4 text-center text-zinc-600 text-xs">No products queued</div>
            ) : sortedProducts.map((product, i) => (
              <div key={product.id} className={`p-3 ${product.status === 'featured' ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''}`}>
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-zinc-600 text-xs">IMG</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-100 truncate">{product.productName}</div>
                    {product.sku && <div className="text-xs text-zinc-600">{product.sku}</div>}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {product.salePrice ? (
                        <>
                          <span className="text-xs font-semibold text-emerald-400">{fmt(product.salePrice)}</span>
                          <span className="text-xs text-zinc-600 line-through">{fmt(product.price)}</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-zinc-300">{fmt(product.price)}</span>
                      )}
                    </div>
                    {product.status === 'featured' && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded mt-1 inline-block">Featured</span>
                    )}
                    {product.status === 'sold-out' && (
                      <span className="text-xs px-1.5 py-0.5 bg-zinc-700 text-zinc-400 rounded mt-1 inline-block">Sold Out</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => handleMoveProduct(product.id, 'up')} disabled={i === 0}
                      className="w-5 h-5 flex items-center justify-center text-zinc-600 hover:text-zinc-400 disabled:opacity-20 transition-colors">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleMoveProduct(product.id, 'down')} disabled={i === sortedProducts.length - 1}
                      className="w-5 h-5 flex items-center justify-center text-zinc-600 hover:text-zinc-400 disabled:opacity-20 transition-colors">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {product.status !== 'featured' && product.status !== 'sold-out' && show.status === 'live' && (
                    <button onClick={() => handleFeature(product.id)}
                      className="flex-1 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-600/30 transition-colors">
                      Feature Now
                    </button>
                  )}
                  {product.status !== 'sold-out' && (
                    <button onClick={() => handleProductStatus(product.id, 'sold-out')}
                      className="flex-1 py-1 text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors">
                      Sold Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
            <span className="text-xs font-semibold text-zinc-400">Live Activity Feed</span>
            <div className="flex gap-1">
              <button onClick={() => addEvent('comment-pinned', { comment: 'Check this out!' })}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors">
                <MessageCircle className="w-3 h-3" /> Pin Comment
              </button>
              <button onClick={() => addEvent('countdown-started', {})}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors">
                <Timer className="w-3 h-3" /> Countdown
              </button>
              <button onClick={() => addEvent('viewer-spike', { count: viewerCount })}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors">
                📈 Viewer Spike
              </button>
              <button onClick={() => addEvent('order-placed', { manual: true })}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors">
                <Trophy className="w-3 h-3" /> Announce Winner
              </button>
            </div>
          </div>
          <div ref={eventsFeedRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {events.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Radio className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-600 text-sm">No events yet</p>
                  {show.status === 'scheduled' && (
                    <p className="text-zinc-700 text-xs mt-1">Go live to start streaming</p>
                  )}
                </div>
              </div>
            ) : events.map(event => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>

        <div className="w-64 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-zinc-800">
            <div className="text-xs font-semibold text-zinc-400 mb-2">Show Stats</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Eye className="w-3 h-3 text-purple-400" /> Viewers
                </div>
                <span className="text-sm font-mono font-semibold text-zinc-100">{viewerCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <ShoppingBag className="w-3 h-3 text-blue-400" /> Orders
                </div>
                <span className="text-sm font-mono font-semibold text-zinc-100">{show.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Revenue
                </div>
                <span className="text-sm font-mono font-semibold text-emerald-400">{fmt(show.totalRevenue || revenue)}</span>
              </div>
            </div>
          </div>

          {featured && (
            <div className="p-3 border-b border-zinc-800">
              <div className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Now Featured
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="w-full h-20 bg-zinc-800 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                  {featured.imageUrl ? (
                    <img src={featured.imageUrl} alt="" className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <span className="text-zinc-600 text-xs">No image</span>
                  )}
                </div>
                <div className="text-xs font-semibold text-zinc-100 mb-1">{featured.productName}</div>
                <div className="flex items-center gap-2">
                  {featured.salePrice ? (
                    <>
                      <span className="text-sm font-bold text-emerald-400">{fmt(featured.salePrice)}</span>
                      <span className="text-xs text-zinc-600 line-through">{fmt(featured.price)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-zinc-200">{fmt(featured.price)}</span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{featured.unitsSold} sold this show</div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400">Flash Sales</span>
              <button onClick={() => setShowFlashForm(!showFlashForm)}
                className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {showFlashForm && (
              <form onSubmit={handleStartFlashSale} className="p-3 border-b border-zinc-800 space-y-2 bg-zinc-800/30">
                <input required placeholder="Name *" value={flashForm.name}
                  onChange={e => setFlashForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
                <input required placeholder="Product name *" value={flashForm.productName}
                  onChange={e => setFlashForm(f => ({ ...f, productName: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
                <div className="grid grid-cols-2 gap-1.5">
                  <input type="number" step="0.01" placeholder="Orig. $" value={flashForm.originalPrice}
                    onChange={e => setFlashForm(f => ({ ...f, originalPrice: e.target.value }))}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
                  <input required type="number" step="0.01" placeholder="Sale $ *" value={flashForm.salePrice}
                    onChange={e => setFlashForm(f => ({ ...f, salePrice: e.target.value }))}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input type="number" placeholder="Qty" value={flashForm.quantity}
                    onChange={e => setFlashForm(f => ({ ...f, quantity: e.target.value }))}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
                  <input type="number" placeholder="Secs" value={flashForm.duration}
                    onChange={e => setFlashForm(f => ({ ...f, duration: e.target.value }))}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500" />
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setShowFlashForm(false)}
                    className="flex-1 py-1 text-xs border border-zinc-700 text-zinc-400 rounded hover:bg-zinc-700 transition-colors">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors">
                    ⚡ Start
                  </button>
                </div>
              </form>
            )}

            <div className="p-2 space-y-2">
              {activeFlash.length === 0 ? (
                <p className="text-center text-zinc-600 text-xs py-4">No active flash sales</p>
              ) : activeFlash.map(sale => (
                <FlashCountdown key={sale.id} sale={sale} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
