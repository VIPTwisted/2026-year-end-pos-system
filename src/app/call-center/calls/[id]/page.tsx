export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import {
  ArrowLeft,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  User,
  Clock,
  FileText,
  Pencil,
} from 'lucide-react'

const DIR_BADGE: Record<string, string> = {
  inbound: 'bg-blue-500/10 text-blue-400',
  outbound: 'bg-emerald-500/10 text-emerald-400',
}

const OUTCOME_COLORS: Record<string, string> = {
  sale: 'bg-emerald-500/10 text-emerald-400',
  inquiry: 'bg-blue-500/10 text-blue-400',
  complaint: 'bg-red-500/10 text-red-400',
  callback: 'bg-amber-500/10 text-amber-400',
  no_answer: 'bg-zinc-700/50 text-zinc-400',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatTs(d: Date | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(d))
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <div className="text-sm text-zinc-100">{children}</div>
    </div>
  )
}

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const call = await prisma.callLog.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true, extension: true } },
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  })

  if (!call) notFound()

  return (
    <>
      <TopBar
        title="Call Detail"
        breadcrumb={[
          { label: 'Call Center', href: '/call-center' },
          { label: 'Call Log', href: '/call-center/calls' },
        ]}
      />

      <main className="flex-1 p-6 overflow-auto min-h-[100dvh]">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Back link */}
          <Link
            href="/call-center/calls"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Call Log
          </Link>

          {/* Call info card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-100">Call Information</span>
              </div>
              <Link
                href={`/call-center/calls/${id}/edit`}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 px-3 py-1.5 rounded transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit Call
              </Link>
            </div>

            {/* Info grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">

              <InfoRow label="Agent">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{call.agent?.name ?? '—'}</span>
                  {call.agent?.extension && (
                    <span className="text-xs text-zinc-500">ext. {call.agent.extension}</span>
                  )}
                </div>
              </InfoRow>

              <InfoRow label="Customer">
                {call.customer ? (
                  <Link
                    href={`/customers/${call.customer.id}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {call.customer.firstName} {call.customer.lastName}
                  </Link>
                ) : (
                  <span className="text-zinc-500 text-xs">Anonymous / Unknown</span>
                )}
              </InfoRow>

              {call.customer?.phone && (
                <InfoRow label="Customer Phone">
                  <span className="font-mono text-zinc-300">{call.customer.phone}</span>
                </InfoRow>
              )}

              {call.customer?.email && (
                <InfoRow label="Customer Email">
                  <span className="font-mono text-zinc-300">{call.customer.email}</span>
                </InfoRow>
              )}

              <InfoRow label="Direction">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium capitalize ${DIR_BADGE[call.direction] ?? 'bg-zinc-700 text-zinc-400'}`}
                >
                  {call.direction === 'inbound' ? (
                    <PhoneIncoming className="w-3 h-3" />
                  ) : (
                    <PhoneOutgoing className="w-3 h-3" />
                  )}
                  {call.direction}
                </span>
              </InfoRow>

              <InfoRow label="Outcome">
                {call.outcome ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${OUTCOME_COLORS[call.outcome] ?? 'bg-zinc-700 text-zinc-400'}`}
                  >
                    {call.outcome.replace('_', ' ')}
                  </span>
                ) : (
                  <span className="text-zinc-500 text-xs">Not recorded</span>
                )}
              </InfoRow>

              <InfoRow label="Duration">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-mono">{formatDuration(call.duration)}</span>
                </div>
              </InfoRow>

              <InfoRow label="Started At">
                <span className="font-mono text-xs text-zinc-300">
                  {formatTs(call.callStartedAt)}
                </span>
              </InfoRow>

              {call.callEndedAt && (
                <InfoRow label="Ended At">
                  <span className="font-mono text-xs text-zinc-300">
                    {formatTs(call.callEndedAt)}
                  </span>
                </InfoRow>
              )}

              {call.orderId && (
                <InfoRow label="Linked Order">
                  <Link
                    href={`/orders/${call.orderId}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs"
                  >
                    {call.orderId}
                  </Link>
                </InfoRow>
              )}

            </div>
          </div>

          {/* Notes section */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-800/60">
              <FileText className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-100">Notes</span>
            </div>
            <div className="px-6 py-5">
              {call.notes ? (
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {call.notes}
                </p>
              ) : (
                <p className="text-sm text-zinc-600 italic">No notes recorded for this call.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
