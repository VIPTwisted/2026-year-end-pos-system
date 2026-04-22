'use client'
import { useState, Fragment } from 'react'
import type { AuditEvent } from '@prisma/client'
import { formatDate } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  records: AuditEvent[]
}

const ACTION_STYLE: Record<string, { bg: string; text: string }> = {
  create: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  update: { bg: 'bg-amber-500/10',   text: 'text-amber-400'   },
  delete: { bg: 'bg-red-500/10',     text: 'text-red-400'     },
  login:  { bg: 'bg-blue-500/10',    text: 'text-blue-400'    },
  void:   { bg: 'bg-purple-500/10',  text: 'text-purple-400'  },
}

function getActionStyle(action: string) {
  return ACTION_STYLE[action.toLowerCase()] ?? { bg: 'bg-zinc-700/30', text: 'text-zinc-400' }
}

function getSummary(record: AuditEvent): string | null {
  if (!record.metadata) return null
  try {
    const m = record.metadata as unknown as Record<string, unknown>
    if (typeof m === 'object' && m !== null) {
      const keys = Object.keys(m)
      if (keys.length === 0) return null
      return keys.slice(0, 3).map(k => `${k}: ${String(m[k])}`).join(' · ')
    }
    return null
  } catch {
    return null
  }
}

export function AuditEventTable({ records }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (records.length === 0) {
    return (
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-[14px] font-medium text-zinc-500">No audit events recorded yet</p>
        <p className="text-[12px] text-zinc-700">Events are captured on create, update, delete, and login actions.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-800/60">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium w-6" />
              {['Date / Time', 'User', 'Action', 'Table', 'Record ID', 'Summary'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {records.map((record) => {
              const style = getActionStyle(record.action)
              const isExpanded = expandedId === record.id
              const summary = getSummary(record)

              return (
                <Fragment key={record.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                  >
                    {/* expand toggle */}
                    <td className="pl-4 py-2.5 text-zinc-600">
                      {record.metadata ? (
                        isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 block" />
                      )}
                    </td>

                    {/* date/time */}
                    <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                      {formatDate(record.createdAt)}
                    </td>

                    {/* user */}
                    <td className="px-4 py-2.5 text-[12px] text-zinc-400">
                      {record.userEmail ?? record.userId ?? (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>

                    {/* action badge */}
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono uppercase ${style.bg} ${style.text}`}
                      >
                        {record.action}
                      </span>
                    </td>

                    {/* table */}
                    <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-300">
                      {record.tableName}
                    </td>

                    {/* record id */}
                    <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-600 max-w-[120px] truncate">
                      {record.recordId}
                    </td>

                    {/* summary */}
                    <td className="px-4 py-2.5 text-[11px] text-zinc-600 max-w-[220px] truncate">
                      {summary ?? <span className="text-zinc-800">—</span>}
                    </td>
                  </tr>

                  {isExpanded && record.metadata && (
                    <tr className="bg-zinc-900/40">
                      <td />
                      <td colSpan={6} className="px-4 pb-3 pt-1">
                        <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap bg-zinc-900 p-3 rounded mt-2">
                          {JSON.stringify(record.metadata, null, 2)}
                        </pre>
                        {record.changedFields && (
                          <div className="mt-2">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Changed Fields</p>
                            <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap bg-zinc-900 p-3 rounded">
                              {JSON.stringify(record.changedFields, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
