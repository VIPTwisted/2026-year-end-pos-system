import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const [runs, total] = await Promise.all([
      prisma.domOrderRun.findMany({
        orderBy: { runAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { results: true } } },
      }),
      prisma.domOrderRun.count(),
    ])

    const profileIds = [...new Set(runs.map((r) => r.profileId).filter(Boolean) as string[])]
    const profiles =
      profileIds.length > 0
        ? await prisma.domProfile.findMany({ where: { id: { in: profileIds } }, select: { id: true, name: true } })
        : []
    const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.name]))

    const runsWithProfile = runs.map((r) => ({
      ...r,
      profileName: r.profileId ? (profileMap[r.profileId] ?? 'Unknown') : 'No Profile',
    }))

    return NextResponse.json({ runs: runsWithProfile, total, page, limit })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
