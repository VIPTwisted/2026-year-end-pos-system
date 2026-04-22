import { NextRequest, NextResponse } from 'next/server'

const MOCK_OPPS = [
  { id: 'OPP-001', no: 'OPP-001', contact: 'John Smith', contactId: 'C-001', salesperson: 'JD', status: 'Open', stage: 'Proposal', closeDate: '2026-06-30', estimatedValue: 12000, probability: 70 },
  { id: 'OPP-002', no: 'OPP-002', contact: 'Globex Industries', contactId: 'C-002', salesperson: 'BK', status: 'Open', stage: 'Negotiation', closeDate: '2026-05-15', estimatedValue: 45000, probability: 85 },
  { id: 'OPP-003', no: 'OPP-003', contact: 'Mary Johnson', contactId: 'C-003', salesperson: 'JD', status: 'Won', stage: 'Closed', closeDate: '2026-04-01', estimatedValue: 8500, probability: 100 },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? ''
    const contactId = searchParams.get('contactId') ?? ''
    const salesperson = searchParams.get('salesperson') ?? ''

    let opps = MOCK_OPPS
    if (status) opps = opps.filter(o => o.status.toLowerCase() === status.toLowerCase())
    if (contactId) opps = opps.filter(o => o.contactId === contactId)
    if (salesperson) opps = opps.filter(o => o.salesperson === salesperson)

    const totalValue = opps.filter(o => o.status === 'Open').reduce((s, o) => s + o.estimatedValue, 0)

    return NextResponse.json({ opportunities: opps, total: opps.length, openValue: totalValue })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, contactId, salesperson, stage, closeDate, estimatedValue, probability } = body

    if (!description || !contactId) {
      return NextResponse.json({ error: 'description and contactId are required' }, { status: 400 })
    }

    const no = `OPP-${Date.now().toString().slice(-4)}`
    const opp = {
      id: no,
      no,
      description,
      contactId,
      salesperson: salesperson ?? null,
      status: 'Open',
      stage: stage ?? 'Discovery',
      closeDate: closeDate ?? null,
      estimatedValue: estimatedValue ?? 0,
      probability: probability ?? 50,
    }

    return NextResponse.json(opp, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}
