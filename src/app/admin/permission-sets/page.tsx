import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Shield, Plus, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PermissionSetsPage() {
  const sets = await prisma.adminPermissionSet.findMany({
    include: { permissions: true },
    orderBy: { createdAt: 'asc' },
  })

  const TYPE_STYLES: Record<string, string> = {
    'System':       'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'User-Defined': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Extension':    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Permission Sets</h1>
            <p className="text-[11px] text-zinc-500">{sets.length} role{sets.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Link href="/admin/permission-sets/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
          <Plus className="w-3.5 h-3.5" /> New
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              {['Role ID','Name','Type','Permissions',''].map((h, i) => (
                <th key={i} className={`pb-2 font-medium uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'} pr-6`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {sets.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-zinc-600">No permission sets. Create one to get started.</td></tr>
            )}
            {sets.map(s => (
              <tr key={s.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="py-2.5 pr-6 font-mono text-zinc-300">{s.roleId}</td>
                <td className="py-2.5 pr-6 text-zinc-200">{s.name}</td>
                <td className="py-2.5 pr-6">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${TYPE_STYLES[s.setType] ?? TYPE_STYLES['User-Defined']}`}>
                    {s.setType}
                  </span>
                </td>
                <td className="py-2.5 pr-6 text-zinc-400">{s.permissions.length}</td>
                <td className="py-2.5 text-right">
                  <Link href={`/admin/permission-sets/${s.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1">
                    <span>Edit</span><ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
