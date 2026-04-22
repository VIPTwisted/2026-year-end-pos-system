import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEED_LOGS = [
  { id: 'AL-001', timestamp: '2026-04-22T09:14:22Z', user: 'sarah.chen@novapos.com', action: 'Login', module: 'Authentication', recordType: 'Session', recordId: 'SES-8821', oldValue: null, newValue: null, ipAddress: '192.168.1.45' },
  { id: 'AL-002', timestamp: '2026-04-22T09:15:03Z', user: 'sarah.chen@novapos.com', action: 'Viewed', module: 'Sales', recordType: 'Order', recordId: 'SO-10482', oldValue: null, newValue: null, ipAddress: '192.168.1.45' },
  { id: 'AL-003', timestamp: '2026-04-22T09:18:47Z', user: 'marcus.reid@novapos.com', action: 'Login', module: 'Authentication', recordType: 'Session', recordId: 'SES-8822', oldValue: null, newValue: null, ipAddress: '10.0.2.22' },
  { id: 'AL-004', timestamp: '2026-04-22T09:22:11Z', user: 'admin@novapos.com', action: 'Created', module: 'Inventory', recordType: 'Product', recordId: 'PROD-5593', oldValue: null, newValue: '{"name":"Widget Pro","sku":"WP-001","price":29.99}', ipAddress: '192.168.1.1' },
  { id: 'AL-005', timestamp: '2026-04-22T09:31:05Z', user: 'sarah.chen@novapos.com', action: 'Updated', module: 'Customers', recordType: 'Customer', recordId: 'CUST-2241', oldValue: '{"email":"old@email.com"}', newValue: '{"email":"new@email.com"}', ipAddress: '192.168.1.45' },
  { id: 'AL-006', timestamp: '2026-04-22T09:35:50Z', user: 'james.wu@novapos.com', action: 'Login', module: 'Authentication', recordType: 'Session', recordId: 'FAIL-001', oldValue: null, newValue: '{"reason":"Invalid password"}', ipAddress: '203.0.113.5' },
  { id: 'AL-007', timestamp: '2026-04-22T09:36:12Z', user: 'james.wu@novapos.com', action: 'Login', module: 'Authentication', recordType: 'Session', recordId: 'FAIL-002', oldValue: null, newValue: '{"reason":"Invalid password"}', ipAddress: '203.0.113.5' },
  { id: 'AL-008', timestamp: '2026-04-22T09:41:33Z', user: 'admin@novapos.com', action: 'Approved', module: 'Purchasing', recordType: 'PO', recordId: 'PO-0882', oldValue: '{"status":"pending"}', newValue: '{"status":"approved"}', ipAddress: '192.168.1.1' },
  { id: 'AL-009', timestamp: '2026-04-22T09:50:18Z', user: 'marcus.reid@novapos.com', action: 'Exported', module: 'Finance', recordType: 'Report', recordId: 'RPT-Q1-2026', oldValue: null, newValue: '{"format":"xlsx","rows":4821}', ipAddress: '10.0.2.22' },
  { id: 'AL-010', timestamp: '2026-04-22T09:58:44Z', user: 'admin@novapos.com', action: 'Deleted', module: 'Inventory', recordType: 'Product', recordId: 'PROD-0012', oldValue: '{"name":"Discontinued Item","sku":"DI-012"}', newValue: null, ipAddress: '192.168.1.1' },
  { id: 'AL-011', timestamp: '2026-04-22T10:02:07Z', user: 'sarah.chen@novapos.com', action: 'Created', module: 'Sales', recordType: 'Order', recordId: 'SO-10483', oldValue: null, newValue: '{"total":342.50,"items":3}', ipAddress: '192.168.1.45' },
  { id: 'AL-012', timestamp: '2026-04-22T10:11:29Z', user: 'nina.patel@novapos.com', action: 'Exported', module: 'Customers', recordType: 'Customer List', recordId: 'EXPORT-0441', oldValue: null, newValue: '{"format":"csv","count":1280}', ipAddress: '10.0.3.15' },
  { id: 'AL-013', timestamp: '2026-04-22T10:18:53Z', user: 'admin@novapos.com', action: 'Updated', module: 'Administration', recordType: 'User', recordId: 'USR-0088', oldValue: '{"role":"viewer"}', newValue: '{"role":"manager"}', ipAddress: '192.168.1.1' },
  { id: 'AL-014', timestamp: '2026-04-22T10:25:41Z', user: 'marcus.reid@novapos.com', action: 'Approved', module: 'Finance', recordType: 'Journal Entry', recordId: 'JE-20460', oldValue: '{"status":"draft"}', newValue: '{"status":"posted"}', ipAddress: '10.0.2.22' },
  { id: 'AL-015', timestamp: '2026-04-22T10:33:17Z', user: 'nina.patel@novapos.com', action: 'Rejected', module: 'Purchasing', recordType: 'Purchase Req', recordId: 'PR-0194', oldValue: '{"status":"pending"}', newValue: '{"status":"rejected","reason":"Over budget"}', ipAddress: '10.0.3.15' },
  { id: 'AL-016', timestamp: '2026-04-22T10:41:05Z', user: 'admin@novapos.com', action: 'Deleted', module: 'Customers', recordType: 'Contact', recordId: 'CON-0772', oldValue: '{"name":"Test Contact"}', newValue: null, ipAddress: '192.168.1.1' },
  { id: 'AL-017', timestamp: '2026-04-22T10:49:22Z', user: 'sarah.chen@novapos.com', action: 'Exported', module: 'Inventory', recordType: 'Stock Report', recordId: 'EXPORT-0442', oldValue: null, newValue: '{"format":"pdf","pages":12}', ipAddress: '192.168.1.45' },
  { id: 'AL-018', timestamp: '2026-04-22T10:57:38Z', user: 'james.wu@novapos.com', action: 'Created', module: 'HR', recordType: 'Employee', recordId: 'EMP-0381', oldValue: null, newValue: '{"name":"Alex Rivera","dept":"Warehouse"}', ipAddress: '10.0.1.88' },
  { id: 'AL-019', timestamp: '2026-04-22T11:08:14Z', user: 'marcus.reid@novapos.com', action: 'Exported', module: 'Finance', recordType: 'Audit Report', recordId: 'EXPORT-0443', oldValue: null, newValue: '{"format":"pdf","rows":892}', ipAddress: '10.0.2.22' },
  { id: 'AL-020', timestamp: '2026-04-22T11:15:50Z', user: 'admin@novapos.com', action: 'Logout', module: 'Authentication', recordType: 'Session', recordId: 'SES-8821', oldValue: null, newValue: null, ipAddress: '192.168.1.1' },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const module = searchParams.get('module')
  const user = searchParams.get('user')
  const action = searchParams.get('action')
  const search = searchParams.get('search')?.toLowerCase()

  let logs = [...SEED_LOGS]
  if (module) logs = logs.filter(l => l.module.toLowerCase() === module.toLowerCase())
  if (user) logs = logs.filter(l => l.user.toLowerCase().includes(user.toLowerCase()))
  if (action) logs = logs.filter(l => l.action.toLowerCase() === action.toLowerCase())
  if (search) logs = logs.filter(l =>
    l.user.toLowerCase().includes(search) ||
    l.module.toLowerCase().includes(search) ||
    l.recordId.toLowerCase().includes(search)
  )

  const failedLogins = SEED_LOGS.filter(l => l.action === 'Login' && l.recordId.startsWith('FAIL')).length
  const deletions = SEED_LOGS.filter(l => l.action === 'Deleted').length
  const exports = SEED_LOGS.filter(l => l.action === 'Exported').length

  return NextResponse.json({
    logs,
    kpis: { totalToday: SEED_LOGS.length, failedLogins, deletions, exports },
  })
}
