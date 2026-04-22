import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const fromParam = sp.get('from')
    const toParam = sp.get('to')

    const now = new Date()
    const from = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), now.getMonth(), 1)
    const to = toParam ? new Date(toParam + 'T23:59:59.999Z') : now

    // 1. Sales revenue: completed orders in period
    const completedOrders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: from, lte: to },
      },
      include: {
        items: {
          include: { product: { select: { costPrice: true } } },
        },
      },
    })

    const salesRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // 2. COGS: sum (qty * costPrice) for completed order items
    const cogs = completedOrders.reduce((sum, o) =>
      sum + o.items.reduce((iSum, item) =>
        iSum + item.quantity * (item.product?.costPrice ?? 0), 0), 0)

    // 3. Revenue accounts: sum JournalLine.credit for revenue-type accounts in period
    const revenueAccounts = await prisma.account.findMany({
      where: { type: 'revenue', isActive: true },
      include: {
        journalLines: {
          where: {
            entry: {
              date: { gte: from, lte: to },
              status: 'posted',
            },
          },
        },
      },
    })

    const otherRevenue = revenueAccounts.reduce((sum, acct) =>
      sum + acct.journalLines.reduce((ls, line) => ls + (line.credit ?? 0), 0), 0)

    const totalRevenue = salesRevenue + otherRevenue

    // 4. Expense accounts: sum JournalLine.debit for expense-type accounts in period
    const expenseAccounts = await prisma.account.findMany({
      where: { type: 'expense', isActive: true },
      include: {
        journalLines: {
          where: {
            entry: {
              date: { gte: from, lte: to },
              status: 'posted',
            },
          },
        },
      },
    })

    const expenses = expenseAccounts
      .map(acct => ({
        accountCode: acct.code,
        accountName: acct.name,
        amount: acct.journalLines.reduce((sum, line) => sum + (line.debit ?? 0), 0),
      }))
      .filter(e => e.amount > 0)

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalRevenue - cogs
    const operatingIncome = grossProfit - totalExpenses
    const netIncome = operatingIncome

    return NextResponse.json({
      period: {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      },
      revenue: {
        salesRevenue,
        otherRevenue,
        totalRevenue,
      },
      costOfGoods: {
        cogs,
        totalCOGS: cogs,
      },
      grossProfit,
      expenses,
      totalExpenses,
      operatingIncome,
      netIncome,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
