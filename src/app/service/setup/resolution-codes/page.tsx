export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import NewCodeForm from '../fault-codes/NewCodeForm'

export default async function ResolutionCodesPage() {
  const codes = await prisma.resolutionCode.findMany({ orderBy: { code: 'asc' } })

  return (
    <>
      <TopBar title="Resolution Codes" />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-zinc-100">Resolution Codes</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Service Setup — {codes.length} code{codes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-3">Add New Resolution Code</p>
            <NewCodeForm endpoint="/api/service/setup/resolution-codes" />
          </CardContent>
        </Card>

        {codes.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-zinc-600">
            <p className="text-sm">No resolution codes defined yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                  <th className="text-left pb-2.5 font-medium pr-6 w-32">Code</th>
                  <th className="text-left pb-2.5 font-medium pr-6">Description</th>
                  <th className="text-left pb-2.5 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {codes.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/30">
                    <td className="py-2.5 pr-6 font-mono font-medium text-indigo-400">{c.code}</td>
                    <td className="py-2.5 pr-6 text-zinc-300">{c.description}</td>
                    <td className="py-2.5 text-zinc-500">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
