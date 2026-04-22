import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SYSTEM_TEMPLATES = [
  {
    name: 'Income Statement',
    description: 'Standard P&L showing revenue, COGS, gross profit, operating expenses, and net income',
    type: 'income_statement',
    rows: [
      { rowNo: 10, description: 'REVENUE', rowType: 'heading', bold: true },
      { rowNo: 20, description: 'Sales Revenue', rowType: 'account', accountRange: '4000..4999', indent: 1 },
      { rowNo: 30, description: 'Other Revenue', rowType: 'account', accountRange: '4900..4999', indent: 1 },
      { rowNo: 40, description: 'Total Revenue', rowType: 'formula', formula: 'ROW(20)+ROW(30)', bold: true, underline: true },
      { rowNo: 50, description: '', rowType: 'blank' },
      { rowNo: 60, description: 'COST OF GOODS SOLD', rowType: 'heading', bold: true },
      { rowNo: 70, description: 'Cost of Goods Sold', rowType: 'account', accountRange: '5000..5999', indent: 1 },
      { rowNo: 80, description: 'Total COGS', rowType: 'formula', formula: 'ROW(70)', bold: true, underline: true },
      { rowNo: 90, description: '', rowType: 'blank' },
      { rowNo: 100, description: 'GROSS PROFIT', rowType: 'formula', formula: 'ROW(40)-ROW(80)', bold: true },
      { rowNo: 110, description: '', rowType: 'blank' },
      { rowNo: 120, description: 'OPERATING EXPENSES', rowType: 'heading', bold: true },
      { rowNo: 130, description: 'Operating Expenses', rowType: 'account', accountRange: '6000..6999', indent: 1 },
      { rowNo: 140, description: 'Total Operating Expenses', rowType: 'formula', formula: 'ROW(130)', bold: true, underline: true },
      { rowNo: 150, description: '', rowType: 'blank' },
      { rowNo: 160, description: 'NET INCOME', rowType: 'formula', formula: 'ROW(100)-ROW(140)', bold: true, underline: true },
    ],
  },
  {
    name: 'Balance Sheet',
    description: 'Assets, liabilities, and equity at a point in time',
    type: 'balance_sheet',
    rows: [
      { rowNo: 10, description: 'ASSETS', rowType: 'heading', bold: true },
      { rowNo: 20, description: 'Current Assets', rowType: 'heading', indent: 1 },
      { rowNo: 30, description: 'Cash & Equivalents', rowType: 'account', accountRange: '1000..1099', indent: 2 },
      { rowNo: 40, description: 'Accounts Receivable', rowType: 'account', accountRange: '1100..1199', indent: 2 },
      { rowNo: 50, description: 'Inventory', rowType: 'account', accountRange: '1200..1299', indent: 2 },
      { rowNo: 60, description: 'Total Current Assets', rowType: 'formula', formula: 'ROW(30)+ROW(40)+ROW(50)', bold: true, indent: 1, underline: true },
      { rowNo: 70, description: 'Fixed Assets', rowType: 'account', accountRange: '1500..1999', indent: 2 },
      { rowNo: 80, description: 'TOTAL ASSETS', rowType: 'formula', formula: 'ROW(60)+ROW(70)', bold: true, underline: true },
      { rowNo: 90, description: '', rowType: 'blank' },
      { rowNo: 100, description: 'LIABILITIES', rowType: 'heading', bold: true },
      { rowNo: 110, description: 'Accounts Payable', rowType: 'account', accountRange: '2000..2099', indent: 1 },
      { rowNo: 120, description: 'Other Liabilities', rowType: 'account', accountRange: '2100..2999', indent: 1 },
      { rowNo: 130, description: 'TOTAL LIABILITIES', rowType: 'formula', formula: 'ROW(110)+ROW(120)', bold: true, underline: true },
      { rowNo: 140, description: '', rowType: 'blank' },
      { rowNo: 150, description: 'EQUITY', rowType: 'heading', bold: true },
      { rowNo: 160, description: 'Retained Earnings', rowType: 'account', accountRange: '3000..3999', indent: 1 },
      { rowNo: 170, description: 'TOTAL EQUITY', rowType: 'formula', formula: 'ROW(160)', bold: true, underline: true },
      { rowNo: 180, description: '', rowType: 'blank' },
      { rowNo: 190, description: 'TOTAL LIABILITIES & EQUITY', rowType: 'formula', formula: 'ROW(130)+ROW(170)', bold: true, underline: true },
    ],
  },
  {
    name: 'Trial Balance',
    description: 'All accounts with debit and credit balances',
    type: 'trial_balance',
    rows: [
      { rowNo: 10, description: 'Asset Accounts', rowType: 'heading', bold: true },
      { rowNo: 20, description: 'Assets (1000–1999)', rowType: 'account', accountRange: '1000..1999', indent: 1 },
      { rowNo: 30, description: 'Liability Accounts', rowType: 'heading', bold: true },
      { rowNo: 40, description: 'Liabilities (2000–2999)', rowType: 'account', accountRange: '2000..2999', indent: 1 },
      { rowNo: 50, description: 'Equity Accounts', rowType: 'heading', bold: true },
      { rowNo: 60, description: 'Equity (3000–3999)', rowType: 'account', accountRange: '3000..3999', indent: 1 },
      { rowNo: 70, description: 'Revenue Accounts', rowType: 'heading', bold: true },
      { rowNo: 80, description: 'Revenue (4000–4999)', rowType: 'account', accountRange: '4000..4999', indent: 1, showOpposite: true },
      { rowNo: 90, description: 'Expense Accounts', rowType: 'heading', bold: true },
      { rowNo: 100, description: 'Expenses (5000–6999)', rowType: 'account', accountRange: '5000..6999', indent: 1 },
      { rowNo: 110, description: '', rowType: 'blank' },
      { rowNo: 120, description: 'NET BALANCE', rowType: 'formula', formula: 'ROW(20)+ROW(40)+ROW(60)+ROW(80)+ROW(100)', bold: true, underline: true },
    ],
  },
  {
    name: 'Cash Flow Statement',
    description: 'Operating, investing, and financing cash flows',
    type: 'cash_flow',
    rows: [
      { rowNo: 10, description: 'OPERATING ACTIVITIES', rowType: 'heading', bold: true },
      { rowNo: 20, description: 'Net Income', rowType: 'account', accountRange: '4000..6999', indent: 1 },
      { rowNo: 30, description: 'Adjustments', rowType: 'account', accountRange: '1200..1299', indent: 1, showOpposite: true },
      { rowNo: 40, description: 'Net Cash from Operations', rowType: 'formula', formula: 'ROW(20)+ROW(30)', bold: true, underline: true },
      { rowNo: 50, description: '', rowType: 'blank' },
      { rowNo: 60, description: 'INVESTING ACTIVITIES', rowType: 'heading', bold: true },
      { rowNo: 70, description: 'Fixed Asset Changes', rowType: 'account', accountRange: '1500..1999', indent: 1, showOpposite: true },
      { rowNo: 80, description: 'Net Cash from Investing', rowType: 'formula', formula: 'ROW(70)', bold: true, underline: true },
      { rowNo: 90, description: '', rowType: 'blank' },
      { rowNo: 100, description: 'FINANCING ACTIVITIES', rowType: 'heading', bold: true },
      { rowNo: 110, description: 'Debt Changes', rowType: 'account', accountRange: '2000..2999', indent: 1 },
      { rowNo: 120, description: 'Net Cash from Financing', rowType: 'formula', formula: 'ROW(110)', bold: true, underline: true },
      { rowNo: 130, description: '', rowType: 'blank' },
      { rowNo: 140, description: 'NET CHANGE IN CASH', rowType: 'formula', formula: 'ROW(40)+ROW(80)+ROW(120)', bold: true, underline: true },
    ],
  },
]

export async function GET() {
  let created = 0

  for (const tpl of SYSTEM_TEMPLATES) {
    const existing = await prisma.financialReportTemplate.findFirst({ where: { name: tpl.name } })
    if (existing) continue

    await prisma.financialReportTemplate.create({
      data: {
        name: tpl.name,
        description: tpl.description,
        type: tpl.type,
        isSystem: true,
        rows: {
          create: tpl.rows.map(r => ({
            rowNo: r.rowNo,
            description: r.description,
            rowType: r.rowType,
            accountRange: (r as { accountRange?: string }).accountRange ?? null,
            formula: (r as { formula?: string }).formula ?? null,
            bold: r.bold ?? false,
            underline: r.underline ?? false,
            indent: r.indent ?? 0,
            showOpposite: (r as { showOpposite?: boolean }).showOpposite ?? false,
          })),
        },
      },
    })
    created++
  }

  return NextResponse.json({
    message: `Seeded ${created} system templates`,
    total: SYSTEM_TEMPLATES.length,
    alreadyExisted: SYSTEM_TEMPLATES.length - created,
  })
}
