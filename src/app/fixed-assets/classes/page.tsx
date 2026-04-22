import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import AddClassForm from './AddClassForm'

export default async function AssetClassesPage() {
  const classes = await prisma.fixedAssetClass.findMany({
    include: { _count: { select: { assets: true } } },
    orderBy: { code: 'asc' },
  })

  const subclasses = await prisma.fixedAssetSubclass.findMany({
    orderBy: { code: 'asc' },
  })

  return (
    <>
      <TopBar title="Asset Classes" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-4xl mx-auto space-y-6">

          <Link href="/fixed-assets" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Fixed Assets
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">Fixed Asset Classes</h2>
              <p className="text-sm text-zinc-500 mt-1">Group assets by category for reporting and posting</p>
            </div>
          </div>

          {/* Classes Table */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Classes</h3>
            {classes.length === 0 ? (
              <div className="border border-zinc-800/50 rounded-lg p-10 text-center text-zinc-600 text-sm">
                <Building2 className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                No classes defined yet. Add one below.
              </div>
            ) : (
              <div className="border border-zinc-800/50 rounded-lg overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Code</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Description</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Assets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {classes.map(cls => (
                      <tr key={cls.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">
                            {cls.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-zinc-100">{cls.name}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{cls.description ?? '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant="outline">{cls._count.assets}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subclasses Table */}
          {subclasses.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Subclasses</h3>
              <div className="border border-zinc-800/50 rounded-lg overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Code</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Parent Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {subclasses.map(sub => {
                      const parent = classes.find(c => c.id === sub.classId)
                      return (
                        <tr key={sub.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3">
                            <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded">
                              {sub.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-zinc-100">{sub.name}</td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {parent ? `${parent.code} — ${parent.name}` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Form */}
          <AddClassForm classes={classes.map(c => ({ id: c.id, code: c.code, name: c.name }))} />

        </div>
      </main>
    </>
  )
}
