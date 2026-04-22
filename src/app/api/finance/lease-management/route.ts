import { NextResponse } from 'next/server'

const LEASES = [
  { id: 'GBSI-0001', description: 'BUILDING 1', group: 'BUILDINGS', country: '', workflowStatus: 'None', commenced: '2023-01-01', expiry: '2028-01-01', bookStatus: 'Open' },
  { id: 'GBSI-0002', description: 'BUILDING 2', group: 'BUILDINGS', country: '', workflowStatus: 'None', commenced: '2023-03-01', expiry: '2028-03-01', bookStatus: 'Open' },
  { id: 'GBSI-0003', description: 'BUILDING 3', group: 'BUILDINGS', country: '', workflowStatus: 'None', commenced: '2023-06-01', expiry: '2028-06-01', bookStatus: 'Open' },
  { id: 'GBSI-0004', description: 'VEHICLE 1',  group: 'VEHICLES',  country: '', workflowStatus: 'None', commenced: '2024-01-01', expiry: '2027-01-01', bookStatus: 'Open' },
  { id: 'GBSI-0005', description: 'VEHICLE 2',  group: 'VEHICLES',  country: '', workflowStatus: 'None', commenced: '2024-02-01', expiry: '2027-02-01', bookStatus: 'Open' },
  { id: 'GBSI-0006', description: 'VEHICLE 3',  group: 'VEHICLES',  country: '', workflowStatus: 'None', commenced: '2024-03-01', expiry: '2027-03-01', bookStatus: 'Open' },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').toLowerCase()

  const filtered = q
    ? LEASES.filter(l => l.id.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
    : LEASES

  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const summary = {
    booksNotAcquired: 23,
    booksCommencedThisYear: LEASES.filter(l => new Date(l.commenced).getFullYear() === now.getFullYear()).length,
    booksOpen: LEASES.filter(l => l.bookStatus === 'Open').length,
    leasesExpiringIn30Days: LEASES.filter(l => {
      const exp = new Date(l.expiry)
      return exp >= now && exp <= in30Days
    }).length,
  }

  return NextResponse.json({ leases: filtered, summary, total: filtered.length })
}

export async function POST(req: Request) {
  const body = await req.json()
  const newLease = {
    id: body.id ?? `GBSI-${String(LEASES.length + 1).padStart(4, '0')}`,
    description: body.description ?? '',
    group: body.group ?? '',
    country: body.country ?? '',
    workflowStatus: 'None',
    commenced: body.commenced ?? new Date().toISOString().split('T')[0],
    expiry: body.expiry ?? '',
    bookStatus: 'Not Acquired',
  }
  return NextResponse.json({ lease: newLease, message: 'Lease created' }, { status: 201 })
}
