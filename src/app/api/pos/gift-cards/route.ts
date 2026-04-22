import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GIFT_CARDS = [
  { id:1,  cardNumber:'GC-0000-1234-5678', balance:47.50,  originalValue:100.00, issuedDate:'2026-04-01', issuedByStore:'Chicago Store', status:'Active',   lastUsed:'2026-04-18' },
  { id:2,  cardNumber:'GC-0000-2345-6789', balance:0.00,   originalValue:50.00,  issuedDate:'2026-03-15', issuedByStore:'Online',        status:'Depleted', lastUsed:'2026-04-05' },
  { id:3,  cardNumber:'GC-0000-3456-7890', balance:100.00, originalValue:100.00, issuedDate:'2026-04-20', issuedByStore:'NY Store',       status:'Active',   lastUsed:null },
  { id:4,  cardNumber:'GC-0000-4567-8901', balance:25.00,  originalValue:25.00,  issuedDate:'2026-02-28', issuedByStore:'Chicago Store', status:'Active',   lastUsed:'2026-03-10' },
  { id:5,  cardNumber:'GC-0000-5678-9012', balance:75.00,  originalValue:150.00, issuedDate:'2026-03-05', issuedByStore:'LA Store',       status:'Active',   lastUsed:'2026-04-12' },
  { id:6,  cardNumber:'GC-0000-6789-0123', balance:0.00,   originalValue:100.00, issuedDate:'2026-01-20', issuedByStore:'Online',        status:'Depleted', lastUsed:'2026-03-28' },
  { id:7,  cardNumber:'GC-0000-7890-1234', balance:200.00, originalValue:200.00, issuedDate:'2026-04-18', issuedByStore:'NY Store',       status:'Active',   lastUsed:null },
  { id:8,  cardNumber:'GC-0000-8901-2345', balance:12.50,  originalValue:50.00,  issuedDate:'2026-02-14', issuedByStore:'Chicago Store', status:'Active',   lastUsed:'2026-04-20' },
  { id:9,  cardNumber:'GC-0000-9012-3456', balance:50.00,  originalValue:50.00,  issuedDate:'2026-04-10', issuedByStore:'Online',        status:'Frozen',   lastUsed:null },
  { id:10, cardNumber:'GC-0001-0123-4567', balance:125.00, originalValue:150.00, issuedDate:'2026-03-22', issuedByStore:'LA Store',       status:'Active',   lastUsed:'2026-04-15' },
]

const STATS = {
  cardsIssued: 1247,
  totalOutstandingBalance: 28420,
  cardsRedeemedYTD: 892,
  breakageRate: 12.4,
  liabilityByMonth: [
    { month:'Jan 2026', balance:18200 },
    { month:'Feb 2026', balance:22400 },
    { month:'Mar 2026', balance:25800 },
    { month:'Apr 2026', balance:28420 },
  ],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cardNumber = searchParams.get('card')
  if (cardNumber) {
    const card = GIFT_CARDS.find(c => c.cardNumber === cardNumber || c.cardNumber.includes(cardNumber))
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    return NextResponse.json(card)
  }
  return NextResponse.json({ cards: GIFT_CARDS, stats: STATS })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { action } = body
  if (action === 'issue') {
    const cardNumber = `GC-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`
    return NextResponse.json({ success:true, cardNumber, value: body.value, issuedDate: new Date().toISOString() }, { status:201 })
  }
  if (action === 'reload') {
    return NextResponse.json({ success:true, message:`Card ${body.cardNumber} reloaded with $${body.amount}` })
  }
  if (action === 'freeze') {
    return NextResponse.json({ success:true, message:`Card ${body.cardNumber} frozen` })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status:400 })
}
