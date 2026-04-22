import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import HRSettingsForm from './HRSettingsForm'

async function getSettings() {
  const rows = await prisma.hRSettings.findMany()
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value
  return map
}

export default async function HRSettingsPage() {
  const settings = await getSettings()
  return (
    <>
      <TopBar title="HR Parameters" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="mb-6">
          <h1 className="text-[18px] font-semibold text-zinc-100">Human Resources Parameters</h1>
          <p className="text-[13px] text-zinc-500">Configure HR module settings — ACA, FMLA eligibility, hiring defaults, and more</p>
        </div>
        <HRSettingsForm initialSettings={settings} />
      </main>
    </>
  )
}
