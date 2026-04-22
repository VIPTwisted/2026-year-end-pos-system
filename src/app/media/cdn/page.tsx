'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Link2, Save, Cloud } from 'lucide-react'

const PROVIDERS = [
  { id: 'azure_blob', label: 'Azure Blob Storage', desc: 'Microsoft Azure CDN + Blob Storage' },
  { id: 'cloudflare', label: 'Cloudflare Images', desc: 'Cloudflare global CDN + image optimization' },
  { id: 'aws_s3', label: 'AWS S3 + CloudFront', desc: 'Amazon S3 with CloudFront distribution' },
  { id: 'custom', label: 'Custom URL', desc: 'Self-hosted or custom CDN endpoint' },
]

export default function CDNConfigPage() {
  const [form, setForm] = useState({ provider: 'custom', baseUrl: '', apiKey: '', containerName: '' })
  const [saved, setSaved] = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/media" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"><ChevronLeft className="w-3 h-3" /> Media Library</Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><Link2 className="w-4 h-4 text-zinc-500" /> Image Backend Configuration</h1>
      </div>

      <p className="text-xs text-zinc-500">D365 — Configure the media server base URL for product images and assets.</p>

      {/* Provider selection */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Storage Provider</p>
        <div className="grid grid-cols-2 gap-3">
          {PROVIDERS.map(p => (
            <button key={p.id} onClick={() => setForm(f => ({ ...f, provider: p.id }))} className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${form.provider === p.id ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}>
              <Cloud className={`w-4 h-4 mt-0.5 ${form.provider === p.id ? 'text-blue-400' : 'text-zinc-600'}`} />
              <div>
                <div className="text-xs font-medium text-zinc-200">{p.label}</div>
                <div className="text-xs text-zinc-500">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Config fields */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Configuration</p>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Media Server Base URL *</label>
            <input
              value={form.baseUrl}
              onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
              placeholder="https://cdn.example.com/media/"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
            />
            <p className="text-xs text-zinc-600 mt-1">All product images will be served from this URL prefix.</p>
          </div>
          {form.provider !== 'custom' && (
            <>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">API Key / Access Key</label>
                <input type="password" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Container / Bucket Name</label>
                <input value={form.containerName} onChange={e => setForm(f => ({ ...f, containerName: e.target.value }))} placeholder="my-media-container"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
            </>
          )}
        </div>
      </section>

      <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
        <Save className="w-3 h-3" /> {saved ? 'Saved!' : 'Save Configuration'}
      </button>
    </main>
  )
}
