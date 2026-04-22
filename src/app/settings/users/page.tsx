import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { UserCheck, Plus, ChevronLeft } from 'lucide-react'

const ROLE_BADGE: Record<string, string> = {
  admin:      'bg-red-500/10 text-red-400',
  manager:    'bg-amber-500/10 text-amber-400',
  cashier:    'bg-blue-500/10 text-blue-400',
  warehouse:  'bg-emerald-500/10 text-emerald-400',
  accountant: 'bg-purple-500/10 text-purple-400',
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      employee: {
        select: {
          store: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const total = users.length
  const activeCount = users.filter(u => u.isActive).length

  // Role breakdown
  const roleCounts: Record<string, number> = {}
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1
  }

  return (
    <>
      <TopBar
        title="Users & Roles"
        breadcrumb={[{ label: 'Settings', href: '/settings' }]}
        actions={
          <Link
            href="/settings/users/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New User
          </Link>
        }
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="px-6 py-5 space-y-6 max-w-7xl mx-auto">

          {/* Page header + back */}
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
              >
                <ChevronLeft className="w-3 h-3" />
                Back to Settings
              </Link>
              <div className="flex items-center gap-2 mb-0.5">
                <UserCheck className="w-4 h-4 text-zinc-400" />
                <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Users &amp; Roles</h2>
              </div>
              <p className="text-[12px] text-zinc-500">Manage system access, roles, and credentials</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-zinc-100">{total}</p>
              <p className="text-[11px] text-zinc-500 mt-1">{activeCount} active</p>
            </div>
            {(['admin', 'manager', 'cashier', 'warehouse', 'accountant'] as const).map(role => (
              <div key={role} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{role}</p>
                <p className={`text-2xl font-bold ${ROLE_BADGE[role]?.split(' ')[1] ?? 'text-zinc-100'}`}>
                  {roleCounts[role] ?? 0}
                </p>
              </div>
            ))}
          </div>

          {/* Users table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/40 flex items-center justify-between">
              <span className="text-[12px] font-medium text-zinc-300">{total} users</span>
              <Link
                href="/settings/users/new"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[12px] font-medium transition-colors"
              >
                <Plus className="w-3 h-3" />
                New User
              </Link>
            </div>

            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
                <UserCheck className="w-12 h-12 opacity-20" />
                <p className="text-[13px]">No users yet</p>
                <Link
                  href="/settings/users/new"
                  className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Create first user →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Name</th>
                      <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Email</th>
                      <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Role</th>
                      <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Store</th>
                      <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                      <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Created</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr
                        key={user.id}
                        className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="px-5 py-2.5">
                          <Link
                            href={`/settings/users/${user.id}`}
                            className="font-semibold text-zinc-100 hover:text-blue-400 transition-colors"
                          >
                            {user.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400 font-mono text-[12px]">{user.email}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${ROLE_BADGE[user.role] ?? 'bg-zinc-700 text-zinc-400'}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400">
                          {user.employee?.store?.name ?? '—'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-500 text-[12px]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <Link
                            href={`/settings/users/${user.id}`}
                            className="text-[12px] text-zinc-500 hover:text-zinc-200 transition-colors"
                          >
                            Edit →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
