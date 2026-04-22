export const dynamic = 'force-dynamic'

import OpportunityDetailClient from './OpportunityDetailClient'

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OpportunityDetailClient id={id} />
}
