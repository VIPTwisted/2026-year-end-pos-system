import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ClipboardList, History, Edit3 } from 'lucide-react'

// CREATE=blue, UPDATE=amber, DELETE=red (D365 color-coded)
const ACTION_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  create:  { bg: 'bg-blue-500/15',    text: 'text-blue-400',    label: 'CREATE'  },
  update:  { bg: 'bg-amber-500/15',   text: 'text-amber-400',   label: 'UPDATE'  },
  delete:  { bg: 'bg-red-500/15',     text: 'text-red-400',     label: 'DELETE'  },
  login:   { bg: 'bg-zinc-700/30',    text: 'text-zinc-400',    label: 'LOGIN'   },
  export:  { bg: 'bg-violet-500/15',  text: 'text-violet-400',  label: 'EXPORT'  },
}

const ACTION_VARIANT: Record<string, 'destructive' | 'warning' | 'success' | 'default' | 'secondary'> = {
  create: 'success',
  update: 'default',
  delete: 'destructive',
  login:  'secondary',
  export: 'secondary',
}

export default async function AuditLogPage() {
  const [auditLogs, changeLogs, totalAudit, totalChange] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.changeLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.auditLog.count(),
    prisma.changeLog.count(),
  ])

  const tableBreakdown = auditLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.tableName] = (acc[log.tableName] ?? 0) + 1
    return acc
  }, {})

  const actionBreakdown = auditLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.action] = (acc[log.action] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <TopBar title="Audit Log" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Settings</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Audit Log</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Chronological record of all system events</p>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Audit Events',   value: totalAudit.toLocaleString(),            color: 'text-zinc-100' },
              { label: 'Field Changes',  value: totalChange.toLocaleString(),            color: 'text-blue-400' },
              { label: 'Tables Tracked', value: Object.keys(tableBreakdown).length.toString(), color: 'text-emerald-400' },
              { label: 'Deletes',        value: (actionBreakdown['delete'] ?? 0).toString(), color: 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Action breakdown chips */}
          {Object.keys(actionBreakdown).length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(actionBreakdown).map(([action, count]) => {
                const cfg = ACTION_COLOR[action]
                return (
                  <div key={action} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cfg?.bg ?? 'bg-zinc-800/50'} border-zinc-700/30`}>
                    <span className={`text-[11px] font-mono font-semibold uppercase ${cfg?.text ?? 'text-zinc-400'}`}>{action}</span>
                    <span className="text-[11px] font-bold text-zinc-300 tabular-nums">{count}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <ClipboardList className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Audit Events</span>
            <span className="text-[10px] text-zinc-600">({auditLogs.length} shown)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Audit Events Table */}
          {auditLogs.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
              <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[13px]">No audit events yet.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Timestamp', 'Table', 'Record ID', 'Action', 'Actor', 'Changed Fields'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {auditLogs.map(log => {
                      const cfg = ACTION_COLOR[log.action]
                      return (
                        <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-2.5 text-[11px] text-zinc-500 font-mono whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{log.tableName}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-600 max-w-[120px] truncate">
                            {log.recordId}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono uppercase border border-zinc-700/30 ${cfg?.bg ?? 'bg-zinc-800/50'} ${cfg?.text ?? 'text-zinc-400'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[12px] text-zinc-400">
                            {log.userEmail ?? log.userId ?? <span className="text-zinc-700">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-zinc-600 max-w-[200px] truncate font-mono">
                            {log.changedFields
                              ? JSON.stringify(log.changedFields).slice(0, 80)
                              : <span className="text-zinc-800">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <History className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Field Change History</span>
            <span className="text-[10px] text-zinc-600">({changeLogs.length} shown)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Field Changes Table */}
          {changeLogs.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12 text-zinc-600 pb-4">
              <Edit3 className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No field changes recorded yet.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden pb-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Timestamp', 'Entity', 'Field', 'Old Value', 'New Value', 'Changed By', 'Reason'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {changeLogs.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] text-zinc-500 font-mono whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-4 py-2.5 text-[12px]">
                          <span className="text-zinc-400">{c.entityType}</span>
                          <span className="text-zinc-700 mx-1">/</span>
                          <span className="font-mono text-zinc-600 text-[11px]">{c.entityId.slice(0, 8)}</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-300">{c.field}</td>
                        <td className="px-4 py-2.5 text-[11px] text-red-400 max-w-[120px] truncate" title={c.oldValue ?? ''}>
                          {c.oldValue ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-emerald-400 max-w-[120px] truncate" title={c.newValue ?? ''}>
                          {c.newValue ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-[12px] text-zinc-500">
                          {c.changedBy ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-zinc-600">
                          {c.reason ?? <span className="text-zinc-800">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
