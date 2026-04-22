export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const CASES = [
  { id: 1, caseNo: 'CASE-2026-0891', subject: 'Cannot access account portal',         customer: 'Fabrikam Inc',        contactPerson: 'Jane Martinez',  phone: '+1 555 0201', priority: 'High',     status: 'Open',        category: 'Technical', subCategory: 'Authentication', agent: 'Alice Chen', created: 'Apr 22', slaStatus: 'remaining', slaText: '4h remaining', age: '2h',  description: 'Customer reports inability to log in to the self-service account portal.', resolutionNotes: '', linkedOrder: 'SO-2026-4812', linkedInvoice: '' },
  { id: 2, caseNo: 'CASE-2026-0890', subject: 'Billing discrepancy — Invoice 4821',   customer: 'Contoso Ltd',         contactPerson: 'Mike Brown',     phone: '+1 555 0302', priority: 'Medium',   status: 'In Progress', category: 'Billing',   subCategory: 'Invoice Error',   agent: 'Bob Wilson',  created: 'Apr 21', slaStatus: 'met',       slaText: 'Met',          age: '18h', description: 'Customer disputes line item charges on Invoice #INV-4821.',              resolutionNotes: 'Reviewing contract terms with Finance.', linkedOrder: '', linkedInvoice: 'INV-4821' },
  { id: 3, caseNo: 'CASE-2026-0889', subject: 'Product defect — Control Panel',       customer: 'Adatum Corp',         contactPerson: 'Sarah Jones',    phone: '+1 555 0403', priority: 'Critical', status: 'Escalated',   category: 'Product',   subCategory: 'Hardware Defect', agent: 'Manager',     created: 'Apr 20', slaStatus: 'breached',  slaText: 'Breached',     age: '28h', description: 'Critical defect in Control Panel unit. Production line stopped.',       resolutionNotes: 'Field engineer dispatched. Replacement unit approved.', linkedOrder: 'SO-2026-4701', linkedInvoice: 'INV-4799' },
  { id: 4, caseNo: 'CASE-2026-0888', subject: 'Return request — SO-2026-4750',        customer: 'Fabrikam Inc',        contactPerson: 'Jane Martinez',  phone: '+1 555 0201', priority: 'Low',      status: 'Resolved',    category: 'Returns',   subCategory: 'Damaged Goods',   agent: 'Alice Chen',  created: 'Apr 18', slaStatus: 'met',       slaText: 'Met',          age: '—',   description: 'Return for 5 units received in damaged condition.',                      resolutionNotes: 'RMA approved. Credit note issued.', linkedOrder: 'SO-2026-4750', linkedInvoice: 'INV-4780' },
  { id: 5, caseNo: 'CASE-2026-0887', subject: 'System integration error — API 500',   customer: 'Northwind Traders',   contactPerson: 'Emily Davis',    phone: '+1 555 0605', priority: 'High',     status: 'In Progress', category: 'Technical', subCategory: 'API',             agent: 'Bob Wilson',  created: 'Apr 21', slaStatus: 'remaining', slaText: '6h remaining', age: '22h', description: 'REST API returning 500 errors since Apr 20 maintenance window.',         resolutionNotes: 'Reviewing server logs.', linkedOrder: '', linkedInvoice: '' },
  { id: 6, caseNo: 'CASE-2026-0886', subject: 'Incorrect pricing on quote QT-221',    customer: 'Litware Inc',         contactPerson: 'Robert Chen',    phone: '+1 555 0504', priority: 'Medium',   status: 'Open',        category: 'Sales',     subCategory: 'Pricing',         agent: 'Carlos M.',   created: 'Apr 22', slaStatus: 'remaining', slaText: '8h remaining', age: '1h',  description: 'Quote reflects list price instead of negotiated contract price.',         resolutionNotes: '', linkedOrder: '', linkedInvoice: '' },
  { id: 7, caseNo: 'CASE-2026-0885', subject: 'Shipment delay — Order SO-2026-4788',  customer: 'Alpine Ski House',    contactPerson: 'David Wilson',   phone: '+1 555 0706', priority: 'Medium',   status: 'In Progress', category: 'Logistics', subCategory: 'Delivery',        agent: 'Alice Chen',  created: 'Apr 20', slaStatus: 'met',       slaText: 'Met',          age: '2d',  description: 'Order 5 days overdue. Tracking shows shipment stuck at regional hub.',  resolutionNotes: 'Carrier claim filed. Expedited shipment arranged.', linkedOrder: 'SO-2026-4788', linkedInvoice: '' },
  { id: 8, caseNo: 'CASE-2026-0884', subject: 'Feature request — Bulk export',        customer: 'Trey Research',       contactPerson: 'Lisa Anderson',  phone: '+1 555 0807', priority: 'Low',      status: 'Closed',      category: 'Product',   subCategory: 'Feature Request', agent: 'Bob Wilson',  created: 'Apr 15', slaStatus: 'met',       slaText: 'Met',          age: '—',   description: 'Bulk CSV export for reporting module. Needs 50,000+ records.',           resolutionNotes: 'Feature logged in Q3 backlog (PROD-1122).', linkedOrder: '', linkedInvoice: '' },
  { id: 9, caseNo: 'CASE-2026-0883', subject: 'Payroll calculation discrepancy',      customer: 'Humongous Insurance', contactPerson: 'Amanda Clark',   phone: '+1 555 1009', priority: 'Critical', status: 'Escalated',   category: 'Billing',   subCategory: 'Payroll',         agent: 'Manager',     created: 'Apr 19', slaStatus: 'breached',  slaText: 'Breached',     age: '3d',  description: 'Overtime pay computed at standard rate instead of 1.5x. 47 employees.', resolutionNotes: 'Patch in QA testing.', linkedOrder: '', linkedInvoice: '' },
  { id:10, caseNo: 'CASE-2026-0882', subject: 'Warranty claim — SKU-7733',             customer: 'Coho Winery',         contactPerson: 'Sandra White',   phone: '+1 555 1413', priority: 'Medium',   status: 'Open',        category: 'Returns',   subCategory: 'Warranty',        agent: 'Carlos M.',   created: 'Apr 22', slaStatus: 'remaining', slaText: '12h remaining',age: '30m', description: 'SKU-7733 power supply unit non-functional after 120 days.',              resolutionNotes: '', linkedOrder: 'SO-2026-4680', linkedInvoice: 'INV-4700' },
  { id:11, caseNo: 'CASE-2026-0881', subject: 'Training request — New ERP users',     customer: 'Relecloud Corp',      contactPerson: 'Patricia Lee',   phone: '+1 555 1211', priority: 'Low',      status: 'Open',        category: 'Training',  subCategory: 'Onboarding',      agent: 'Alice Chen',  created: 'Apr 22', slaStatus: 'remaining', slaText: '1d remaining', age: '4h',  description: '12 new users need 2-hour onboarding session. Preferred Apr 28–29.',     resolutionNotes: '', linkedOrder: '', linkedInvoice: '' },
  { id:12, caseNo: 'CASE-2026-0880', subject: 'Performance degradation — Reports',    customer: 'Adventure Works',     contactPerson: 'Christine Nguyen',phone: '+1 555 1817',priority: 'High',     status: 'In Progress', category: 'Technical', subCategory: 'Performance',     agent: 'Bob Wilson',  created: 'Apr 21', slaStatus: 'remaining', slaText: '3h remaining', age: '20h', description: 'Reports module taking 4-8 min to load after Apr 18 data migration.',    resolutionNotes: 'Index rebuild scheduled. Query optimization in progress.', linkedOrder: '', linkedInvoice: '' },
  { id:13, caseNo: 'CASE-2026-0879', subject: 'Duplicate invoice — INV-4805',         customer: 'Wide World Importers',contactPerson: 'Nancy Evans',    phone: '+1 555 1615', priority: 'Medium',   status: 'Resolved',    category: 'Billing',   subCategory: 'Duplicate',       agent: 'Carlos M.',   created: 'Apr 17', slaStatus: 'met',       slaText: 'Met',          age: '—',   description: 'Customer received duplicate invoice INV-4805. Total $12,400.',          resolutionNotes: 'Duplicate voided. Credit note issued.', linkedOrder: 'SO-2026-4742', linkedInvoice: 'INV-4805' },
  { id:14, caseNo: 'CASE-2026-0878', subject: 'Account reactivation request',         customer: 'Margie Travel',       contactPerson: 'Andrew Peterson',phone: '+1 555 1918', priority: 'Low',      status: 'Closed',      category: 'Account',   subCategory: 'Reactivation',    agent: 'Alice Chen',  created: 'Apr 14', slaStatus: 'met',       slaText: 'Met',          age: '—',   description: 'Account auto-suspended after 90-day inactivity. 4 users need access.',  resolutionNotes: 'Account reactivated. Users restored.', linkedOrder: '', linkedInvoice: '' },
  { id:15, caseNo: 'CASE-2026-0877', subject: 'Data export missing fields — GDPR',   customer: 'Bellows College',     contactPerson: 'Michelle Torres',phone: '+1 555 2019', priority: 'High',     status: 'Open',        category: 'Compliance',subCategory: 'GDPR',            agent: 'Carlos M.',   created: 'Apr 22', slaStatus: 'remaining', slaText: '2h remaining', age: '3h',  description: 'DSAR export missing financial transaction history 2024-2025. Legal deadline: Apr 29.', resolutionNotes: '', linkedOrder: '', linkedInvoice: '' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search   = (searchParams.get('search')   ?? '').toLowerCase()
  const status   = searchParams.get('status')    ?? ''
  const priority = searchParams.get('priority')  ?? ''
  const agent    = searchParams.get('agent')     ?? ''
  const category = searchParams.get('category')  ?? ''

  const rows = CASES.filter(c => {
    if (search   && !c.caseNo.toLowerCase().includes(search) && !c.subject.toLowerCase().includes(search) && !c.customer.toLowerCase().includes(search)) return false
    if (status   && c.status   !== status)   return false
    if (priority && c.priority !== priority) return false
    if (agent    && c.agent    !== agent)    return false
    if (category && c.category !== category) return false
    return true
  })

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, customer, category, priority, description, assignTo, relatedOrder } = body
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const newCase = {
    id: Date.now(),
    caseNo: 'CASE-2026-' + String(Date.now()).slice(-4),
    subject: title,
    customer: customer ?? '',
    contactPerson: '',
    phone: '',
    priority: priority ?? 'Medium',
    status: 'Open',
    category: category ?? 'Other',
    subCategory: '',
    agent: assignTo ?? 'Alice Chen',
    created: 'Today',
    slaStatus: 'remaining',
    slaText: '48h remaining',
    age: '0m',
    description: description ?? '',
    resolutionNotes: '',
    linkedOrder: relatedOrder ?? '',
    linkedInvoice: '',
  }

  return NextResponse.json(newCase, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status, resolutionNotes } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const found = CASES.find(c => c.id === id)
  if (!found) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json({ ...found, status: status ?? found.status, resolutionNotes: resolutionNotes ?? found.resolutionNotes })
}
