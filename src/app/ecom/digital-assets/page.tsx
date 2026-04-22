'use client'

import { useEffect, useRef, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Image, Film, FileText, Tag, Search, Filter, X, HardDrive } from 'lucide-react'

interface MediaAsset {
  id: string
  assetId: string
  fileName: string
  fileType: string
  url: string | null
  altText: string | null
  tags: string | null
  folder: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const TYPE_GROUPS: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'],
  video: ['mp4', 'mov', 'avi', 'webm'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'],
}

function getGroup(fileType: string): keyof typeof TYPE_GROUPS {
  const ext = fileType.toLowerCase().replace(/^\./, '')
  for (const [group, exts] of Object.entries(TYPE_GROUPS)) {
    if (exts.includes(ext)) return group as keyof typeof TYPE_GROUPS
  }
  return 'document'
}

function fileIcon(fileType: string) {
  const group = getGroup(fileType)
  if (group === 'image') return Image
  if (group === 'video') return Film
  return FileText
}

function formatSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DigitalAssetsPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [tagFilter, setTagFilter] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    fetch('/api/media/assets')
      .then(r => r.json())
      .then(d => setAssets(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const allTags = Array.from(new Set(
    assets.flatMap(a => (a.tags ?? '').split(',').map(t => t.trim()).filter(Boolean))
  )).sort()

  const filtered = assets.filter(a => {
    const matchType = typeFilter === 'All' || getGroup(a.fileType) === typeFilter.toLowerCase()
    const matchTag = !tagFilter || (a.tags ?? '').toLowerCase().includes(tagFilter.toLowerCase())
    const q = search.toLowerCase()
    return matchType && matchTag && (!q || a.fileName.toLowerCase().includes(q) || (a.altText ?? '').toLowerCase().includes(q) || (a.tags ?? '').toLowerCase().includes(q))
  })

  const images = assets.filter(a => getGroup(a.fileType) === 'image').length
  const videos = assets.filter(a => getGroup(a.fileType) === 'video').length
  const docs = assets.filter(a => getGroup(a.fileType) === 'document').length

  const selectedAsset = selected ? assets.find(a => a.id === selected) : null

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    // UI-only: show file names selected
    alert(`Selected ${files.length} file(s) for upload: ${Array.from(files).map(f => f.name).join(', ')}\n\n(Upload endpoint not yet wired — implement POST /api/media/assets/upload)`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <TopBar title="Digital Assets" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Assets', value: assets.length, color: 'text-zinc-100', icon: HardDrive },
            { label: 'Images', value: images, color: 'text-blue-400', icon: Image },
            { label: 'Videos', value: videos, color: 'text-violet-400', icon: Film },
            { label: 'Documents', value: docs, color: 'text-amber-400', icon: FileText },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</p>
                  <k.icon className="w-4 h-4 text-zinc-600" />
                </div>
                <p className={`text-3xl font-bold ${k.color}`}>{loading ? '—' : k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-zinc-600" />
            {['All', 'Image', 'Video', 'Document'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFilter === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}>
                {t}
              </button>
            ))}
            {allTags.length > 0 && (
              <>
                <span className="mx-1 border-l border-zinc-800 self-stretch" />
                <div className="relative flex items-center">
                  <Tag className="absolute left-2 w-3.5 h-3.5 text-zinc-500" />
                  <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
                    className="pl-7 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                    <option value="">All Tags</option>
                    {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..."
                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56" />
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            <button onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Upload className="w-4 h-4" />Upload
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Image className="w-10 h-10 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">No assets found.</p>
                <button onClick={handleUploadClick} className="mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors">Upload your first asset</button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {filtered.map(asset => {
                  const Icon = fileIcon(asset.fileType)
                  const isImg = getGroup(asset.fileType) === 'image'
                  const isSelected = selected === asset.id
                  return (
                    <button key={asset.id} onClick={() => setSelected(isSelected ? null : asset.id)}
                      className={`group relative aspect-square rounded-xl border overflow-hidden transition-all text-left ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-zinc-800 hover:border-zinc-600'} bg-zinc-900`}>
                      {isImg && asset.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={asset.url} alt={asset.altText ?? asset.fileName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <Icon className="w-8 h-8 text-zinc-600" />
                          <span className="text-xs text-zinc-600 uppercase font-mono">{asset.fileType}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-xs text-zinc-200 truncate w-full leading-tight">{asset.fileName}</p>
                      </div>
                      {!asset.isPublished && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" title="Not published" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedAsset && (
            <div className="w-72 shrink-0">
              <Card>
                <CardContent className="pt-4 pb-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">Asset Details</h3>
                    <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {getGroup(selectedAsset.fileType) === 'image' && selectedAsset.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedAsset.url} alt={selectedAsset.altText ?? selectedAsset.fileName} className="w-full aspect-video object-cover rounded-lg bg-zinc-800" />
                  ) : (
                    <div className="w-full aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                      {(() => { const Icon = fileIcon(selectedAsset.fileType); return <Icon className="w-10 h-10 text-zinc-600" /> })()}
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: 'File Name', value: selectedAsset.fileName },
                      { label: 'Type', value: selectedAsset.fileType.toUpperCase() },
                      { label: 'Folder', value: selectedAsset.folder },
                      { label: 'Alt Text', value: selectedAsset.altText ?? '—' },
                      { label: 'Tags', value: selectedAsset.tags ?? '—' },
                      { label: 'Status', value: selectedAsset.isPublished ? 'Published' : 'Unpublished' },
                      { label: 'Uploaded', value: new Date(selectedAsset.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between gap-2">
                        <span className="text-zinc-500 shrink-0">{row.label}</span>
                        <span className="text-zinc-300 text-right break-all">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {selectedAsset.url && (
                    <div className="pt-1">
                      <label className="block text-xs text-zinc-500 mb-1.5">URL</label>
                      <div className="px-2.5 py-2 bg-zinc-800 rounded-lg font-mono text-xs text-zinc-400 break-all select-all">{selectedAsset.url}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
