export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Landmark, CreditCard, AlertCircle, Star } from 'lucide-react'
import { AddBankAccountButton } from './AddBankAccountButton'

function statementStatusVariant(status: string): 'success' | 'warning' | 'secondary' {
  if (status === 'reconciled') return 'success'
  if (status === 'in_progress') return 'warning'
  return 'secondary'
}

function accountTypeBadge(type: string) {
  return type === 'checking' ? 'default' : 'secondary'
}

export default async function BankPage() {
  const accounts = await prisma.bankAccount.findMany({
    include: {
      statements: {
        orderBy: { statementDate: 'desc' },
        take: 3,
      },
      glAccount: true,
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  })

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0)
  const primaryAccount = accounts.find(a => a.isPrimary)
  const pendingReconciliation = accounts.reduce((sum, a) => {
    return (
      sum +
      a.statements.filter(s => s.status === 'pending' || s.status === 'in_progress').length
    )
  }, 0)

  // Last 5 statements across all accounts
  const recentStatements = await prisma.bankStatement.findMany({
    include: { bankAccount: true },
    orderBy: { statementDate: 'desc' },
    take: 5,
  })

  return (
    <>
      <TopBar title="Bank Management" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Bank Accounts
                </CardTitle>
                <Landmark className="w-4 h-4 text-zinc-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-100">{accounts.length}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {accounts.filter(a => a.isActive).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Total Balance
                </CardTitle>
                <CreditCard className="w-4 h-4 text-zinc-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">across all accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Pending Reconciliation
                </CardTitle>
                <AlertCircle className="w-4 h-4 text-zinc-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${pendingReconciliation > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>
                {pendingReconciliation}
              </p>
              <p className="text-xs text-zinc-500 mt-1">statements pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Primary Account
                </CardTitle>
                <Star className="w-4 h-4 text-zinc-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${primaryAccount && primaryAccount.currentBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {primaryAccount ? formatCurrency(primaryAccount.currentBalance) : '—'}
              </p>
              <p className="text-xs text-zinc-500 mt-1 truncate">
                {primaryAccount ? primaryAccount.bankName : 'No primary set'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Bank Accounts</h2>
              <p className="text-xs text-zinc-500">{accounts.length} configured accounts</p>
            </div>
            <AddBankAccountButton />
          </div>

          {accounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Landmark className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No bank accounts configured</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Code</th>
                    <th className="text-left pb-3 font-medium">Bank</th>
                    <th className="text-left pb-3 font-medium">Account #</th>
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-left pb-3 font-medium">Currency</th>
                    <th className="text-right pb-3 font-medium">Balance</th>
                    <th className="text-center pb-3 font-medium">Primary</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {accounts.map(account => {
                    const last4 = account.accountNumber.slice(-4)
                    return (
                      <tr key={account.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-300">
                          {account.accountCode}
                        </td>
                        <td className="py-3 pr-4 text-zinc-100 font-medium">
                          {account.bankName}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-400">
                          ****{last4}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={accountTypeBadge(account.accountType) as 'default' | 'secondary'}>
                            {account.accountType}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{account.currency}</td>
                        <td className="py-3 pr-4 text-right font-semibold font-mono">
                          <span className={account.currentBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatCurrency(account.currentBalance, account.currency)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {account.isPrimary ? (
                            <Badge variant="success">Primary</Badge>
                          ) : (
                            <span className="text-zinc-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={account.isActive ? 'success' : 'secondary'}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Statements */}
        <div>
          <h2 className="text-base font-semibold text-zinc-100 mb-4">Recent Statements</h2>
          {recentStatements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <p className="text-sm">No statements imported yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Bank</th>
                    <th className="text-left pb-3 font-medium">Statement Date</th>
                    <th className="text-right pb-3 font-medium">Opening Balance</th>
                    <th className="text-right pb-3 font-medium">Closing Balance</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentStatements.map(stmt => (
                    <tr key={stmt.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-zinc-100 font-medium">
                        {stmt.bankAccount.bankName}
                        <span className="ml-2 text-xs text-zinc-500 font-mono">
                          ****{stmt.bankAccount.accountNumber.slice(-4)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {new Date(stmt.statementDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-xs text-zinc-300">
                        {formatCurrency(stmt.openingBalance)}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-xs font-semibold">
                        <span className={stmt.closingBalance >= stmt.openingBalance ? 'text-emerald-400' : 'text-red-400'}>
                          {formatCurrency(stmt.closingBalance)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={statementStatusVariant(stmt.status)}>
                          {stmt.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
