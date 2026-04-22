import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SEED_PARTIES = [
  { id: '1', partyId: 'PARTY-00001', name: 'Acme Corporation', type: 'Organization', category: 'Customer', primaryAddress: '123 Main St', city: 'New York', country: 'US', postalCode: '10001', phone: '+1-212-555-0100', email: 'ar@acme.com', relationships: ['Customer', 'Prospect'], isDuplicate: false, createdAt: '2024-01-15' },
  { id: '2', partyId: 'PARTY-00002', name: 'Acme Corp', type: 'Organization', category: 'Customer', primaryAddress: '123 Main Street', city: 'New York', country: 'US', postalCode: '10001', phone: '+1-212-555-0101', email: 'billing@acmecorp.com', relationships: ['Customer'], isDuplicate: true, createdAt: '2024-01-16' },
  { id: '3', partyId: 'PARTY-00003', name: 'Global Supplies Inc.', type: 'Organization', category: 'Vendor', primaryAddress: '456 Commerce Blvd', city: 'Chicago', country: 'US', postalCode: '60601', phone: '+1-312-555-0200', email: 'orders@globalsupplies.com', relationships: ['Vendor', 'Supplier'], isDuplicate: false, createdAt: '2024-01-20' },
  { id: '4', partyId: 'PARTY-00004', name: 'James Mitchell', type: 'Person', category: 'Employee', primaryAddress: '789 Oak Ave', city: 'Austin', country: 'US', postalCode: '73301', phone: '+1-512-555-0300', email: 'j.mitchell@novapos.internal', relationships: ['Employee', 'Manager'], isDuplicate: false, createdAt: '2024-02-01' },
  { id: '5', partyId: 'PARTY-00005', name: 'Sarah Chen', type: 'Person', category: 'Contact', primaryAddress: '321 Elm Dr', city: 'San Francisco', country: 'US', postalCode: '94102', phone: '+1-415-555-0400', email: 'schen@techpartner.com', relationships: ['Contact', 'Partner'], isDuplicate: false, createdAt: '2024-02-10' },
  { id: '6', partyId: 'PARTY-00006', name: 'Meridian Logistics LLC', type: 'Organization', category: 'Vendor', primaryAddress: '567 Industrial Pkwy', city: 'Dallas', country: 'US', postalCode: '75201', phone: '+1-214-555-0500', email: 'ap@meridianlogistics.com', relationships: ['Vendor', 'Carrier'], isDuplicate: false, createdAt: '2024-02-15' },
  { id: '7', partyId: 'PARTY-00007', name: 'NovaPOS HQ', type: 'Organization', category: 'Internal', primaryAddress: '1 Enterprise Way', city: 'Seattle', country: 'US', postalCode: '98101', phone: '+1-206-555-0600', email: 'hq@novapos.internal', relationships: ['Internal', 'HQ'], isDuplicate: false, createdAt: '2024-01-01' },
  { id: '8', partyId: 'PARTY-00008', name: 'Robert Alvarez', type: 'Person', category: 'Employee', primaryAddress: '100 Pine St', city: 'Denver', country: 'US', postalCode: '80201', phone: '+1-720-555-0700', email: 'r.alvarez@novapos.internal', relationships: ['Employee'], isDuplicate: false, createdAt: '2024-03-01' },
  { id: '9', partyId: 'PARTY-00009', name: 'Pinnacle Retail Group', type: 'Organization', category: 'Customer', primaryAddress: '200 Market Plaza', city: 'Miami', country: 'US', postalCode: '33101', phone: '+1-305-555-0800', email: 'purchasing@pinnacleretail.com', relationships: ['Customer', 'Key Account'], isDuplicate: false, createdAt: '2024-03-05' },
  { id: '10', partyId: 'PARTY-00010', name: 'Euro Parts GmbH', type: 'Organization', category: 'Vendor', primaryAddress: 'Hauptstrasse 44', city: 'Munich', country: 'DE', postalCode: '80331', phone: '+49-89-555-0900', email: 'export@europarts.de', relationships: ['Vendor', 'International'], isDuplicate: false, createdAt: '2024-03-10' },
  { id: '11', partyId: 'PARTY-00011', name: 'Linda Torres', type: 'Person', category: 'Contact', primaryAddress: '45 Harbor View', city: 'Boston', country: 'US', postalCode: '02101', phone: '+1-617-555-1000', email: 'ltorres@consultant.com', relationships: ['Contact', 'Consultant'], isDuplicate: false, createdAt: '2024-03-15' },
  { id: '12', partyId: 'PARTY-00012', name: 'Southwest Distribution Co.', type: 'Organization', category: 'Customer', primaryAddress: '890 Desert Rd', city: 'Phoenix', country: 'US', postalCode: '85001', phone: '+1-602-555-1100', email: 'ops@swdist.com', relationships: ['Customer'], isDuplicate: false, createdAt: '2024-03-20' },
  { id: '13', partyId: 'PARTY-00013', name: 'IT Operations Group', type: 'Group', category: 'Internal', primaryAddress: '1 Enterprise Way', city: 'Seattle', country: 'US', postalCode: '98101', phone: '+1-206-555-1200', email: 'it-ops@novapos.internal', relationships: ['Internal', 'IT'], isDuplicate: false, createdAt: '2024-01-05' },
  { id: '14', partyId: 'PARTY-00014', name: 'Pacific Tech Solutions', type: 'Organization', category: 'Vendor', primaryAddress: '300 Silicon Loop', city: 'San Jose', country: 'US', postalCode: '95101', phone: '+1-408-555-1300', email: 'sales@pacifictech.com', relationships: ['Vendor', 'Technology'], isDuplicate: false, createdAt: '2024-04-01' },
  { id: '15', partyId: 'PARTY-00015', name: 'Marcus Johnson', type: 'Person', category: 'Employee', primaryAddress: '77 Riverside Blvd', city: 'Atlanta', country: 'US', postalCode: '30301', phone: '+1-404-555-1400', email: 'm.johnson@novapos.internal', relationships: ['Employee', 'Sales Rep'], isDuplicate: false, createdAt: '2024-04-10' },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = (searchParams.get('search') ?? '').toLowerCase()
  const category = searchParams.get('category') ?? ''
  const type = searchParams.get('type') ?? ''
  const country = (searchParams.get('country') ?? '').toLowerCase()
  const city = (searchParams.get('city') ?? '').toLowerCase()
  const postalCode = searchParams.get('postalCode') ?? ''

  let result = [...SEED_PARTIES]

  if (search) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.partyId.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search) ||
      p.phone.includes(search)
    )
  }
  if (category && category !== 'All') result = result.filter(p => p.category === category)
  if (type && type !== 'All') result = result.filter(p => p.type === type)
  if (country) result = result.filter(p => p.country.toLowerCase().includes(country))
  if (city) result = result.filter(p => p.city.toLowerCase().includes(city))
  if (postalCode) result = result.filter(p => p.postalCode.includes(postalCode))

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newParty = {
      id: String(Date.now()),
      partyId: `PARTY-${String(SEED_PARTIES.length + 1).padStart(5, '0')}`,
      ...body,
      isDuplicate: false,
      createdAt: new Date().toISOString().split('T')[0],
    }
    return NextResponse.json(newParty, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
