'use client'
import { useEffect, useState, useRef, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Send, EyeOff, Plus, Trash2, X, Star, Check, Flag } from 'lucide-react'

interface Rating {
  id: string; reviewerName: string | null; email: string | null; rating: number
  title: string | null; body: string | null; status: string; isVerified: boolean
  helpfulCount: number; createdAt: string
}
interface Product {
  id: string; name: string; slug: string; shortDesc: string | null; longDesc: string | null
  sku: string | null; price: number; salePrice: number | null; categoryName: string | null
  imageUrls: string; status: string; isFeatured: boolean; metaTitle: string | null
  metaDesc: string | null; tags: string | null; specifications: string; publishedAt: string | null
  ratings: Rating[]
}

type Tab = 'content' | 'media' | 'specifications' | 'seo'

const SPEC_SUGGESTIONS = ['Material', 'Dimensions', 'Weight', 'Color', 'Size', 'Country of Origin']

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [tab, setTab] = useState<Tab>('content')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState('draft')
  const [isFeatured, setIsFeatured] = useState(false)
  const longDescRef = useRef<HTMLDivElement>(null)

  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imgInput, setImgInput] = useState('')

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])

  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [slug, setSlug] = useState('')

  async function load() {
    setLoading(true)
    const data = await fetch(`/api/ecom/products/${id}`).then(r => r.json())
    setProduct(data)
    setName(data.name ?? '')
    setShortDesc(data.shortDesc ?? '')
    setTags(data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [])
    setStatus(data.status ?? 'draft')
    setIsFeatured(data.isFeatured ?? false)
    if (longDescRef.current) longDescRef.current.innerHTML = data.longDesc ?? ''
    try { setImageUrls(JSON.parse(data.imageUrls ?? '[]')) } catch { setImageUrls([]) }
    try {
      const s = JSON.parse(data.specifications ?? '{}')
      setSpecs(Object.entries(s).map(([key, value]) => ({ key, value: value as string })))
    } catch { setSpecs([]) }
    setMetaTitle(data.metaTitle ?? '')
    setMetaDesc(data.metaDesc ?? '')
    setSlug(data.slug ?? '')
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function save() {
    setSaving(true)
    const specsObj = Object.fromEntries(specs.map(s => [s.key, s.value]))
    await fetch(`/api/ecom/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, shortDesc: shortDesc || null,
        longDesc: longDescRef.current?.innerHTML || null,
        tags: tags.join(', ') || null, status, isFeatured,
        imageUrls, specifications: specsObj,
        metaTitle: metaTitle || null, metaDesc: metaDesc || null, slug,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    load()
  }

  async function publish() {
    await fetch(`/api/ecom/products/${id}/publish`, { method: 'POST' })
    load()
  }

  async function unpublish() {
    await fetch(`/api/ecom/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' }),
    })
    load()
  }

  async function moderateRating(rid: string, newStatus: string) {
    await fetch(`/api/ecom/ratings/${rid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  async function deleteRating(rid: string) {
    await fetch(`/api/ecom/ratings/${rid}`, { method: 'DELETE' })
    load()
  }

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  function addImage() {
    if (imgInput.trim()) { setImageUrls(prev => [...prev, imgInput.trim()]); setImgInput('') }
  }

  function execCmd(cmd: string, val?: string) {
    document.execCommand(cmd, false, val)
    longDescRef.current?.focus()
  }

  const jsonLd = product ? {
    '@context': 'https://schema.org', '@type': 'Product', name, description: shortDesc, sku: product.sku,
    offers: { '@type': 'Offer', price: product.price, priceCurrency: 'USD',
      availability: status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  } : null

  if (loading || !product) return <div className="p-6 text-zinc-400">Loading...</div>

  const RATING_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400', approved: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-rose-500/20 text-rose-400', flagged: 'bg-orange-500/20 text-orange-400',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ecom/products" className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-zinc-100">{product.name}</h1>
          <p className="text-xs text-zinc-500">{product.sku ? `SKU: ${product.sku}` : 'No SKU'} · {product.categoryName ?? 'No category'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm rounded-lg disabled:opacity-50">
            <Save className="w-4 h-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Draft'}
          </button>
          {status !== 'active' && (
            <button onClick={publish} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg">
              <Send className="w-4 h-4" /> Publish
            </button>
          )}
          {status === 'active' && (
            <button onClick={unpublish} className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-lg">
              <EyeOff className="w-4 h-4" /> Unpublish
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {(['content', 'media', 'specifications', 'seo'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-5 max-w-3xl">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Product Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Short Description</label>
            <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Long Description</label>
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
              <div className="flex gap-1 p-2 bg-zinc-800 border-b border-zinc-700">
                {[{ label: 'B', cmd: 'bold', style: 'font-bold' }, { label: 'I', cmd: 'italic', style: 'italic' }].map(b => (
                  <button key={b.cmd} type="button" onMouseDown={e => { e.preventDefault(); execCmd(b.cmd) }}
                    className={`w-7 h-7 text-xs ${b.style} rounded hover:bg-zinc-700 text-zinc-300`}>{b.label}</button>
                ))}
                <button type="button" onMouseDown={e => { e.preventDefault(); const url = prompt('URL:'); if (url) execCmd('createLink', url) }}
                  className="px-2 h-7 text-xs rounded hover:bg-zinc-700 text-zinc-300">Link</button>
                <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList') }}
                  className="px-2 h-7 text-xs rounded hover:bg-zinc-700 text-zinc-300">• List</button>
              </div>
              <div ref={longDescRef} contentEditable suppressContentEditableWarning
                className="min-h-[160px] p-3 text-sm text-zinc-100 bg-zinc-900 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Tags (press Enter or comma to add)</label>
            <div className="flex flex-wrap gap-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg min-h-[42px]">
              {tags.map((t, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                  {t}<button onClick={() => setTags(prev => prev.filter((_, j) => j !== i))} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder={tags.length === 0 ? 'type tag and press Enter' : ''}
                className="bg-transparent text-sm text-zinc-100 focus:outline-none flex-1 min-w-[120px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="draft">Draft</option><option value="active">Active</option>
                <option value="inactive">Inactive</option><option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button type="button" onClick={() => setIsFeatured(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isFeatured ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <label className="text-sm text-zinc-300">Featured Product</label>
            </div>
          </div>
        </div>
      )}

      {tab === 'media' && (
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Image URLs</label>
            <div className="flex gap-2 mb-3">
              <input value={imgInput} onChange={e => setImgInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() }}}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <button onClick={addImage} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {imageUrls.length === 0 && <p className="text-sm text-zinc-500">No images added</p>}
            <div className="grid grid-cols-3 gap-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group rounded-lg border border-zinc-700 overflow-hidden bg-zinc-800">
                  {i === 0 && <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">Primary</div>}
                  <button onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 z-10 p-1 bg-zinc-900/80 hover:bg-rose-600 text-zinc-300 hover:text-white rounded opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <img src={url} alt={`Product image ${i + 1}`} className="w-full h-32 object-cover" onError={e => { (e.target as HTMLImageElement).src = '' }} />
                  <div className="p-2"><p className="text-xs text-zinc-500 truncate">{url}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'specifications' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <label className="text-sm text-zinc-300 font-medium">Product Specifications</label>
            <button onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])} className="flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-lg">
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>
          <div className="text-xs text-zinc-500 mb-2">Suggestions: {SPEC_SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setSpecs(prev => [...prev, { key: s, value: '' }])}
              className="ml-1 px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded">{s}</button>
          ))}</div>
          {specs.length === 0 && <p className="text-sm text-zinc-500">No specifications added</p>}
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={spec.key} onChange={e => setSpecs(prev => prev.map((s, j) => j === i ? { ...s, key: e.target.value } : s))}
                  placeholder="Key (e.g. Material)"
                  className="w-48 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                <input value={spec.value} onChange={e => setSpecs(prev => prev.map((s, j) => j === i ? { ...s, value: e.target.value } : s))}
                  placeholder="Value"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                <button onClick={() => setSpecs(prev => prev.filter((_, j) => j !== i))} className="p-2 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'seo' && (
        <div className="space-y-5 max-w-2xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-zinc-400">Meta Title</label>
              <span className={`text-xs ${metaTitle.length > 60 ? 'text-rose-400' : 'text-zinc-500'}`}>{metaTitle.length}/60</span>
            </div>
            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-zinc-400">Meta Description</label>
              <span className={`text-xs ${metaDesc.length > 160 ? 'text-rose-400' : 'text-zinc-500'}`}>{metaDesc.length}/160</span>
            </div>
            <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Slug</label>
            <input value={slug} onChange={e => setSlug(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            <div className="mt-1 text-xs text-zinc-500 font-mono">yourstore.com/products/{slug}</div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Structured Data Preview (JSON-LD)</label>
            <pre className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(jsonLd, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="border-t border-zinc-800 pt-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300">Ratings & Reviews ({product.ratings.length})</h2>
        {product.ratings.length === 0 && <p className="text-sm text-zinc-500">No reviews yet</p>}
        <div className="space-y-3">
          {product.ratings.map(r => (
            <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-200">{r.reviewerName ?? 'Anonymous'}</span>
                    {r.isVerified && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 rounded">Verified</span>}
                    <span className={`text-xs px-1.5 rounded ${RATING_STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{r.status}</span>
                    <span className="text-xs text-zinc-500 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400' : 'text-zinc-700'}`} fill={s <= r.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  {r.title && <p className="text-sm font-medium text-zinc-200">{r.title}</p>}
                  {r.body && <p className="text-sm text-zinc-400 mt-0.5">{r.body}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {r.status !== 'approved' && (
                    <button onClick={() => moderateRating(r.id, 'approved')} className="p-1.5 hover:bg-zinc-700 rounded text-emerald-400" title="Approve"><Check className="w-3.5 h-3.5" /></button>
                  )}
                  {r.status !== 'rejected' && (
                    <button onClick={() => moderateRating(r.id, 'rejected')} className="p-1.5 hover:bg-zinc-700 rounded text-rose-400" title="Reject"><X className="w-3.5 h-3.5" /></button>
                  )}
                  {r.status !== 'flagged' && (
                    <button onClick={() => moderateRating(r.id, 'flagged')} className="p-1.5 hover:bg-zinc-700 rounded text-amber-400" title="Flag"><Flag className="w-3.5 h-3.5" /></button>
                  )}
                  <button onClick={() => deleteRating(r.id)} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
