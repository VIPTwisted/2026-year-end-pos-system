export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Layers, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'

const MODULE_COLORS: Record<string, string> = {
  AP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  AR: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INVENTORY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  BANK: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PAYROLL: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export default async function PostingProfilesPage() {
  const profiles = await prisma.postingProfile.findMany({
    include: {
      rules: {
        include: {
          debitAccount: true,
          creditAccount: true,
        },
      },
    },
    orderBy: [{ module: 'asc' }, { code: 'asc' }],
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="Posting Profiles" />

      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">

        {/* Intro */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Layers className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-300 mb-1">What are Posting Profiles?</p>
              <p className="text-sm text-zinc-400">
                Posting profiles define which GL accounts are automatically debited and credited when transactions
                are posted. Each module (AP, AR, Inventory, Bank, Payroll) has its own profile with rules that
                map transaction types to specific chart-of-accounts entries — mirroring NovaPOS Core Finance&apos;s
                General Posting Setup.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              {profiles.length} Profile{profiles.length !== 1 ? 's' : ''} Configured
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {profiles.reduce((s, p) => s + p.rules.length, 0)} total posting rules across all modules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <form action="/api/finance/posting-profiles/seed" method="POST">
              <Button
                type="submit"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-sm h-9"
              >
                Seed Default Profiles
              </Button>
            </form>
            <Link href="/finance/posting-profiles/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 gap-2">
                <Plus className="w-4 h-4" />
                New Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Profiles */}
        {profiles.length === 0 ? (
          <div className="border border-zinc-800 rounded-xl p-16 text-center">
            <Layers className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium mb-2">No posting profiles yet</p>
            <p className="text-sm text-zinc-600 mb-6">
              Click &quot;Seed Default Profiles&quot; to generate standard BC profiles, or create one manually.
            </p>
            <div className="flex items-center justify-center gap-3">
              <form action="/api/finance/posting-profiles/seed" method="POST">
                <Button
                  type="submit"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm"
                >
                  Seed Default Profiles
                </Button>
              </form>
              <Link href="/finance/posting-profiles/new">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm gap-2">
                  <Plus className="w-4 h-4" />
                  New Profile
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">

                {/* Profile Header Row */}
                <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800/60">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded">
                        {profile.code}
                      </span>
                      <span className="text-sm font-medium text-zinc-200">{profile.name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${MODULE_COLORS[profile.module] ?? 'bg-zinc-800 text-zinc-400'}`}>
                        {profile.module}
                      </span>
                      {profile.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    {profile.description && (
                      <p className="text-xs text-zinc-500 mt-1.5">{profile.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-100">{profile.rules.length}</p>
                      <p className="text-xs text-zinc-500">rules</p>
                    </div>
                    <Link
                      href={`/finance/posting-profiles/${profile.id}`}
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Rules
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <ChevronDown className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>

                {/* Rules Table */}
                {profile.rules.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left px-5 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium w-48">
                            Transaction Type
                          </th>
                          <th className="text-left px-4 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                            Debit Account
                          </th>
                          <th className="text-left px-4 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                            Credit Account
                          </th>
                          <th className="text-left px-4 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium w-32">
                            Applies To
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {profile.rules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="px-5 py-3">
                              <span className="font-mono text-xs text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded">
                                {rule.transactionType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {rule.debitAccount ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                    {rule.debitAccount.code}
                                  </span>
                                  <span className="text-xs text-zinc-300">{rule.debitAccount.name}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-600 italic">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {rule.creditAccount ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                    {rule.creditAccount.code}
                                  </span>
                                  <span className="text-xs text-zinc-300">{rule.creditAccount.name}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-600 italic">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-zinc-500">
                                {rule.applicableTo ?? 'ALL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {profile.rules.length === 0 && (
                  <div className="px-5 py-4 text-center">
                    <p className="text-xs text-zinc-600 italic">No rules configured for this profile.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
