import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const run = await prisma.domOrderRun.findUnique({
      where: { id },
      include: { results: { orderBy: { createdAt: 'asc' } } },
    })
    if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let profileName = 'No Profile'
    if (run.profileId) {
      const profile = await prisma.domProfile.findUnique({
        where: { id: run.profileId },
        select: { name: true },
      })
      if (profile) profileName = profile.name
    }

    return NextResponse.json({ ...run, profileName })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
