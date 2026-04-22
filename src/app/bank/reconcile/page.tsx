export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Landmark } from 'lucide-react'
import { ReconciliationUI } from './ReconciliationUI'

export default async function BankReconcilePage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>
}) {
  const params = await searchParams
  const accountId = params.accountId ?? null

  // Load all active bank accounts for the selector
  const accounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: [{ isPrimary: 'desc' }, { bankName: 'asc' }],
    select: {
      id: true,
      accountCode: true,
      bankName: true,
      accountNumber: true,
      accountType: true,
      currentBalance: true,
      currency: true,
      isPrimary: true,
      statements: {
        orderBy: { statementDate: 'desc' },
        take: 1,
        select: {
          id: true,
          statementDate: true,
          openingBalance: true,
          closingBalance: true,
          status: true,
        },
      },
    },
  })

  // Selected account and its latest statement
  let selectedAccount = null
  let latestStatement = null
  let statementLines: Awaited<ReturnType<typeof prisma.bankStatementLine.findMany>> = []
  type PaymentWithVendor = Awaited<ReturnType<typeof prisma.vendorPayment.findMany<{ include: { vendor: { select: { id: true; name: true } } } }>>>
  let payments: PaymentWithVendor = []

  if (accountId) {
    selectedAccount = accounts.find(a => a.id === accountId) ?? null

    if (selectedAccount) {
      const stmt = selectedAccount.statements[0] ?? null

      if (stmt) {
        latestStatement = stmt

        statementLines = await prisma.bankStatementLine.findMany({
          where: { statementId: stmt.id },
          orderBy: { transactionDate: 'asc' },
        })
      }

      payments = await prisma.vendorPayment.findMany({
        where: {
          bankAccountId: accountId,
          status: 'posted',
        },
        include: {
          vendor: { select: { id: true, name: true } },
        },
        orderBy: { paymentDate: 'desc' },
      })
    }
  }

  return (
    <>
      <TopBar title="Bank Reconciliation" />
      <main className="flex-1 p-6 overflow-auto">

        {/* Account Selector */}
        <div className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Select Bank Account</p>
          <div className="flex flex-wrap gap-2">
            {accounts.map(acct => {
              const isSelected = acct.id === accountId
              const latestStmt = acct.statements[0]
              return (
                <Link
                  key={acct.id}
                  href={`/bank/reconcile?accountId=${acct.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium">{acct.bankName}</span>
                  <span className="font-mono text-xs opacity-70">****{acct.accountNumber.slice(-4)}</span>
                  {acct.isPrimary && (
                    <Badge variant="success" className="text-xs py-0 px-1.5">Primary</Badge>
                  )}
                  {latestStmt && (
                    <Badge
                      variant={
                        latestStmt.status === 'reconciled'
                          ? 'success'
                          : latestStmt.status === 'in_progress'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-xs py-0 px-1.5"
                    >
                      {latestStmt.status.replace('_', ' ')}
                    </Badge>
                  )}
                </Link>
              )
            })}
            {accounts.length === 0 && (
              <p className="text-sm text-zinc-500">
                No active bank accounts found.{' '}
                <Link href="/bank" className="text-blue-400 hover:underline">
                  Add one in Bank Management
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        {/* Reconciliation Panel */}
        {!accountId ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
            <Landmark className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Select a bank account above to begin reconciliation</p>
          </div>
        ) : !selectedAccount ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
            <p className="text-sm">Account not found.</p>
          </div>
        ) : (
          <ReconciliationUI
            bankAccount={{
              id: selectedAccount.id,
              bankName: selectedAccount.bankName,
              accountCode: selectedAccount.accountCode,
              accountNumber: selectedAccount.accountNumber,
              currentBalance: selectedAccount.currentBalance,
              currency: selectedAccount.currency,
            }}
            statement={
              latestStatement
                ? {
                    id: latestStatement.id,
                    statementDate: latestStatement.statementDate.toString(),
                    openingBalance: latestStatement.openingBalance,
                    closingBalance: latestStatement.closingBalance,
                    status: latestStatement.status,
                  }
                : null
            }
            statementLines={statementLines.map(l => ({
              id: l.id,
              transactionDate: l.transactionDate.toString(),
              description: l.description,
              amount: l.amount,
              transactionType: l.transactionType,
              reference: l.reference,
              matchingStatus: l.matchingStatus,
              matchedToId: l.matchedToId,
            }))}
            payments={payments.map(p => ({
              id: p.id,
              paymentNumber: p.paymentNumber,
              paymentDate: p.paymentDate.toString(),
              amount: p.amount,
              paymentMethod: p.paymentMethod,
              status: p.status,
              vendor: p.vendor,
            }))}
          />
        )}
      </main>
    </>
  )
}
