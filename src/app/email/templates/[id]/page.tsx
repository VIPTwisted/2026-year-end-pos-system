'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, Eye, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Template { id: string; templateName: string; subject: string; senderEmail: string | null; senderName: string | null; language: string; htmlBody: string; textBody: string | null; tokens: string | null; eventType: string; isActive: boolean }

const TOKEN_LIST = [
  { token: '{{customerName}}', desc: 'Customer full name' },
  { token: '{{orderNumber}}', desc: 'Order number' },
  { token: '{{storeName}}', desc: 'Store name' },
  { token: '{{date}}', desc: 'Current date' },
  { token: '{{amount}}', desc: 'Transaction amount' },
  { token: '{{trackingNumber}}', desc: 'Shipping tracking #' },
]

const EVENT_TYPES = ['order_confirmation', 'shipping_update', 'password_reset', 'loyalty', 'promotion', 'receipt', 'general']

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [template, setTemplate] = useState<Template | null>(null)
  const [tab, setTab] = useState<'html' | 'text'>('html')
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [form, setForm] = useState<Partial<Template>>({})

  const isNew = id === 'new'

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/email/templates/${id}`).then(r => r.json()).then(d => { setTemplate(d); setForm(d) })
    } else {
      setForm({ templateName: '', subject: '', htmlBody: '<html><body><h1>{{customerName}}</h1></body></html>', textBody: '', eventType: 'general', language: 'en-us', isActive: true })
    }
  }, [id, isNew])

  async function save() {
    setSaving(true)
    const url = isNew ? '/api/email/templates' : `/api/email/templates/${id}`
    const method = isNew ? 'POST' : 'PATCH'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
  }

  async function showPreview() {
    if (isNew) return
    setPreviewing(true)
    const res = await fetch(`/api/email/templates/${id}/preview`, { method: 'POST' })
    const d = await res.json()
    setPreview(d.html)
    setPreviewing(false)
  }

  function set(key: string, value: string | boolean) { setForm(p => ({ ...p, [key]: value })) }

  function insertToken(token: string) {
    set('htmlBody', (form.htmlBody ?? '') + token)
  }

  if (!isNew && !template) return <main className="flex-1 p-6 bg-zinc-950"><div className="animate-pulse"><div className="h-6 bg-zinc-800 rounded w-48" /></div></main>

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href="/email/templates" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"><ChevronLeft className="w-3 h-3" /> Templates</Link>
          <span className="text-zinc-700">/</span>
          <h1 className="text-sm font-semibold text-zinc-100">{form.templateName || 'New Template'}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button onClick={showPreview} disabled={previewing} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Eye className="w-3 h-3" /> Preview
            </button>
          )}
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-4 gap-3 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        {[{ label: 'Template Name', key: 'templateName' }, { label: 'Subject', key: 'subject' }, { label: 'From Email', key: 'senderEmail' }, { label: 'From Name', key: 'senderName' }].map(f => (
          <div key={f.key}>
            <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
            <input value={(form as Record<string, string | null | boolean>)[f.key] as string ?? ''} onChange={e => set(f.key, e.target.value)} className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500" />
          </div>
        ))}
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Event Type</label>
          <select value={form.eventType ?? 'general'} onChange={e => set('eventType', e.target.value)} className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
            {EVENT_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Language</label>
          <select value={form.language ?? 'en-us'} onChange={e => set('language', e.target.value)} className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
            <option value="en-us">en-US</option>
            <option value="es-us">es-US</option>
            <option value="fr-fr">fr-FR</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Token panel */}
        <div className="w-52 flex-shrink-0">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Available Tokens</p>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 space-y-1">
            {TOKEN_LIST.map(t => (
              <button key={t.token} onClick={() => insertToken(t.token)} className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors group">
                <div className="text-xs font-mono text-blue-400 group-hover:text-blue-300">{t.token}</div>
                <div className="text-xs text-zinc-600">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {(['html', 'text'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={cn('flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors', tab === t ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300')}>
                <Code className="w-3 h-3" /> {t === 'html' ? 'HTML Body' : 'Plain Text'}
              </button>
            ))}
          </div>
          {tab === 'html' ? (
            <textarea
              value={form.htmlBody ?? ''}
              onChange={e => set('htmlBody', e.target.value)}
              className="w-full h-96 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 resize-y"
              spellCheck={false}
            />
          ) : (
            <textarea
              value={form.textBody ?? ''}
              onChange={e => set('textBody', e.target.value)}
              className="w-full h-96 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-500 resize-y"
            />
          )}
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[80vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="text-sm font-medium">Email Preview</span>
              <button onClick={() => setPreview(null)} className="text-zinc-500 hover:text-zinc-700 text-xs">Close</button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      )}
    </main>
  )
}
