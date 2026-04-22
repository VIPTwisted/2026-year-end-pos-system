'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Layout, Plus, Trash2, Edit2, Star, ToggleLeft, ToggleRight } from 'lucide-react'

interface ReceiptTemplate {
  id: string
  name: string
  channelId: string | null
  channelName: string | null
  headerText: string | null
  footerText: string | null
  showLogo: boolean
  showBarcode: boolean
  showLoyalty: boolean
  showTaxDetail: boolean
  paperWidth: number
  emailSubject: string | null
  emailTemplate: string | null
  isDefault: boolean
  isActive: boolean
  createdAt: string
}

function ReceiptPreview({ template }: { template: ReceiptTemplate }) {
  const width = template.paperWidth === 58 ? 'max-w-[232px]' : 'max-w-[320px]'
  return (
    <div className={`${width} bg-white text-black rounded-lg p-4 font-mono text-[10px] leading-tight shadow-lg`}>
      {template.showLogo && (
        <div className="text-center mb-2 font-bold text-sm">★ NOVAPOS ★</div>
      )}
      {template.headerText && (
        <div className="text-center mb-2 whitespace-pre-wrap border-b border-dashed border-gray-300 pb-2">{template.headerText}</div>
      )}
      <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
        <div className="flex justify-between"><span>Widget A</span><span>$9.99</span></div>
        <div className="flex justify-between"><span>Widget B</span><span>$14.99</span></div>
        <div className="flex justify-between"><span>Widget C ×2</span><span>$7.98</span></div>
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between"><span>Subtotal</span><span>$32.96</span></div>
        {template.showTaxDetail && (
          <div className="flex justify-between text-gray-600"><span>Tax (8.25%)</span><span>$2.72</span></div>
        )}
        <div className="flex justify-between font-bold border-t border-dashed border-gray-300 pt-1 mt-1">
          <span>TOTAL</span><span>$35.68</span>
        </div>
        <div className="flex justify-between text-gray-500"><span>Cash</span><span>$40.00</span></div>
        <div className="flex justify-between text-gray-500"><span>Change</span><span>$4.32</span></div>
      </div>
      {template.showLoyalty && (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-300 text-center text-gray-600">
          Loyalty Points Earned: 35
        </div>
      )}
      {template.showBarcode && (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-300 text-center">
          <div className="text-[8px] tracking-widest">||||| |||| ||||| |||| |||||</div>
          <div className="text-[8px]">TXN-20260421-001</div>
        </div>
      )}
      {template.footerText && (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-300 text-center text-gray-600 whitespace-pre-wrap">
          {template.footerText}
        </div>
      )}
      <div className="mt-2 text-center text-gray-400">{template.paperWidth}mm · {new Date().toLocaleDateString()}</div>
    </div>
  )
}

