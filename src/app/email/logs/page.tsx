'use client'

import { useEffect, useState } from 'react'
import { Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Log { id: string; templateName: string | null; toEmail: string; subject: string; status: string; errorMessage: string | null; sentAt: string; openedAt: string | null }

const STATUS_TABS = ['', 'sent', 'failed', 'pending']

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    const q = status ? `?status=${status}` : ''
    fetch(`/api/email/logs${q}`).then(r => r.json()).then(setLogs)
  }, [status])

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Email Delivery Logs</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{logs.length} entries</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatus(s)} className={cn('px-3 py-1 text-xs rounded transition-colors', status === s ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Status</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">To</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Subject</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Template</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Sent</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {logs.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-zinc-600">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />No logs
              </td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className={cn('hover:bg-zinc-900/50', log.status === 'failed' && 'border-l-2 border-red-500/40 bg-red-950/10')}>
                <td className="py-2.5 pr-4">
                  {log.status === 'sent' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> :
                   log.status === 'failed' ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> :
                   <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                </td>
                <td className="py-2.5 pr-4 text-zinc-300">{log.toEmail}</td>
                <td className="py-2.5 pr-4 text-zinc-400 max-w-xs truncate">
                  {log.subject}
                  {log.errorMessage && <div className="text-red-400 text-xs">{log.errorMessage}</div>}
                </td>
                <td className="py-2.5 pr-4 text-zinc-500">{log.templateName ?? '—'}</td>
                <td className="py-2.5 pr-4 text-zinc-500">{new Date(log.sentAt).toLocaleString()}</td>
                <td className="py-2.5 text-zinc-500">{log.openedAt ? new Date(log.openedAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
