import { Lock, Shield } from 'lucide-react'

const SYSTEM_ROLES = [
  { role: 'admin', desc: 'Full system access — all modules, all permissions', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { role: 'manager', desc: 'Store management — orders, customers, reports, staff', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { role: 'cashier', desc: 'POS operations — checkout, returns, basic customer lookup', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { role: 'viewer', desc: 'Read-only access — reports and dashboards only', color: 'text-zinc-400', bg: 'bg-zinc-700/50 border-zinc-700' },
]

export default function RolesPage() {
  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Role Templates</h2>
          <p className="text-xs text-zinc-500 mt-0.5">System roles are predefined and locked</p>
        </div>
      </div>

      <div className="space-y-3 max-w-xl">
        {SYSTEM_ROLES.map(r => (
          <div key={r.role} className={`flex items-start justify-between p-4 rounded-xl border ${r.bg}`}>
            <div className="flex items-center gap-3">
              <Shield className={`w-4 h-4 ${r.color}`} />
              <div>
                <div className={`text-sm font-bold capitalize ${r.color}`}>{r.role}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{r.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <Lock className="w-3 h-3" /> System
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg max-w-xl">
        <p className="text-xs text-zinc-500">
          <span className="text-zinc-400 font-medium">Custom roles</span> — Assign granular per-module permissions to any user via the{' '}
          <a href="/admin/users" className="text-blue-400 hover:text-blue-300">user permissions tab</a>.
          System roles provide quick defaults.
        </p>
      </div>
    </main>
  )
}
