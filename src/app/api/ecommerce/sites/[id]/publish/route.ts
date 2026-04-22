import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { notes, version, deployedBy } = body

    const [deployment] = await prisma.$transaction([
      prisma.siteDeployment.create({
        data: {
          siteId: id,
          status: 'deploying',
          notes,
          version,
          deployedBy: deployedBy ?? 'System',
        },
      }),
      prisma.ecommerceSite.update({
        where: { id },
        data: { status: 'provisioning' },
      }),
    ])

    return NextResponse.json(deployment, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to publish site' }, { status: 500 })
  }
}
