export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { CashFlowClient } from './CashFlowClient'

export default async function CashFlowPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Cash Flow Forecast" />
      <CashFlowClient />
    </div>
  )
}
