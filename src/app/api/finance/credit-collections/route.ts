'use server'
import { NextResponse } from 'next/server'

const agents = ['Sarah Mitchell', 'James Rivera', 'Priya Nair', 'Tom Caldwell']

const customers = [
  { id: 'C001', name: 'Apex Technologies LLC', balance: 84200, overdue: 84200, daysOverdue: 97, creditLimit: 150000, lastPayment: '2025-12-15', agent: agents[0], status: '90+' },
  { id: 'C002', name: 'Blue Ridge Manufacturing', balance: 127500, overdue: 0, daysOverdue: 0, creditLimit: 200000, lastPayment: '2026-01-10', agent: agents[1], status: 'current' },
  { id: 'C003', name: 'Cascade Retail Group', balance: 43800, overdue: 43800, daysOverdue: 67, creditLimit: 75000, lastPayment: '2025-11-20', agent: agents[2], status: '60+' },
  { id: 'C004', name: 'Delphi Distribution Co.', balance: 18900, overdue: 18900, daysOverdue: 38, creditLimit: 50000, lastPayment: '2025-12-28', agent: agents[0], status: '30+' },
  { id: 'C005', name: 'Evergreen Supply Chain', balance: 95000, overdue: 0, daysOverdue: 0, creditLimit: 100000, lastPayment: '2026-01-05', agent: agents[3], status: 'current' },
  { id: 'C006', name: 'Frontier Logistics Inc.', balance: 31400, overdue: 31400, daysOverdue: 45, creditLimit: 60000, lastPayment: '2025-12-01', agent: agents[1], status: '30+' },
  { id: 'C007', name: 'Glacier Point Services', balance: 7800, overdue: 7800, daysOverdue: 0, creditLimit: 25000, lastPayment: '2025-10-15', agent: agents[2], status: 'write-off' },
  { id: 'C008', name: 'Harbor View Enterprises', balance: 56200, overdue: 0, daysOverdue: 0, creditLimit: 80000, lastPayment: '2026-01-12', agent: agents[3], status: 'current' },
  { id: 'C009', name: 'Iron Gate Holdings', balance: 22100, overdue: 22100, daysOverdue: 73, creditLimit: 40000, lastPayment: '2025-11-08', agent: agents[0], status: '60+' },
  { id: 'C010', name: 'Juniper Creek Systems', balance: 48350, overdue: 48350, daysOverdue: 112, creditLimit: 50000, lastPayment: '2025-09-30', agent: agents[1], status: '90+' },
]

const activities: Record<string, { date: string; action: string; amount: number | null; agent: string }[]> = {
  C001: [
    { date: '2026-01-08', action: 'Collection call — no answer', amount: null, agent: agents[0] },
    { date: '2026-01-02', action: 'Statement sent via email', amount: null, agent: agents[0] },
    { date: '2025-12-15', action: 'Payment received', amount: 12000, agent: agents[0] },
  ],
  C003: [
    { date: '2026-01-10', action: 'Collection letter mailed', amount: null, agent: agents[2] },
    { date: '2025-11-20', action: 'Partial payment received', amount: 5000, agent: agents[2] },
  ],
  C004: [
    { date: '2026-01-12', action: 'Promise to pay — Jan 20', amount: 18900, agent: agents[0] },
  ],
  C006: [
    { date: '2026-01-11', action: 'Collection call — payment promised', amount: 31400, agent: agents[1] },
  ],
  C009: [
    { date: '2026-01-09', action: 'Dispute raised by customer', amount: null, agent: agents[0] },
    { date: '2025-11-08', action: 'Last payment applied', amount: 8000, agent: agents[0] },
  ],
  C010: [
    { date: '2026-01-07', action: 'Account placed on hold', amount: null, agent: agents[1] },
    { date: '2025-12-12', action: 'Final notice sent', amount: null, agent: agents[1] },
    { date: '2025-09-30', action: 'Last payment applied', amount: 5000, agent: agents[1] },
  ],
}

export async function GET() {
  const totalAR = customers.reduce((s, c) => s + c.balance, 0)
  const overdue = customers.reduce((s, c) => s + c.overdue, 0)
  const ninetyPlus = customers
    .filter((c) => c.status === '90+' || c.status === 'write-off')
    .reduce((s, c) => s + c.overdue, 0)
  const dso = 38

  const aging = {
    current: customers.filter((c) => c.status === 'current').reduce((s, c) => s + c.balance, 0),
    d1_30: customers.filter((c) => c.status === '30+').reduce((s, c) => s + c.overdue, 0),
    d31_60: customers.filter((c) => c.status === '60+').reduce((s, c) => s + c.overdue, 0),
    d61_90: 0,
    d90plus: customers.filter((c) => c.status === '90+' || c.status === 'write-off').reduce((s, c) => s + c.overdue, 0),
  }

  return NextResponse.json({ kpis: { totalAR, overdue, ninetyPlus, dso }, aging, customers, activities })
}
