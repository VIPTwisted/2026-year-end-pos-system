import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Catalog {
  id: string
  name: string
  products: number
  status: 'Published' | 'Draft' | 'Archived'
  lastUpdated: string
}

interface Product {
  id: string
  sku: string
  name: string
  category: string
  price: number
  stock: number
  channels: string[]
  status: 'Published' | 'Draft' | 'Pending' | 'Out of Stock'
  lastModified: string
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const CATALOGS: Catalog[] = [
  { id: 'c1', name: 'Spring 2026',     products: 624,  status: 'Published', lastUpdated: 'Apr 18, 2026' },
  { id: 'c2', name: 'Clearance',       products: 318,  status: 'Published', lastUpdated: 'Apr 15, 2026' },
  { id: 'c3', name: 'B2B Wholesale',   products: 741,  status: 'Published', lastUpdated: 'Apr 10, 2026' },
  { id: 'c4', name: 'Limited Edition', products: 164,  status: 'Draft',     lastUpdated: 'Apr 20, 2026' },
]

const PRODUCTS: Product[] = [
  { id: 'p1',  sku: 'APP-2026-001', name: 'Linen Blazer — Sand',         category: 'Apparel',     price: 189.99, stock: 84,  channels: ['Web','Mobile'],      status: 'Published',    lastModified: 'Apr 20' },
  { id: 'p2',  sku: 'APP-2026-002', name: 'Cotton Crew Tee — White',     category: 'Apparel',     price: 34.99,  stock: 312, channels: ['Web','Mobile','B2B'], status: 'Published',    lastModified: 'Apr 19' },
  { id: 'p3',  sku: 'ACC-2026-011', name: 'Canvas Tote Bag',             category: 'Accessories', price: 49.99,  stock: 0,   channels: ['Web'],               status: 'Out of Stock', lastModified: 'Apr 18' },
  { id: 'p4',  sku: 'SHO-2026-033', name: 'Leather Loafer — Cognac',    category: 'Footwear',    price: 224.99, stock: 47,  channels: ['Web','B2B'],         status: 'Published',    lastModified: 'Apr 18' },
  { id: 'p5',  sku: 'APP-2026-009', name: 'Merino Knit Sweater',         category: 'Apparel',     price: 149.99, stock: 23,  channels: ['Web','Mobile'],      status: 'Pending',      lastModified: 'Apr 17' },
  { id: 'p6',  sku: 'ACC-2026-022', name: 'Leather Cardholder — Black',  category: 'Accessories', price: 29.99,  stock: 198, channels: ['Web','Mobile','B2B'], status: 'Published',    lastModified: 'Apr 16' },
  { id: 'p7',  sku: 'SHO-2026-041', name: 'Suede Chelsea Boot',          category: 'Footwear',    price: 269.99, stock: 31,  channels: ['Web'],               status: 'Published',    lastModified: 'Apr 16' },
  { id: 'p8',  sku: 'APP-2026-014', name: 'Chino Shorts — Olive',        category: 'Apparel',     price: 64.99,  stock: 0,   channels: ['Web','Mobile'],      status: 'Out of Stock', lastModified: 'Apr 15' },
  { id: 'p9',  sku: 'ACC-2026-031', name: 'Woven Belt — Tan',            category: 'Accessories', price: 39.99,  stock: 87,  channels: ['Web','B2B'],         status: 'Published',    lastModified: 'Apr 15' },
  { id: 'p10', sku: 'APP-2026-017', name: 'Linen Trousers — Cream',      category: 'Apparel',     price: 119.99, stock: 55,  channels: ['Web','Mobile','B2B'], status: 'Published',    lastModified: 'Apr 14' },
  { id: 'p11', sku: 'SHO-2026-052', name: 'Canvas Sneaker — White',      category: 'Footwear',    price: 89.99,  stock: 142, channels: ['Web','Mobile'],      status: 'Published',    lastModified: 'Apr 14' },
  { id: 'p12', sku: 'ACC-2026-044', name: 'Structured Tote — Camel',     category: 'Accessories', price: 179.99, stock: 18,  channels: ['Web'],               status: 'Pending',      lastModified: 'Apr 13' },
  { id: 'p13', sku: 'APP-2026-021', name: 'Poplin Shirt — Blue Stripe',  category: 'Apparel',     price: 79.99,  stock: 76,  channels: ['Web','Mobile','B2B'], status: 'Published',    lastModified: 'Apr 13' },
  { id: 'p14', sku: 'APP-2026-024', name: 'Wool Overcoat — Camel',       category: 'Apparel',     price: 349.99, stock: 12,  channels: ['Web'],               status: 'Published',    lastModified: 'Apr 12' },
  { id: 'p15', sku: 'SHO-2026-061', name: 'Mule Sandal — Blush',        category: 'Footwear',    price: 99.99,  stock: 64,  channels: ['Web','Mobile'],      status: 'Published',    lastModified: 'Apr 12' },
  { id: 'p16', sku: 'ACC-2026-055', name: 'Straw Hat — Natural',         category: 'Accessories', price: 54.99,  stock: 39,  channels: ['Web','Mobile'],      status: 'Published',    lastModified: 'Apr 11' },
  { id: 'p17', sku: 'APP-2026-027', name: 'Jersey Midi Dress — Sage',    category: 'Apparel',     price: 99.99,  stock: 0,   channels: ['Web','Mobile'],      status: 'Out of Stock', lastModified: 'Apr 11' },
  { id: 'p18', sku: 'ACC-2026-066', name: 'Crossbody Bag — Terracotta',  category: 'Accessories', price: 139.99, stock: 22,  channels: ['Web'],               status: 'Pending',      lastModified: 'Apr 10' },
  { id: 'p19', sku: 'SHO-2026-072', name: 'Espadrille Wedge',            category: 'Footwear',    price: 79.99,  stock: 51,  channels: ['Web','Mobile','B2B'], status: 'Published',    lastModified: 'Apr 10' },
  { id: 'p20', sku: 'APP-2026-031', name: 'Seersucker Shorts — Navy',    category: 'Apparel',     price: 59.99,  stock: 88,  channels: ['Web','B2B'],         status: 'Published',    lastModified: 'Apr 09' },
]

const GRID_PRODUCTS = PRODUCTS.slice(0, 12)

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function statusBadge(s: Product['status']) {
  const map: Record<string, string> = {
    Published:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    Draft:         'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
    Pending:       'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    'Out of Stock':'bg-red-500/15 text-red-400 border border-red-500/25',
  }
  return map[s] ?? map.Draft
}

function catalogStatusBadge(s: Catalog['status']) {
  const map: Record<string, string> = {
    Published: 'bg-emerald-500/15 text-emerald-400',
    Draft:     'bg-amber-500/15 text-amber-400',
    Archived:  'bg-zinc-700/60 text-zinc-400',
  }
  return map[s] ?? map.Draft
}

function channelBadge(c: string) {
  const map: Record<string, string> = {
    Web:    'bg-indigo-500/15 text-indigo-300',
    Mobile: 'bg-violet-500/15 text-violet-300',
    B2B:    'bg-cyan-500/15 text-cyan-300',
  }
  return map[c] ?? 'bg-zinc-700/50 text-zinc-400'
}

// ─── Product SVG Icon ──────────────────────────────────────────────────────────
function ProductIcon({ category }: { category: string }) {
  if (category === 'Footwear') return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 opacity-60">
      <path d="M6 32c0 0 6-8 12-8s8 4 14 4 10-2 10-2v4c0 2-2 4-4 4H10c-2 0-4-2-4-4v-2z" stroke="#6366f1" strokeWidth="1.5" fill="rgba(99,102,241,0.1)"/>
      <path d="M18 24l4-12h4l2 12" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (category === 'Accessories') return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 opacity-60">
      <rect x="8" y="16" width="32" height="22" rx="3" stroke="#a78bfa" strokeWidth="1.5" fill="rgba(167,139,250,0.1)"/>
      <path d="M16 16v-4a8 8 0 0116 0v4" stroke="#a78bfa" strokeWidth="1.5"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 opacity-60">
      <path d="M14 14h20l-3 16H17L14 14z" stroke="#38bdf8" strokeWidth="1.5" fill="rgba(56,189,248,0.1)"/>
      <circle cx="20" cy="34" r="2" stroke="#38bdf8" strokeWidth="1.5"/>
      <circle cx="29" cy="34" r="2" stroke="#38bdf8" strokeWidth="1.5"/>
      <path d="M10 10h4l4 20" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ─── SEO Score Bar ─────────────────────────────────────────────────────────────
function SeoScore({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-700/60">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-zinc-300 w-6">{score}</span>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const kpis = [
    { label: 'Active Catalogs',      value: '4',     delta: '+1 this month',  color: 'text-indigo-400', icon: 'catalog' },
    { label: 'Published Products',   value: '1,847', delta: '+64 this week',  color: 'text-emerald-400', icon: 'check' },
    { label: 'Pending Review',       value: '23',    delta: '4 added today',  color: 'text-amber-400',  icon: 'clock' },
    { label: 'Out of Stock Listed',  value: '14',    delta: '3 critical',     color: 'text-red-400',    icon: 'alert' },
  ]

  const drawerProduct = PRODUCTS[0]

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0f0f1a', color: '#e4e4ef' }}>
      <TopBar
        title="Product Catalog"
        breadcrumb={[{ label: 'eCommerce', href: '/ecommerce' }]}
        actions={
          <>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border"
              style={{ borderColor: 'rgba(99,102,241,0.35)', color: '#a5b4fc', background: 'rgba(99,102,241,0.08)' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              New Catalog
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.9)', color: '#fff' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M2 10l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Publish All
            </button>
          </>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl p-4" style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{k.label}</span>
              <KpiIcon type={k.icon} color={k.color} />
            </div>
            <div className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 gap-0 px-6 pb-6 overflow-hidden">

        {/* Left: Catalog Tree */}
        <div
          className="shrink-0 rounded-xl mr-4 flex flex-col overflow-hidden"
          style={{ width: 220, background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Catalogs</span>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {CATALOGS.map((cat, i) => (
              <div
                key={cat.id}
                className="mx-2 my-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                style={{ background: i === 0 ? 'rgba(99,102,241,0.12)' : 'transparent' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-zinc-200 truncate pr-1">{cat.name}</span>
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-medium ${catalogStatusBadge(cat.status)}`}>
                    {cat.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3 4h6M3 6h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  {cat.products.toLocaleString()} products
                </div>
                <div className="text-[10px] text-zinc-600 mt-0.5">Updated {cat.lastUpdated}</div>
              </div>
            ))}
          </div>
          <div className="px-3 pb-3">
            <button
              className="w-full rounded-lg py-1.5 text-xs font-medium text-indigo-400 border border-dashed"
              style={{ borderColor: 'rgba(99,102,241,0.3)' }}
            >
              + Add Catalog
            </button>
          </div>
        </div>

        {/* Center: Products */}
        <div className="flex-1 flex flex-col overflow-hidden gap-4">

          {/* Filter Bar */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="relative flex-1 max-w-xs">
              <svg viewBox="0 0 16 16" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500"><circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:outline-none"
                placeholder="Search products, SKU…"
              />
            </div>
            {['All Categories', 'All Channels', 'All Statuses'].map((f) => (
              <select
                key={f}
                className="rounded-lg px-3 py-1.5 text-xs border text-zinc-400 focus:outline-none cursor-pointer"
                style={{ background: 'rgba(39,39,42,0.6)', borderColor: 'rgba(63,63,70,0.5)' }}
              >
                <option>{f}</option>
              </select>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-300">Spring 2026 — Featured Products</span>
              <span className="text-[11px] text-zinc-500">12 of 624</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {GRID_PRODUCTS.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg p-3 cursor-pointer hover:border-indigo-500/40 transition-colors"
                  style={{ background: 'rgba(15,15,26,0.5)', border: '1px solid rgba(63,63,70,0.4)' }}
                >
                  <div
                    className="rounded-lg flex items-center justify-center mb-2.5"
                    style={{ height: 72, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
                  >
                    <ProductIcon category={p.category} />
                  </div>
                  <div className="text-xs font-medium text-zinc-200 leading-tight truncate mb-0.5">{p.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mb-1.5">{p.sku}</div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-zinc-100">{fmt(p.price)}</span>
                    <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {p.channels.map((c) => (
                      <span key={c} className={`text-[10px] rounded px-1.5 py-0.5 ${channelBadge(c)}`}>{c}</span>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Product List Table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
              <span className="text-xs font-semibold text-zinc-300">All Products — Spring 2026</span>
              <span className="text-[11px] text-zinc-500">20 rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
                    {['SKU','Name','Category','Price','Stock','Channels','Status','Modified'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-medium text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p, i) => (
                    <tr
                      key={p.id}
                      className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                      style={{ borderBottom: i < PRODUCTS.length - 1 ? '1px solid rgba(63,63,70,0.3)' : undefined }}
                    >
                      <td className="px-3 py-2.5 font-mono text-zinc-400 whitespace-nowrap">{p.sku}</td>
                      <td className="px-3 py-2.5 text-zinc-200 font-medium max-w-[180px] truncate">{p.name}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{p.category}</td>
                      <td className="px-3 py-2.5 font-mono text-zinc-200 whitespace-nowrap">{fmt(p.price)}</td>
                      <td className="px-3 py-2.5">
                        <span className={p.stock === 0 ? 'text-red-400 font-mono' : 'text-zinc-300 font-mono'}>{p.stock}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {p.channels.map((c) => (
                            <span key={c} className={`text-[10px] rounded px-1.5 py-0.5 ${channelBadge(c)}`}>{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] rounded px-2 py-0.5 ${statusBadge(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500 whitespace-nowrap">{p.lastModified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Drawer: Product Detail */}
        <div
          className="shrink-0 ml-4 rounded-xl flex flex-col overflow-hidden"
          style={{ width: 340, background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
        >
          {/* Drawer Header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-semibold text-zinc-100 leading-tight">{drawerProduct.name}</span>
              <span className={`text-[10px] rounded px-2 py-0.5 shrink-0 ml-2 ${statusBadge(drawerProduct.status)}`}>
                {drawerProduct.status}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500">{drawerProduct.sku}</div>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'rgba(63,63,70,0.5)' }}>
            {['Content','Media','Pricing','Inventory','SEO'].map((tab, i) => (
              <button
                key={tab}
                className="flex-1 py-2 text-[11px] font-medium transition-colors"
                style={i === 4
                  ? { color: '#818cf8', borderBottom: '2px solid #6366f1' }
                  : { color: '#71717a', borderBottom: '2px solid transparent' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SEO Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">Meta Title</label>
              <div
                className="rounded-lg px-3 py-2 text-xs text-zinc-300"
                style={{ background: 'rgba(15,15,26,0.6)', border: '1px solid rgba(63,63,70,0.5)' }}
              >
                {drawerProduct.name} | NovaPOS Store
              </div>
              <div className="text-[10px] text-zinc-600 mt-1">54 / 60 chars recommended</div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">Meta Description</label>
              <div
                className="rounded-lg px-3 py-2 text-xs text-zinc-400 leading-relaxed"
                style={{ background: 'rgba(15,15,26,0.6)', border: '1px solid rgba(63,63,70,0.5)', minHeight: 64 }}
              >
                Discover our premium {drawerProduct.name.toLowerCase()}. Shop the latest {drawerProduct.category.toLowerCase()} styles at NovaPOS — free shipping on orders over $75.
              </div>
              <div className="text-[10px] text-zinc-600 mt-1">142 / 160 chars recommended</div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">URL Handle</label>
              <div
                className="rounded-lg px-3 py-2 text-xs font-mono text-indigo-400"
                style={{ background: 'rgba(15,15,26,0.6)', border: '1px solid rgba(63,63,70,0.5)' }}
              >
                /products/{drawerProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Keyword Score</label>
              <SeoScore score={74} />
              <div className="mt-2 space-y-1.5">
                {[
                  { kw: 'linen blazer',        density: '2.1%', ok: true  },
                  { kw: 'spring collection',   density: '1.4%', ok: true  },
                  { kw: 'mens blazer',         density: '0.3%', ok: false },
                  { kw: 'casual blazer sand',  density: '1.8%', ok: true  },
                ].map((kw) => (
                  <div key={kw.kw} className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">{kw.kw}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-zinc-500">{kw.density}</span>
                      <svg viewBox="0 0 12 12" fill="none" className={`w-3.5 h-3.5 ${kw.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {kw.ok
                          ? <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          : <path d="M6 3v4M6 9v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        }
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">Focus Keywords</label>
              <div className="flex flex-wrap gap-1.5">
                {['linen blazer','men blazer','spring jacket','sand blazer'].map((kw) => (
                  <span key={kw} className="text-[11px] rounded-full px-2.5 py-0.5 bg-indigo-500/12 text-indigo-300 border border-indigo-500/20">{kw}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 py-2 rounded-lg text-xs font-medium border"
                style={{ borderColor: 'rgba(99,102,241,0.35)', color: '#a5b4fc' }}
              >
                Save Draft
              </button>
              <button
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(99,102,241,0.9)', color: '#fff' }}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── KPI Icon ──────────────────────────────────────────────────────────────────
function KpiIcon({ type, color }: { type: string; color: string }) {
  const cls = `w-8 h-8 rounded-lg flex items-center justify-center`
  const bg = color.includes('indigo') ? 'rgba(99,102,241,0.15)'
    : color.includes('emerald') ? 'rgba(52,211,153,0.15)'
    : color.includes('amber')   ? 'rgba(245,158,11,0.15)'
    : 'rgba(239,68,68,0.15)'

  const iconMap: Record<string, JSX.Element> = {
    catalog: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    check:   <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    clock:   <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    alert:   <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M8 3l5.5 10H2.5L8 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  }

  return (
    <div className={cls} style={{ background: bg }}>
      <span className={color}>{iconMap[type]}</span>
    </div>
  )
}
