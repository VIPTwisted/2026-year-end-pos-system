import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Deterministic mock data keyed to opportunity id for consistent UI
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rnd = (min: number, max: number, offset = 0) => min + ((seed + offset) % (max - min + 1))

  const data = {
    opportunityId: id,
    health: {
      score: 'Good',
      trend: 'Steady',
      nextActivity: null,
      lastInteractionDate: '2026-03-18',
      lastInteractionNote: 'Review final proposal',
    },
    interactions: [
      { period: 'Nov', fromUs: rnd(2, 8, 1), fromThem: rnd(1, 5, 2) },
      { period: 'Dec', fromUs: rnd(3, 9, 3), fromThem: rnd(2, 6, 4) },
      { period: 'Jan', fromUs: rnd(4, 10, 5), fromThem: rnd(3, 7, 6) },
      { period: 'Feb', fromUs: rnd(2, 7, 7), fromThem: rnd(1, 5, 8) },
      { period: 'Mar', fromUs: rnd(5, 11, 9), fromThem: rnd(2, 6, 10) },
    ],
    timeSpent: {
      usHours: 14.2,
      themHours: 13.1,
    },
    emailEngagement: {
      opened: 74,
      attachmentsViewed: 69,
      linksClicked: 72,
    },
    responseRate: {
      byUs: 53,
      byThem: 88,
    },
    responseTime: {
      ourHours: 10,
      theirHours: 13,
    },
    mostContacted: [
      {
        name: 'Alex Wu',
        initials: 'AW',
        color: '#6366f1',
        emails: rnd(12, 24, 11),
        meetings: rnd(3, 8, 12),
        calls: rnd(5, 12, 13),
      },
    ],
    mostContactedBy: [
      {
        name: 'Renee Lo',
        initials: 'RL',
        color: '#f97316',
        emails: rnd(8, 18, 14),
        meetings: rnd(2, 6, 15),
        calls: rnd(4, 10, 16),
      },
    ],
  }

  return NextResponse.json(data)
}
