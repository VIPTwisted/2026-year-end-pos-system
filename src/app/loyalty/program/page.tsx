import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { Settings } from 'lucide-react'
import { ProgramSettingsForm } from './ProgramSettingsForm'
import Link from 'next/link'

export default async function ProgramConfigPage() {
  let program = await prisma.loyaltyProgram.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (!program) {
    program = await prisma.loyaltyProgram.create({
      data: { name: 'NovaPOS Rewards', description: 'Default loyalty rewards program' },
    })
  }

  return (
    <>
      <TopBar title="Program Configuration" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Program Settings</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Configure earn rates, burn rates, and expiry rules</p>
          </div>
          <Link
            href="/loyalty/program/tiers"
            className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
          >
            Manage Tiers →
          </Link>
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Configuration</span>
          <div className="flex-1 h-px bg-zinc-800/60" />
        </div>

        <div className="max-w-2xl">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <ProgramSettingsForm program={program} />
          </div>
        </div>
      </main>
    </>
  )
}
