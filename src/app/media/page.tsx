'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Image, Folder, Upload, Link2, File } from 'lucide-react'

interface Asset { id: string; assetId: string; fileName: string; fileType: string; url: string | null; altText: string | null; folder: string; isPublished: boolean; createdAt: string }

const FOLDERS = ['/', '/products', '/banners', '/logos', '/emails']

export default function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [folder, setFolder] = useState('/')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/media/assets?folder=${encodeURIComponent(folder)}`).then(r => r.json()).then(d => { setAssets(d); setLoading(false) })
  }, [folder])

  const images = assets.filter(a => a.fileType.startsWith('image/'))
  const others = assets.filter(a => !a.fileType.startsWith('image/'))

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Media Library</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{assets.length} assets in {folder}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/media/cdn" className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
            <Link2 className="w-3 h-3" /> CDN Config
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Upload className="w-3 h-3" /> Upload
          </button>
        </div>
      </div>

      {/* CDN Config card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
        <Link2 className="w-5 h-5 text-zinc-500" />
        <div className="flex-1">
          <div className="text-xs font-medium text-zinc-300">CDN Base URL</div>
          <div className="text-xs text-zinc-500 font-mono mt-0.5">Not configured — <Link href="/media/cdn" className="text-blue-400 hover:text-blue-300">configure now</Link></div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Folder browser */}
        <div className="w-44 flex-shrink-0">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Folders</p>
          <div className="space-y-0.5">
            {FOLDERS.map(f => (
              <button key={f} onClick={() => setFolder(f)} className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors text-left ${folder === f ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}>
                <Folder className="w-3 h-3" /> {f === '/' ? 'Root' : f.replace('/', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Asset grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-zinc-900 rounded-lg animate-pulse" />)}
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
              <Image className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">No assets in this folder</p>
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Images</p>
                  <div className="grid grid-cols-4 gap-3">
                    {images.map(a => (
                      <div key={a.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
                        {a.url ? (
                          <img src={a.url} alt={a.altText ?? a.fileName} className="w-full h-24 object-cover" />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-zinc-800">
                            <Image className="w-8 h-8 text-zinc-600" />
                          </div>
                        )}
                        <div className="p-2">
                          <div className="text-xs text-zinc-300 truncate">{a.fileName}</div>
                          <div className="text-xs text-zinc-600">{a.fileType}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Files</p>
                  <div className="space-y-1">
                    {others.map(a => (
                      <div key={a.id} className="flex items-center gap-3 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                        <File className="w-4 h-4 text-zinc-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-zinc-300 truncate">{a.fileName}</div>
                          <div className="text-xs text-zinc-600">{a.fileType}</div>
                        </div>
                        <span className={`text-xs ${a.isPublished ? 'text-emerald-400' : 'text-zinc-600'}`}>{a.isPublished ? 'Published' : 'Draft'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
