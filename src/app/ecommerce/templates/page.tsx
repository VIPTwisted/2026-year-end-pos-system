'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Layers, FileText, Layout, Lock, Plus, X, Loader2 } from 'lucide-react'

interface ContentTemplate {
  id: string
  templateId: string
  templateName: string
  templateType: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  createdAt: string
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  page: <FileText className="w-4 h-4 text-blue-400" />,
  fragment: <Layers className="w-4 h-4 text-violet-400" />,
  module: <Layout className="w-4 h-4 text-emerald-400" />,
}

const TYPE_COLORS: Record<string, string> = {
  page: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  fragment: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  module: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'page' | 'fragment' | 'module'>('page')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ templateId: '', templateName: '', templateType: 'page', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchTemplates = () => {
    setLoading(true)
    fetch('/api/ecommerce/templates')
      .then((r) => r.json())
      .then((d) => { setTemplates(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleCreate = async () => {
    setSubmitting(true)
    await fetch('/api/ecommerce/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setModal(false)
    setForm({ templateId: '', templateName: '', templateType: 'page', description: '' })
    setSubmitting(false)
    fetchTemplates()
  }

  const filtered = templates.filter((t) => t.templateType === activeTab)

  const tabs: Array<{ key: 'page' | 'fragment' | 'module'; label: string; icon: React.ReactNode }> = [
    { key: 'page', label: 'Pages', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'fragment', label: 'Fragments', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'module', label: 'Modules', icon: <Layout className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Content templates</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage page templates, fragments, and modules for your sites</p>
          </div>
          <button
            onClick={() => { setForm({ ...form, templateType: activeTab }); setModal(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New template
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-zinc-800 mb-6">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              )}
            >
              {icon}
              {label}
              <span className="ml-1 text-xs text-zinc-500">{templates.filter((t) => t.templateType === key).length}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 animate-pulse">
                <div className="h-4 w-32 bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-20 bg-zinc-800 rounded mb-4" />
                <div className="h-3 w-full bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-lg bg-zinc-900/40">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">No {activeTab} templates yet.</p>
            <button
              onClick={() => { setForm({ ...form, templateType: activeTab }); setModal(true) }}
              className="inline-flex items-center gap-1 mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create {activeTab} template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[t.templateType] ?? <Layers className="w-4 h-4 text-zinc-400" />}
                    <span className="font-medium text-zinc-100 text-sm">{t.templateName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.isSystem && (
                      <span title="System template" className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-700/50 text-zinc-400 border border-zinc-700 rounded text-xs">
                        <Lock className="w-2.5 h-2.5" />
                        System
                      </span>
                    )}
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium border capitalize', TYPE_COLORS[t.templateType])}>
                      {t.templateType}
                    </span>
                  </div>
                </div>
                <code className="text-xs text-zinc-500 font-mono">{t.templateId}</code>
                {t.description && <p className="text-xs text-zinc-400 leading-relaxed">{t.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New content template">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Template ID <span className="text-red-400">*</span></label>
            <input
              value={form.templateId}
              onChange={(e) => setForm({ ...form, templateId: e.target.value })}
              placeholder="e.g. product-details-v2"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Template name <span className="text-red-400">*</span></label>
            <input
              value={form.templateName}
              onChange={(e) => setForm({ ...form, templateName: e.target.value })}
              placeholder="e.g. Product Details v2"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Template type</label>
            <select
              value={form.templateType}
              onChange={(e) => setForm({ ...form, templateType: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            >
              <option value="page">Page</option>
              <option value="fragment">Fragment</option>
              <option value="module">Module</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.templateId || !form.templateName} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-sm font-medium inline-flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create template
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
