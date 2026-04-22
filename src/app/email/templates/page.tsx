'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Copy, Edit2 } from 'lucide-react'

interface Template { id: string; templateName: string; subject: string; eventType: string; language: string; isActive: boolean; createdAt: string }

const EVENT_TYPES = ['', 'order_confirmation', 'shipping_update', 'password_reset', 'loyalty', 'promotion', 'receipt', 'general']

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [eventType, setEventType] = useState('')

  useEffect(() => {
    const q = eventType ? `?eventType=${eventType}` : ''
    fetch(`/api/email/templates${q}`).then(r => r.json()).then(setTemplates)
  }, [eventType])

  async function duplicate(t: Template) {
    await fetch('/api/email/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, templateName: `${t.templateName} (Copy)`, id: undefined }),
    })
    fetch('/api/email/templates').then(r => r.json()).then(setTemplates)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Email Templates</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{templates.length} templates</p>
        </div>
        <Link href="/email/templates/new" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          <Plus className="w-3 h-3" /> New Template
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <select value={eventType} onChange={e => setEventType(e.target.value)} className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none">
          {EVENT_TYPES.map(et => <option key={et} value={et}>{et || 'All event types'}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Template Name</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Subject</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Event Type</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Language</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Active</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {templates.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-zinc-600">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />No templates
              </td></tr>
            ) : templates.map(t => (
              <tr key={t.id} className="hover:bg-zinc-900/50">
                <td className="py-2.5 pr-6 text-zinc-200 font-medium">{t.templateName}</td>
                <td className="py-2.5 pr-6 text-zinc-400 truncate max-w-xs">{t.subject}</td>
                <td className="py-2.5 pr-6">
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-xs">{t.eventType}</span>
                </td>
                <td className="py-2.5 pr-6 text-zinc-500 uppercase">{t.language}</td>
                <td className="py-2.5 pr-6"><span className={t.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{t.isActive ? 'Yes' : 'No'}</span></td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <Link href={`/email/templates/${t.id}`} className="text-zinc-500 hover:text-zinc-300"><Edit2 className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => duplicate(t)} className="text-zinc-500 hover:text-zinc-300"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
