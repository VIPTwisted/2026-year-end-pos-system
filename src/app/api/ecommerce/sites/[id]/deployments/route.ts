import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deployments = await prisma.siteDeployment.findMany({
      where: { siteId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(deployments)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 })
  }
}
