import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const INVOICING_DATA = {
  kpis: {
    invoiceableThisMonth: 84300,
    invoicedYTD: 312400,
    outstandingUnpaid: 47200,
    avgPaymentDays: 31,
  },
  proposals: [
    { id: 'IP-2026-041', project: 'PRJ-2026-001', customer: 'Fabrikam Inc', amount: 12500, status: 'Ready to Post', created: '2026-04-22', due: '2026-05-22' },
    { id: 'IP-2026-040', project: 'PRJ-2026-002', customer: 'Contoso Ltd', amount: 9800, status: 'Under Review', created: '2026-04-20', due: '2026-05-20' },
    { id: 'IP-2026-039', project: 'PRJ-2026-001', customer: 'Fabrikam Inc', amount: 12500, status: 'Posted', created: '2026-04-15', due: '2026-05-15' },
    { id: 'IP-2026-038', project: 'PRJ-2026-006', customer: 'Northwind Traders', amount: 15200, status: 'Posted', created: '2026-04-10', due: '2026-05-10' },
    { id: 'IP-2026-037', project: 'PRJ-2026-007', customer: 'Fabrikam Inc', amount: 12500, status: 'Under Review', created: '2026-04-08', due: '2026-05-08' },
    { id: 'IP-2026-036', project: 'PRJ-2026-012', customer: 'Adatum Corp', amount: 11000, status: 'Posted', created: '2026-04-05', due: '2026-05-05' },
    { id: 'IP-2026-035', project: 'PRJ-2026-016', customer: 'Northwind Traders', amount: 9400, status: 'Rejected', created: '2026-04-01', due: '2026-05-01' },
    { id: 'IP-2026-034', project: 'PRJ-2026-003', customer: 'Internal', amount: 4200, status: 'Posted', created: '2026-03-28', due: '2026-04-28' },
  ],
  billingDetail: {
    proposalId: 'IP-2026-041',
    transactions: [
      { date: '2026-04-14', employee: 'Sarah Chen', activity: 'Development', units: 6, rate: 175, amount: 1050 },
      { date: '2026-04-14', employee: 'James Wu', activity: 'Development', units: 8, rate: 165, amount: 1320 },
      { date: '2026-04-15', employee: 'Sarah Chen', activity: 'Development', units: 7, rate: 175, amount: 1225 },
      { date: '2026-04-15', employee: 'Lisa Torres', activity: 'Analysis', units: 5, rate: 155, amount: 775 },
      { date: '2026-04-16', employee: 'James Wu', activity: 'Development', units: 8, rate: 165, amount: 1320 },
      { date: '2026-04-17', employee: 'Sarah Chen', activity: 'Meetings', units: 4, rate: 175, amount: 700 },
      { date: '2026-04-17', employee: 'Lisa Torres', activity: 'Documentation', units: 6, rate: 155, amount: 930 },
      { date: '2026-04-18', employee: 'James Wu', activity: 'QA Testing', units: 8, rate: 165, amount: 1320 },
    ],
    retentionPct: 10,
    retained: 1250,
    toBill: 11250,
    total: 12500,
  },
  revenueByProject: [
    { project: 'PRJ-2026-001', name: 'ERP Implementation', billed: 62500, contract: 125000 },
    { project: 'PRJ-2026-002', name: 'IT Infrastructure Upgrade', billed: 48200, contract: 80000 },
    { project: 'PRJ-2026-006', name: 'HR System Modernization', billed: 38000, contract: 95000 },
    { project: 'PRJ-2026-007', name: 'Data Warehouse Build', billed: 12500, contract: 150000 },
    { project: 'PRJ-2026-012', name: 'BI Dashboard Suite', billed: 33000, contract: 88000 },
  ],
  agingInvoices: [
    { bucket: 'Current', amount: 22400 },
    { bucket: '30+ Days', amount: 14800 },
    { bucket: '60+ Days', amount: 7200 },
    { bucket: '90+ Days', amount: 2800 },
  ],
  paymentHistory: [
    { date: '2026-04-18', customer: 'Adatum Corp', amount: 11000, daysToPay: 28 },
    { date: '2026-04-15', customer: 'Fabrikam Inc', amount: 12500, daysToPay: 30 },
    { date: '2026-04-10', customer: 'Contoso Ltd', amount: 9800, daysToPay: 33 },
    { date: '2026-04-05', customer: 'Northwind Traders', amount: 15200, daysToPay: 25 },
    { date: '2026-03-28', customer: 'Fabrikam Inc', amount: 12500, daysToPay: 31 },
  ],
}

export async function GET() {
  return NextResponse.json(INVOICING_DATA)
}
