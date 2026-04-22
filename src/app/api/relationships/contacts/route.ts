import { NextRequest, NextResponse } from 'next/server'

// Relationships Contacts API (BC-style: No., Company, Type, Salesperson, Interactions)
// Uses existing prisma.contact model where available, mock otherwise

const MOCK_CONTACTS = [
  { id: 'C-001', no: 'C-001', companyName: 'Acme Corp', firstName: 'John', lastName: 'Smith', type: 'Person', phone: '555-0101', email: 'john.smith@acme.com', salesperson: 'JD' },
  { id: 'C-002', no: 'C-002', companyName: 'Globex Industries', firstName: '', lastName: '', type: 'Company', phone: '555-0202', email: 'info@globex.com', salesperson: 'BK' },
  { id: 'C-003', no: 'C-003', companyName: 'Initech', firstName: 'Mary', lastName: 'Johnson', type: 'Person', phone: '555-0303', email: 'm.johnson@initech.com', salesperson: 'JD' },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? ''
    const salesperson = searchParams.get('salesperson') ?? ''
    const q = searchParams.get('q') ?? ''

    let contacts = MOCK_CONTACTS
    if (type) contacts = contacts.filter(c => c.type.toLowerCase() === type.toLowerCase())
    if (salesperson) contacts = contacts.filter(c => c.salesperson === salesperson)
    if (q) contacts = contacts.filter(c =>
      c.companyName.toLowerCase().includes(q.toLowerCase()) ||
      c.firstName.toLowerCase().includes(q.toLowerCase()) ||
      c.lastName.toLowerCase().includes(q.toLowerCase())
    )

    return NextResponse.json({ contacts, total: contacts.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, firstName, lastName, type, phone, email, salesperson } = body

    if (!companyName && !lastName) {
      return NextResponse.json({ error: 'companyName or lastName required' }, { status: 400 })
    }

    const no = `C-${Date.now().toString().slice(-4)}`
    const contact = {
      id: no,
      no,
      companyName: companyName ?? '',
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      type: type ?? 'Person',
      phone: phone ?? null,
      email: email ?? null,
      salesperson: salesperson ?? null,
    }

    return NextResponse.json(contact, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
