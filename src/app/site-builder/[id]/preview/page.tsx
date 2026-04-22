'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Monitor, Tablet, Smartphone, X, Upload, Loader2 } from 'lucide-react'

interface SitePageModule {
  id: string
  moduleType: string
  name: string
  position: number
  config: string
  hidden: boolean
}

interface SitePage {
  id: string
  name: string
  slug: string
  title: string
  status: string
  modules: SitePageModule[]
}

const DEVICE_WIDTHS: { id: string; label: string; width: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'desktop', label: 'Desktop', width: '100%', icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: '768px', icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: '390px', icon: Smartphone },
]

function ModulePreview({ mod }: { mod: SitePageModule }) {
  const cfg = (() => { try { return JSON.parse(mod.config) } catch { return {} } })()

  const wrapperCls = 'w-full rounded-lg border border-dashed border-zinc-700 overflow-hidden'

  switch (mod.moduleType) {
    case 'hero':
      return (
        <div
          className={`${wrapperCls} flex flex-col items-center justify-center py-16 px-6 text-center`}
          style={{ backgroundColor: cfg.backgroundColor || '#1e1b4b' }}
        >
          {cfg.imageUrl && <img src={cfg.imageUrl} alt="" className="w-full max-h-48 object-cover rounded mb-4 opacity-60" />}
          <h2 className="text-2xl font-bold text-white mb-2">{cfg.heading || 'Hero Heading'}</h2>
          <p className="text-zinc-300 mb-4">{cfg.subtext || 'Your hero subtext goes here.'}</p>
          {cfg.ctaText && (
            <a href={cfg.ctaUrl || '#'} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
              {cfg.ctaText}
            </a>
          )}
        </div>
      )

    case 'text-block':
      return (
        <div className={`${wrapperCls} p-6`} style={{ textAlign: cfg.alignment || 'left' }}>
          <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{cfg.content || 'Text content goes here...'}</p>
        </div>
      )

    case 'product-grid': {
      const cols = parseInt(cfg.columns || '3')
      return (
        <div className={`${wrapperCls} p-4`}>
          {cfg.title && <h3 className="text-base font-semibold text-zinc-100 mb-3">{cfg.title}</h3>}
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: parseInt(cfg.productCount || '6') }).map((_, i) => (
              <div key={i} className="bg-zinc-800 rounded-lg p-3 flex flex-col gap-1.5">
                <div className="w-full h-20 bg-zinc-700 rounded" />
                <p className="text-xs text-zinc-400">Product {i + 1}</p>
                <p className="text-xs font-semibold text-zinc-200">$0.00</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'promo-banner':
      return (
        <div
          className={`${wrapperCls} flex items-center justify-center py-4 px-6 text-center`}
          style={{ backgroundColor: cfg.backgroundColor || '#0078d4', color: cfg.textColor || '#ffffff' }}
        >
          <p className="text-sm font-medium">{cfg.text || 'Promo banner text here.'}</p>
        </div>
      )

    case 'call-to-action':
      return (
        <div className={`${wrapperCls} p-8 flex flex-col items-center gap-4 bg-zinc-900`} style={{ alignItems: cfg.alignment === 'left' ? 'flex-start' : cfg.alignment === 'right' ? 'flex-end' : 'center' }}>
          <h3 className="text-lg font-bold text-zinc-100">{cfg.heading || 'Call to Action Heading'}</h3>
          {cfg.buttonText && (
            <a href={cfg.buttonUrl || '#'} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              {cfg.buttonText}
            </a>
          )}
        </div>
      )

    case 'image-gallery': {
      const urls: string[] = (cfg.images || '').split('\n').filter(Boolean)
      const cols = parseInt(cfg.columns || '3')
      return (
        <div className={`${wrapperCls} p-4`}>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {urls.length === 0 ? Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-800 rounded-lg" />
            )) : urls.map((url, i) => (
              <img key={i} src={url} alt={`Image ${i + 1}`} className="aspect-square object-cover rounded-lg bg-zinc-800" />
            ))}
          </div>
        </div>
      )
    }

    case 'video':
      return (
        <div className={`${wrapperCls} p-4 bg-black`}>
          {cfg.videoUrl ? (
            <video src={cfg.videoUrl} controls={cfg.controls !== false} autoPlay={!!cfg.autoplay} className="w-full rounded" />
          ) : (
            <div className="w-full aspect-video bg-zinc-800 rounded flex items-center justify-center text-zinc-500 text-sm">Video placeholder</div>
          )}
        </div>
      )

    case 'spacer':
      return (
        <div className={`${wrapperCls} flex items-center justify-center text-zinc-600 text-xs`} style={{ height: `${cfg.height || 40}px` }}>
          Spacer ({cfg.height || 40}px)
        </div>
      )

    case 'nav-menu':
      return (
        <div className={`${wrapperCls} p-3 bg-zinc-800`}>
          <nav className={`flex gap-4 ${cfg.style === 'vertical' ? 'flex-col' : 'flex-row'}`}>
            {['Home', 'Products', 'About', 'Contact'].map(item => (
              <a key={item} href="#" className="text-sm text-zinc-300 hover:text-zinc-100">{item}</a>
            ))}
          </nav>
        </div>
      )

    case 'footer':
      return (
        <div className={`${wrapperCls} p-6 bg-zinc-900 border-t border-zinc-700`}>
          {cfg.showLogo && <div className="w-24 h-6 bg-zinc-700 rounded mb-4" />}
          {cfg.showLinks && (
            <div className="flex gap-4 mb-4">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="text-xs text-zinc-500 hover:text-zinc-300">{l}</a>
              ))}
            </div>
          )}
          <p className="text-xs text-zinc-600">{cfg.copyrightText || `© ${new Date().getFullYear()} All rights reserved`}</p>
        </div>
      )

    case 'breadcrumb':
      return (
        <div className={`${wrapperCls} p-3 flex items-center gap-2 text-xs text-zinc-500`}>
          <span>Home</span><span>/</span><span>Category</span><span>/</span><span className="text-zinc-200">Current Page</span>
        </div>
      )

    default:
      return (
        <div className={`${wrapperCls} p-4 flex items-center gap-3 bg-zinc-800/40`}>
          <div className="w-8 h-8 bg-zinc-700 rounded" />
          <div>
            <p className="text-sm font-medium text-zinc-300">{mod.name}</p>
            <p className="text-xs text-zinc-500">{mod.moduleType}</p>
          </div>
        </div>
      )
  }
}

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [page, setPage] = useState<SitePage | null>(null)
  const [device, setDevice] = useState('desktop')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    fetch(`/api/site/pages/${id}`)
      .then(r => r.json())
      .then(data => { setPage(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handlePublish() {
    setPublishing(true)
    const res = await fetch(`/api/site/pages/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishedBy: 'Admin' }),
    })
    if (res.ok) setPublished(true)
    setPublishing(false)
  }

  const activeDevice = DEVICE_WIDTHS.find(d => d.id === device) ?? DEVICE_WIDTHS[0]
  const sortedModules = page?.modules
    ? [...page.modules].sort((a, b) => a.position - b.position).filter(m => !m.hidden)
    : []

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100">
            <X className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-zinc-300">Preview: {page?.name}</span>
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
          {DEVICE_WIDTHS.map(d => {
            const Icon = d.icon
            return (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  device === d.id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {d.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {published && <span className="text-xs text-emerald-400">Published!</span>}
          <button
            onClick={handlePublish}
            disabled={publishing || published || page?.status === 'checked-out'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Publish
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 bg-zinc-800/30 p-8 flex justify-center overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center w-full">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div
            className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
            style={{ width: activeDevice.width, minHeight: '600px' }}
          >
            {/* Browser chrome */}
            <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-500 font-mono">
                https://yourstore.com/{page?.slug}
              </div>
            </div>

            {/* Page content */}
            <div className="bg-zinc-50 min-h-full p-4 space-y-3">
              {sortedModules.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400 text-sm">
                  <p>No visible modules on this page.</p>
                </div>
              )}
              {sortedModules.map(m => <ModulePreview key={m.id} mod={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
