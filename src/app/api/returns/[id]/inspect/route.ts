import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const { inspectedBy, overallCondition, notes, passedInspection } = body as {
      inspectedBy?: string
      overallCondition?: string
      notes?: string
      passedInspection: boolean
    }

    const inspection = await prisma.returnInspection.upsert({
      where: { returnAuthorizationId: id },
      create: {
        returnAuthorizationId: id,
        inspectedBy: inspectedBy ?? null,
        overallCondition: overallCondition ?? null,
        notes: notes ?? null,
        passedInspection: Boolean(passedInspection),
        inspectedAt: new Date(),
      },
      update: {
        inspectedBy: inspectedBy ?? undefined,
        overallCondition: overallCondition ?? undefined,
        notes: notes ?? undefined,
        passedInspection: Boolean(passedInspection),
        inspectedAt: new Date(),
      },
    })

    const newStatus = passedInspection ? 'inspecting' : 'received'
    const ra = await prisma.returnAuthorization.update({
      where: { id },
      data: { status: newStatus },
      include: {
        lines: { orderBy: { createdAt: 'asc' } },
        inspection: true,
        refundRecord: true,
      },
    })

    return NextResponse.json({ ...ra, inspection })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
