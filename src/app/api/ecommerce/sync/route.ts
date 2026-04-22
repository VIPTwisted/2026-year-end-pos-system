import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CHANNELS = [
  { name: 'Website', url: 'novapos.com', status: 'healthy', lastSync: '2 min ago', frequency: 'Every 5 min',  items: 2847, errors: 0 },
  { name: 'Mobile App',                  status: 'healthy', lastSync: '2 min ago', frequency: 'Every 5 min',  items: 2847, errors: 0 },
  { name: 'Amazon',                      status: 'warning', lastSync: '45 min ago', frequency: 'Every 15 min', items: 1204, errors: 3 },
  { name: 'eBay',                        status: 'error',   lastSync: '2 hrs ago',  frequency: 'Every 30 min', items: 847,  errors: 12 },
]

const QUEUE = [
  { itemNo: '1000', description: 'Widget Assembly A100',   action: 'Price Update',     channel: 'Amazon',  status: 'Pending',     lastAttempt: '—',      error: null },
  { itemNo: '1001', description: 'Motor Housing B200',     action: 'Inventory Update', channel: 'Website', status: 'Complete',    lastAttempt: '2 min',  error: null },
  { itemNo: '1002', description: 'Control Panel C300',     action: 'New Listing',      channel: 'eBay',    status: 'Failed',      lastAttempt: '2 hrs',  error: 'API timeout' },
  { itemNo: '1003', description: 'Sensor Module D400',     action: 'Price Update',     channel: 'Website', status: 'Complete',    lastAttempt: '5 min',  error: null },
  { itemNo: '1004', description: 'Cable Assembly E500',    action: 'Inventory Update', channel: 'Amazon',  status: 'Pending',     lastAttempt: '—',      error: null },
  { itemNo: '1005', description: 'Power Supply F600',      action: 'Price Update',     channel: 'eBay',    status: 'Failed',      lastAttempt: '2 hrs',  error: 'Auth error 401' },
  { itemNo: '1006', description: 'Display Unit G700',      action: 'New Listing',      channel: 'Amazon',  status: 'In Progress', lastAttempt: '1 min',  error: null },
  { itemNo: '1007', description: 'PCB Board H800',         action: 'Inventory Update', channel: 'Mobile',  status: 'Complete',    lastAttempt: '3 min',  error: null },
  { itemNo: '1008', description: 'Fan Assembly I900',      action: 'Price Update',     channel: 'Website', status: 'Pending',     lastAttempt: '—',      error: null },
  { itemNo: '1009', description: 'Battery Pack J100',      action: 'New Listing',      channel: 'eBay',    status: 'Failed',      lastAttempt: '3 hrs',  error: 'Listing limit reached' },
  { itemNo: '1010', description: 'Switch Panel K200',      action: 'Inventory Update', channel: 'Amazon',  status: 'Complete',    lastAttempt: '10 min', error: null },
  { itemNo: '1011', description: 'Relay Module L300',      action: 'Price Update',     channel: 'Website', status: 'Complete',    lastAttempt: '12 min', error: null },
]

const ERRORS = [
  { id: '1',  channel: 'eBay',   item: '1002', message: 'API timeout after 30s',         timestamp: 'Apr 22 08:15' },
  { id: '2',  channel: 'eBay',   item: '1005', message: 'Authentication error 401',       timestamp: 'Apr 22 08:15' },
  { id: '3',  channel: 'eBay',   item: '1009', message: 'Listing limit reached (250)',    timestamp: 'Apr 22 07:40' },
  { id: '4',  channel: 'Amazon', item: '1000', message: 'Rate limit exceeded',            timestamp: 'Apr 22 09:45' },
  { id: '5',  channel: 'Amazon', item: '1004', message: 'Invalid UPC code',               timestamp: 'Apr 22 09:44' },
  { id: '6',  channel: 'Amazon', item: '1006', message: 'Category not permitted',         timestamp: 'Apr 22 09:43' },
  { id: '7',  channel: 'eBay',   item: '1012', message: 'Image URL unreachable',          timestamp: 'Apr 22 07:20' },
  { id: '8',  channel: 'eBay',   item: '1013', message: 'Description length exceeded',   timestamp: 'Apr 22 07:18' },
  { id: '9',  channel: 'eBay',   item: '1014', message: 'Price below minimum threshold', timestamp: 'Apr 22 07:10' },
  { id: '10', channel: 'eBay',   item: '1015', message: 'Condition field required',      timestamp: 'Apr 22 06:55' },
]

export async function GET(_req: NextRequest) {
  return NextResponse.json({ channels: CHANNELS, queue: QUEUE, errors: ERRORS })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, channel } = body
  return NextResponse.json({
    success: true,
    message: action === 'sync' ? `Sync triggered for ${channel ?? 'all channels'}` : 'Action queued',
    timestamp: new Date().toISOString(),
  })
}