export default function ReceiptTemplatesPage() {
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', channelName: '', headerText: '', footerText: '',
    showLogo: true, showBarcode: true, showLoyalty: true, showTaxDetail: true,
    paperWidth: '80', emailSubject: '', isDefault: false,
  })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/receipt-templates')
    const data = await res.json()
    setTemplates(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleEdit = (t: ReceiptTemplate) => {
    setEditId(t.id)
    setForm({
      name: t.name,
      channelName: t.channelName ?? '',
      headerText: t.headerText ?? '',
      footerText: t.footerText ?? '',
      showLogo: t.showLogo,
      showBarcode: t.showBarcode,
      showLoyalty: t.showLoyalty,
      showTaxDetail: t.showTaxDetail,
      paperWidth: t.paperWidth.toString(),
      emailSubject: t.emailSubject ?? '',
      isDefault: t.isDefault,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/receipt-templates/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      channelName: form.channelName || null,
      headerText: form.headerText || null,
      footerText: form.footerText || null,
      showLogo: form.showLogo,
      showBarcode: form.showBarcode,
      showLoyalty: form.showLoyalty,
      showTaxDetail: form.showTaxDetail,
      paperWidth: Number(form.paperWidth),
      emailSubject: form.emailSubject || null,
      isDefault: form.isDefault,
    }

    if (editId) {
      await fetch(`/api/receipt-templates/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/receipt-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    await load()
    setShowForm(false)
    setEditId(null)
    setForm({ name: '', channelName: '', headerText: '', footerText: '', showLogo: true, showBarcode: true, showLoyalty: true, showTaxDetail: true, paperWidth: '80', emailSubject: '', isDefault: false })
    setSaving(false)
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center text-zinc-400 hover:text-zinc-200 transition-colors">
      {value ? <ToggleRight className="w-5 h-5 text-blue-400" /> : <ToggleLeft className="w-5 h-5" />}
    </button>
  )

  const previewTemplate = templates.find(t => t.id === previewId)

  return (
    <>
      <TopBar title="Receipt Templates" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Receipt Templates</h2>
            <p className="text-xs text-zinc-500">{templates.length} template(s)</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', channelName: '', headerText: '', footerText: '', showLogo: true, showBarcode: true, showLoyalty: true, showTaxDetail: true, paperWidth: '80', emailSubject: '', isDefault: false }) }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">{editId ? 'Edit Template' : 'New Receipt Template'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Template Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Default 80mm" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Channel Name</label>
                <input value={form.channelName} onChange={e => setForm(p => ({ ...p, channelName: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Main Store" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Header Text</label>
                <textarea value={form.headerText} onChange={e => setForm(p => ({ ...p, headerText: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Welcome to NovaPOS!" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Footer Text</label>
                <textarea value={form.footerText} onChange={e => setForm(p => ({ ...p, footerText: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Thank you for shopping!" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Paper Width</label>
                <select value={form.paperWidth} onChange={e => setForm(p => ({ ...p, paperWidth: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="58">58mm</option>
                  <option value="80">80mm</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email Subject</label>
                <input value={form.emailSubject} onChange={e => setForm(p => ({ ...p, emailSubject: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Your NovaPOS Receipt" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'showLogo', label: 'Show Logo' },
                { key: 'showBarcode', label: 'Show Barcode' },
                { key: 'showLoyalty', label: 'Show Loyalty' },
                { key: 'showTaxDetail', label: 'Tax Detail' },
              ].map(field => (
                <div key={field.key} className="flex items-center gap-2">
                  <Toggle
                    value={form[field.key as keyof typeof form] as boolean}
                    onChange={v => setForm(p => ({ ...p, [field.key]: v }))}
                  />
                  <span className="text-xs text-zinc-400">{field.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Toggle value={form.isDefault} onChange={v => setForm(p => ({ ...p, isDefault: v }))} />
              <span className="text-xs text-zinc-400">Set as default template</span>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Saving...' : editId ? 'Update Template' : 'Create Template'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Main layout: cards + preview */}
        <div className="flex gap-6">
          {/* Template Cards */}
          <div className="flex-1 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-zinc-600 text-sm">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">
                <Layout className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No receipt templates yet</p>
              </div>
            ) : (
              templates.map(t => (
                <div key={t.id}
                  onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                  className={`bg-zinc-900 border rounded-xl p-4 cursor-pointer transition-all ${previewId === t.id ? 'border-blue-500/50' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-100">{t.name}</p>
                        {t.isDefault && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                            <Star className="w-2.5 h-2.5" /> Default
                          </span>
                        )}
                        {!t.isActive && (
                          <span className="text-[10px] text-zinc-600 bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5">Inactive</span>
                        )}
                      </div>
                      {t.channelName && <p className="text-xs text-zinc-500 mt-0.5">{t.channelName}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] text-zinc-500">{t.paperWidth}mm</span>
                        {t.showLogo && <span className="text-[10px] text-zinc-500">Logo</span>}
                        {t.showBarcode && <span className="text-[10px] text-zinc-500">Barcode</span>}
                        {t.showLoyalty && <span className="text-[10px] text-zinc-500">Loyalty</span>}
                        {t.showTaxDetail && <span className="text-[10px] text-zinc-500">Tax Detail</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={e => { e.stopPropagation(); handleEdit(t) }}
                        className="text-zinc-500 hover:text-zinc-200 transition-colors p-1">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(t.id) }}
                        className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Panel */}
          {previewTemplate && (
            <div className="w-80 shrink-0">
              <div className="sticky top-6">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Preview: {previewTemplate.name}</h3>
                <ReceiptPreview template={previewTemplate} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
