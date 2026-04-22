import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface LineUpdate {
  id: string
  countedQty: number
  notes?: string
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as { lines: LineUpdate[] }

    if (!Array.isArray(body.lines)) {
      return NextResponse.json({ error: 'lines array required' }, { status: 400 })
    }

    // Update each line — calculate variance = countedQty - systemQty
    const updates = await Promise.all(
      body.lines.map(async (lineUpdate) => {
        const existing = await prisma.physicalCountLine.findUnique({
          where: { id: lineUpdate.id },
        })

        if (!existing || existing.countId !== id) return null

        const variance = lineUpdate.countedQty - existing.systemQty

        return prisma.physicalCountLine.update({
          where: { id: lineUpdate.id },
          data: {
            countedQty: lineUpdate.countedQty,
            variance,
            notes: lineUpdate.notes !== undefined ? lineUpdate.notes : existing.notes,
          },
        })
      }),
    )

    return NextResponse.json({ updated: updates.filter(Boolean).length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
