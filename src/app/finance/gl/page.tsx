import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { GLJournalClient } from './GLJournalClient'

export default async function GLPage() {
  const entries = await prisma.journalEntry.findMany({
    include: {
      lines: {
        include: { account: true },
      },
    },
    orderBy: { date: 'desc' },
    take: 20,
  })

  // Serialize for client (Dates → strings)
  const serialized = entries.map((e) => ({
    id: e.id,
    reference: e.reference,
    description: e.description,
    date: e.date.toISOString(),
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    createdBy: e.createdBy,
    lines: e.lines.map((l) => ({
      id: l.id,
      accountId: l.accountId,
      accountCode: l.account.code,
      accountName: l.account.name,
      debit: l.debit,
      credit: l.credit,
      memo: l.memo,
    })),
  }))

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="GL Journal Entries" />
      <GLJournalClient initialEntries={serialized} />
    </div>
  )
}
