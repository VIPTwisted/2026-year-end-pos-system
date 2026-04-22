import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MEMBERS = [
  { id: '1',  memberNum: 'LM-00001', name: 'Sarah Martinez',  tier: 'Gold',     points: 8420,  ytdSpend: 4210,  lastActivity: 'Apr 22', enrolled: 'Jan 2022', status: 'Active',   email: 'sarah.martinez@email.com' },
  { id: '2',  memberNum: 'LM-00002', name: 'James Chen',      tier: 'Platinum', points: 24100, ytdSpend: 12050, lastActivity: 'Apr 21', enrolled: 'Mar 2019', status: 'Active',   email: 'james.chen@email.com' },
  { id: '3',  memberNum: 'LM-00003', name: 'Lisa Park',       tier: 'Silver',   points: 2840,  ytdSpend: 1420,  lastActivity: 'Apr 18', enrolled: 'Aug 2023', status: 'Active',   email: 'lisa.park@email.com' },
  { id: '4',  memberNum: 'LM-00004', name: 'Robert Johnson',  tier: 'Bronze',   points: 320,   ytdSpend: 160,   lastActivity: 'Mar 5',  enrolled: 'Feb 2024', status: 'Inactive', email: 'robert.johnson@email.com' },
  { id: '5',  memberNum: 'LM-00005', name: 'Maria Garcia',    tier: 'Gold',     points: 6841,  ytdSpend: 3420,  lastActivity: 'Apr 20', enrolled: 'Jun 2021', status: 'Active',   email: 'maria.garcia@email.com' },
  { id: '6',  memberNum: 'LM-00006', name: 'Kevin Turner',    tier: 'Silver',   points: 3120,  ytdSpend: 1560,  lastActivity: 'Apr 19', enrolled: 'Nov 2022', status: 'Active',   email: 'kevin.turner@email.com' },
  { id: '7',  memberNum: 'LM-00007', name: 'Amy Johnson',     tier: 'Bronze',   points: 480,   ytdSpend: 240,   lastActivity: 'Apr 10', enrolled: 'Jan 2024', status: 'Active',   email: 'amy.johnson@email.com' },
  { id: '8',  memberNum: 'LM-00008', name: 'David Park',      tier: 'Gold',     points: 7240,  ytdSpend: 3620,  lastActivity: 'Apr 19', enrolled: 'Apr 2020', status: 'Active',   email: 'david.park@email.com' },
  { id: '9',  memberNum: 'LM-00009', name: 'Nina Patel',      tier: 'Platinum', points: 18400, ytdSpend: 9200,  lastActivity: 'Apr 20', enrolled: 'Sep 2018', status: 'Active',   email: 'nina.patel@email.com' },
  { id: '10', memberNum: 'LM-00010', name: 'Carlos Rivera',   tier: 'Silver',   points: 1920,  ytdSpend: 960,   lastActivity: 'Apr 21', enrolled: 'May 2023', status: 'Active',   email: 'carlos.rivera@email.com' },
  { id: '11', memberNum: 'LM-00011', name: 'Grace Kim',       tier: 'Gold',     points: 5100,  ytdSpend: 2550,  lastActivity: 'Apr 22', enrolled: 'Jul 2021', status: 'Active',   email: 'grace.kim@email.com' },
  { id: '12', memberNum: 'LM-00012', name: 'Tom Walsh',       tier: 'Bronze',   points: 240,   ytdSpend: 120,   lastActivity: 'Feb 28', enrolled: 'Mar 2024', status: 'Inactive', email: 'tom.walsh@email.com' },
  { id: '13', memberNum: 'LM-00013', name: 'Linda Nguyen',    tier: 'Silver',   points: 2210,  ytdSpend: 1105,  lastActivity: 'Apr 21', enrolled: 'Oct 2022', status: 'Active',   email: 'linda.nguyen@email.com' },
  { id: '14', memberNum: 'LM-00014', name: 'Ethan Brooks',    tier: 'Gold',     points: 6020,  ytdSpend: 3010,  lastActivity: 'Apr 20', enrolled: 'Feb 2021', status: 'Active',   email: 'ethan.brooks@email.com' },
  { id: '15', memberNum: 'LM-00015', name: 'Rachel Adams',    tier: 'Silver',   points: 3400,  ytdSpend: 1700,  lastActivity: 'Apr 16', enrolled: 'Dec 2022', status: 'Active',   email: 'rachel.adams@email.com' },
  { id: '16', memberNum: 'LM-00016', name: 'Brian Scott',     tier: 'Platinum', points: 31200, ytdSpend: 15600, lastActivity: 'Apr 22', enrolled: 'Jan 2018', status: 'Active',   email: 'brian.scott@email.com' },
  { id: '17', memberNum: 'LM-00017', name: 'Michelle Lee',    tier: 'Gold',     points: 9840,  ytdSpend: 4920,  lastActivity: 'Apr 18', enrolled: 'May 2020', status: 'Active',   email: 'michelle.lee@email.com' },
  { id: '18', memberNum: 'LM-00018', name: 'Jason White',     tier: 'Bronze',   points: 680,   ytdSpend: 340,   lastActivity: 'Mar 20', enrolled: 'Sep 2023', status: 'Active',   email: 'jason.white@email.com' },
  { id: '19', memberNum: 'LM-00019', name: 'Stephanie Clark', tier: 'Silver',   points: 2780,  ytdSpend: 1390,  lastActivity: 'Apr 17', enrolled: 'Dec 2022', status: 'Active',   email: 'stephanie.clark@email.com' },
  { id: '20', memberNum: 'LM-00020', name: 'Alex Rodriguez',  tier: 'Gold',     points: 7600,  ytdSpend: 3800,  lastActivity: 'Apr 19', enrolled: 'Mar 2021', status: 'Active',   email: 'alex.rodriguez@email.com' },
  { id: '21', memberNum: 'LM-00021', name: 'Monica Brown',    tier: 'Silver',   points: 1840,  ytdSpend: 920,   lastActivity: 'Apr 20', enrolled: 'Aug 2023', status: 'Active',   email: 'monica.brown@email.com' },
  { id: '22', memberNum: 'LM-00022', name: 'Tyler Wilson',    tier: 'Bronze',   points: 420,   ytdSpend: 210,   lastActivity: 'Jan 14', enrolled: 'Nov 2023', status: 'Inactive', email: 'tyler.wilson@email.com' },
  { id: '23', memberNum: 'LM-00023', name: 'Ashley Thomas',   tier: 'Gold',     points: 4920,  ytdSpend: 2460,  lastActivity: 'Apr 21', enrolled: 'Apr 2022', status: 'Active',   email: 'ashley.thomas@email.com' },
  { id: '24', memberNum: 'LM-00024', name: 'Chris Harris',    tier: 'Platinum', points: 22500, ytdSpend: 11250, lastActivity: 'Apr 22', enrolled: 'Jul 2019', status: 'Active',   email: 'chris.harris@email.com' },
  { id: '25', memberNum: 'LM-00025', name: 'Samantha Young',  tier: 'Silver',   points: 3060,  ytdSpend: 1530,  lastActivity: 'Apr 17', enrolled: 'Jan 2023', status: 'Active',   email: 'samantha.young@email.com' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tier   = searchParams.get('tier')
  const status = searchParams.get('status')
  const q      = searchParams.get('q')?.toLowerCase()

  let data = [...MEMBERS]
  if (tier   && tier   !== 'All') data = data.filter(m => m.tier   === tier)
  if (status && status !== 'All') data = data.filter(m => m.status === status)
  if (q) data = data.filter(m => m.name.toLowerCase().includes(q) || m.memberNum.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))

  return NextResponse.json({
    members: data,
    total: data.length,
    kpis: {
      totalMembers: 8247,
      active30d: 2841,
      avgPointsBalance: 584,
      redemptionsThisMonth: 2840,
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body
  if (action === 'issuePoints') {
    return NextResponse.json({ success: true, message: `Issued ${body.points} pts to ${body.member}` })
  }
  if (action === 'voidPoints') {
    return NextResponse.json({ success: true, message: `Voided ${body.points} pts from ${body.member}` })
  }
  return NextResponse.json({ success: true, message: 'Action queued', payload: body })
}
