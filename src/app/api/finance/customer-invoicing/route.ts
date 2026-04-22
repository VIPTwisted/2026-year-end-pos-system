'use server'
import { NextResponse } from 'next/server'

type InvoiceStatus = 'draft' | 'posted' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'written-off'

interface Invoice {
  id: string
  number: string
  customer: string
  invoiceDate: string
  dueDate: string
  amount: number
  tax: number
  total: number
  paid: number
  balance: number
  status: InvoiceStatus
}

const invoices: Invoice[] = [
  { id: 'I001', number: 'INV-2026-0112', customer: 'Apex Technologies LLC',    invoiceDate: '2026-01-02', dueDate: '2026-02-01', amount: 18400,  tax: 1656,  total: 20056,  paid: 0,      balance: 20056, status: 'overdue' },
  { id: 'I002', number: 'INV-2026-0111', customer: 'Blue Ridge Manufacturing', invoiceDate: '2026-01-05', dueDate: '2026-02-04', amount: 42000,  tax: 3780,  total: 45780,  paid: 45780,  balance: 0,     status: 'paid' },
  { id: 'I003', number: 'INV-2026-0110', customer: 'Cascade Retail Group',     invoiceDate: '2026-01-06', dueDate: '2026-02-05', amount: 9800,   tax: 882,   total: 10682,  paid: 5000,   balance: 5682,  status: 'partial' },
  { id: 'I004', number: 'INV-2026-0109', customer: 'Delphi Distribution Co.',  invoiceDate: '2025-12-28', dueDate: '2026-01-27', amount: 27500,  tax: 2475,  total: 29975,  paid: 0,      balance: 29975, status: 'draft' },
  { id: 'I005', number: 'INV-2026-0108', customer: 'Evergreen Supply Chain',   invoiceDate: '2026-01-08', dueDate: '2026-02-07', amount: 61200,  tax: 5508,  total: 66708,  paid: 66708,  balance: 0,     status: 'paid' },
  { id: 'I006', number: 'INV-2026-0107', customer: 'Frontier Logistics Inc.',  invoiceDate: '2026-01-03', dueDate: '2026-02-02', amount: 14700,  tax: 1323,  total: 16023,  paid: 0,      balance: 16023, status: 'posted' },
  { id: 'I007', number: 'INV-2026-0106', customer: 'Glacier Point Services',   invoiceDate: '2025-12-15', dueDate: '2026-01-14', amount: 7800,   tax: 702,   total: 8502,   paid: 0,      balance: 8502,  status: 'written-off' },
  { id: 'I008', number: 'INV-2026-0105', customer: 'Harbor View Enterprises',  invoiceDate: '2026-01-09', dueDate: '2026-02-08', amount: 33600,  tax: 3024,  total: 36624,  paid: 36624,  balance: 0,     status: 'paid' },
  { id: 'I009', number: 'INV-2026-0104', customer: 'Iron Gate Holdings',       invoiceDate: '2026-01-10', dueDate: '2026-02-09', amount: 22100,  tax: 1989,  total: 24089,  paid: 10000,  balance: 14089, status: 'partial' },
  { id: 'I010', number: 'INV-2026-0103', customer: 'Juniper Creek Systems',    invoiceDate: '2026-01-11', dueDate: '2026-02-10', amount: 48000,  tax: 4320,  total: 52320,  paid: 0,      balance: 52320, status: 'overdue' },
  { id: 'I011', number: 'INV-2026-0102', customer: 'Kingston Media Group',     invoiceDate: '2026-01-12', dueDate: '2026-02-11', amount: 15900,  tax: 1431,  total: 17331,  paid: 0,      balance: 17331, status: 'cancelled' },
  { id: 'I012', number: 'INV-2026-0101', customer: 'Lakewood Health Systems',  invoiceDate: '2026-01-13', dueDate: '2026-02-12', amount: 11350,  tax: 1021,  total: 12371,  paid: 12371,  balance: 0,     status: 'paid' },
]

export async function GET() {
  const thisMonth = invoices.filter((i) => i.invoiceDate.startsWith('2026-01'))
  const totalBilled = thisMonth.reduce((s, i) => s + i.total, 0)
  const collected = thisMonth.reduce((s, i) => s + i.paid, 0)
  const outstanding = thisMonth.reduce((s, i) => s + i.balance, 0)

  return NextResponse.json({
    kpis: {
      invoicesThisMonth: thisMonth.length,
      totalBilled,
      collected,
      outstanding,
    },
    invoices,
  })
}
