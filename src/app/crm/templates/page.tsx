'use client'
import { useEffect, useState, useCallback } from 'react'
import { Mail, Plus, Trash2, Pencil, Copy, Eye, EyeOff, X, Check } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  category: string
  subject?: string
  htmlBody?: string
  textBody?: string
  previewText?: string
  isActive: boolean
  usageCount: number
  createdAt: string
}

const CATEGORIES = ['all', 'promotional', 'transactional', 'loyalty', 'win-back', 'birthday', 'welcome']
const CAT_COLORS: Record<string, string> = {
  promotional: 'bg-blue-500/20 text-blue-400',
  transactional: 'bg-zinc-700 text-zinc-300',
  loyalty: 'bg-yellow-500/20 text-yellow-400',
  'win-back': 'bg-red-500/20 text-red-400',
  birthday: 'bg-pink-500/20 text-pink-400',
  welcome: 'bg-green-500/20 text-green-400',
}

const BLANK_FORM = { name: '', category: 'promotional', subject: '', previewText: '', htmlBody: '', textBody: '', isActive: true }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [catTab, setCatTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK_FORM)

  const load = useCallback(() => {
    const params = catTab !== 'all' ? `?category=${catTab}` : ''
    fetch(`/api/crm/templates${params}`).then(r => r.json()).then(d => { setTemplates(Array.isArray(d) ? d : []); setLoading(false) })
  }, [catTab])

  useEffect(() => { load() }, [load])

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    const payload = { ...form }
    if (editId) {
      await fetch(`/api/crm/templates/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/crm/templates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    }
    setShowForm(false)
    setEditId(null)
    setForm(BLANK_FORM)
    load()
  }

  async function del(id: string) {
    if (!confirm('Delete template?')) return
    await fetch(`/api/crm/templates/${id}`, { method: 'DELETE' })
    load()
  }

  async function duplicate(t: EmailTemplate) {
    const { id: _id, createdAt: _ca, usageCount: _uc, ...rest } = t
    await fetch('/api/crm/templates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rest, name: `${t.name} (Copy)` }),
    })
    load()
  }

  function startEdit(t: EmailTemplate) {
    setForm({ name: t.name, category: t.category, subject: t.subject ?? '', previewText: t.previewText ?? '', htmlBody: t.htmlBody ?? '', textBody: t.textBody ?? '', isActive: t.isActive })
    setEditId(t.id)
    setShowForm(true)
    setPreviewId(null)
  }

  const previewTpl = templates.find(t => t.id === previewId)

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-400" /> Email Templates
          </h1>
          <p className="text-zinc-500 text-sm">{templates.length} templates</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(BLANK_FORM) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatTab(c)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${catTab === c ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">{editId ? 'Edit Template' : 'New Template'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Summer Sale Email"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Subject Line</label>
              <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Don't miss our summer sale!"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Preview Text</label>
              <input value={form.previewText} onChange={e => set('previewText', e.target.value)} placeholder="Up to 50% off..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">HTML Body</label>
              <textarea value={form.htmlBody} onChange={e => set('htmlBody', e.target.value)} rows={6}
                placeholder="<html><body><h1>Hello {{first_name}}</h1>...</body></html>"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Plain Text Body</label>
              <textarea value={form.textBody} onChange={e => set('textBody', e.target.value)} rows={3}
                placeholder="Hello {{first_name}}, ..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800" />
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={!form.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Check className="w-4 h-4" /> {editId ? 'Save Changes' : 'Create Template'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {previewTpl && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
            <div className="text-sm font-medium text-zinc-100">Preview: {previewTpl.name}</div>
            <button onClick={() => setPreviewId(null)} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            {previewTpl.htmlBody ? (
              <div className="bg-white rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: previewTpl.htmlBody }} />
              </div>
            ) : (
              <div className="text-zinc-600 text-sm text-center py-8">No HTML body defined</div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-zinc-600 py-16">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">No templates found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id}
              className={`bg-zinc-900 border rounded-xl p-5 flex flex-col gap-3 transition-all ${previewId === t.id ? 'border-blue-500' : 'border-zinc-800 hover:border-zinc-700'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-100 truncate">{t.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CAT_COLORS[t.category] ?? 'bg-zinc-700 text-zinc-300'}`}>{t.category}</span>
                    {!t.isActive && <span className="text-xs text-zinc-600">Inactive</span>}
                  </div>
                </div>
                <div className="text-xs text-zinc-600">{t.usageCount} uses</div>
              </div>
              {t.subject && <div className="text-xs text-zinc-400"><span className="text-zinc-600">Subject: </span>{t.subject}</div>}
              {t.previewText && <div className="text-xs text-zinc-500 italic truncate">{t.previewText}</div>}
              <div className="flex items-center gap-1 border-t border-zinc-800 pt-3 mt-auto">
                <button onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors">
                  {previewId === t.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {previewId === t.id ? 'Hide' : 'Preview'}
                </button>
                <button onClick={() => startEdit(t)}
                  className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => duplicate(t)}
                  className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors">
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
                <button onClick={() => del(t.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors ml-auto">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
