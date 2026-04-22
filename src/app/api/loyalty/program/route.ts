import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MEMBERS = [
  { id:'LM-00001', name:'Sarah Martinez',  tier:'Gold',     points:8420,  joined:'2022-01-15', lastActivity:'2026-04-22', status:'Active' },
  { id:'LM-00002', name:'James Chen',      tier:'Platinum', points:24100, joined:'2019-03-20', lastActivity:'2026-04-21', status:'Active' },
  { id:'LM-00003', name:'Lisa Park',       tier:'Silver',   points:2840,  joined:'2023-08-10', lastActivity:'2026-04-18', status:'Active' },
  { id:'LM-00004', name:'Robert Johnson',  tier:'Bronze',   points:320,   joined:'2024-02-05', lastActivity:'2026-03-05', status:'Inactive' },
  { id:'LM-00005', name:'Angela Torres',   tier:'Gold',     points:11200, joined:'2021-06-12', lastActivity:'2026-04-20', status:'Active' },
  { id:'LM-00006', name:'David Kim',       tier:'Silver',   points:3100,  joined:'2022-09-08', lastActivity:'2026-04-17', status:'Active' },
  { id:'LM-00007', name:'Maria Gonzalez',  tier:'Platinum', points:38400, joined:'2018-01-03', lastActivity:'2026-04-22', status:'Active' },
  { id:'LM-00008', name:'Tyler Brooks',    tier:'Bronze',   points:150,   joined:'2024-03-14', lastActivity:'2026-04-10', status:'Active' },
  { id:'LM-00009', name:'Jennifer Walsh',  tier:'Silver',   points:4200,  joined:'2022-11-22', lastActivity:'2026-04-19', status:'Active' },
  { id:'LM-00010', name:'Carlos Reyes',    tier:'Gold',     points:7800,  joined:'2021-04-01', lastActivity:'2026-04-16', status:'Active' },
  { id:'LM-00011', name:'Priya Nair',      tier:'Bronze',   points:480,   joined:'2024-01-18', lastActivity:'2026-04-14', status:'Active' },
  { id:'LM-00012', name:"Kevin O'Brien",   tier:'Silver',   points:1950,  joined:'2023-07-30', lastActivity:'2026-04-21', status:'Active' },
  { id:'LM-00013', name:'Mia Thompson',    tier:'Platinum', points:22700, joined:'2020-02-14', lastActivity:'2026-04-22', status:'Active' },
  { id:'LM-00014', name:'Ethan Clarke',    tier:'Bronze',   points:90,    joined:'2024-04-02', lastActivity:'2026-04-08', status:'Active' },
  { id:'LM-00015', name:'Olivia Scott',    tier:'Gold',     points:9100,  joined:'2021-05-09', lastActivity:'2026-04-20', status:'Active' },
]

const PROGRAM_CONFIG = {
  name: 'NovaPOS Rewards',
  earnRate: 1,
  redeemRate: 100,
  minRedemption: 500,
  maxPerTransaction: 5000,
  tiers: [
    { name:'Bronze',   minPoints:0,     maxPoints:999,   multiplier:1.0, birthdayBonus:0,    extras:[] },
    { name:'Silver',   minPoints:1000,  maxPoints:4999,  multiplier:1.5, birthdayBonus:500,  extras:[] },
    { name:'Gold',     minPoints:5000,  maxPoints:19999, multiplier:2.0, birthdayBonus:1000, extras:['5% discount'] },
    { name:'Platinum', minPoints:20000, maxPoints:null,  multiplier:3.0, birthdayBonus:2000, extras:['10% discount','free shipping'] },
  ],
}

const STATS = {
  totalMembers: 8247,
  activeMembers30d: 2841,
  pointsOutstanding: 4821000,
  liabilityUSD: 48210,
  redemptionsYTD: 24100,
  tierDistribution: { Bronze:4288, Silver:2557, Gold:1072, Platinum:330 },
}

export async function GET() {
  return NextResponse.json({ members: MEMBERS, config: PROGRAM_CONFIG, stats: STATS })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { action } = body
  if (action === 'enroll') {
    return NextResponse.json({ success: true, member: { id: `LM-${Date.now()}`, tier: 'Bronze', points: 0, ...body } }, { status: 201 })
  }
  if (action === 'issue_points') {
    return NextResponse.json({ success: true, message: `${body.points} points issued to ${body.memberId}` })
  }
  if (action === 'void_points') {
    return NextResponse.json({ success: true, message: `${body.points} points voided for ${body.memberId}` })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
