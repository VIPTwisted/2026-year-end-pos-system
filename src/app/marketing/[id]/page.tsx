import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CampaignActions } from './CampaignActions'
import { Users } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  scheduled: 'default',
  active: 'success',
  paused: 'warning',
  completed: 'outline',
  cancelled: 'destructive',
}

const TYPE_VARIANT: Record<string, 'default' | 'warning' | 'secondary' | 'outline'> = {
  email: 'default',
  sms: 'warning',
  social: 'secondary',
  push: 'outline',
}

const CONTACT_STATUS_VARIANT: Record<string, 'secondary' | 'default' | 'success' | 'warning' | 'destructive'> = {
  pending: 'secondary',
  sent: 'default',
  opened: 'success',
  clicked: 'warning',
  unsubscribed: 'destructive',
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      contacts: {
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!campaign) notFound()

  const sentCount = campaign.sentCount ?? 0
  const openCount = campaign.openCount ?? 0
  const targetCount = campaign.targetCount ?? 0
  const openRate = sentCount > 0 ? ((openCount / sentCount) * 100).toFixed(1) : '—'

  return (
    <>
      <TopBar title={campaign.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold text-zinc-100">{campaign.name}</span>
                  <Badge variant={TYPE_VARIANT[campaign.type] ?? 'default'}>{campaign.type}</Badge>
                  <Badge variant={STATUS_VARIANT[campaign.status] ?? 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>

                {campaign.subject && (
                  <p className="text-sm text-zinc-400 italic">{campaign.subject}</p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mt-1">
                  {campaign.startDate && (
                    <span>
                      Start:{' '}
                      <span className="text-zinc-300">{formatDate(campaign.startDate)}</span>
                    </span>
                  )}
                  {campaign.endDate && (
                    <span>
                      End:{' '}
                      <span className="text-zinc-300">{formatDate(campaign.endDate)}</span>
                    </span>
                  )}
                  {campaign.budget != null && (
                    <span>
                      Budget:{' '}
                      <span className="text-zinc-300">{formatCurrency(campaign.budget)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Target</p>
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                {targetCount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Sent</p>
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                {sentCount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Opened</p>
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                {openCount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open Rate</p>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                {openRate === '—' ? '—' : `${openRate}%`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <CampaignActions campaignId={campaign.id} currentStatus={campaign.status} />

        {/* Content preview */}
        {campaign.content && (
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Message Content
            </h3>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {campaign.content}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Contacts table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Contacts ({campaign.contacts.length})
          </h3>

          {campaign.contacts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <Users className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm">No contacts added — use the action above to add contacts.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-left pb-3 font-medium">Email</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Sent At</th>
                    <th className="text-left pb-3 font-medium">Opened At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {campaign.contacts.map(cc => (
                    <tr key={cc.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-zinc-100 font-medium">
                        {cc.customer.firstName} {cc.customer.lastName}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {cc.customer.email ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={CONTACT_STATUS_VARIANT[cc.status] ?? 'secondary'}>
                          {cc.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {cc.sentAt ? formatDate(cc.sentAt) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-3 text-zinc-400 text-xs">
                        {cc.openedAt ? formatDate(cc.openedAt) : <span className="text-zinc-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </>
  )
}
