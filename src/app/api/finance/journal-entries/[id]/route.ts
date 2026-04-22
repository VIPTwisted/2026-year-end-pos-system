import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: { account: true },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    return NextResponse.json({ entry })
  } catch (err) {
    console.error('[GET /api/finance/journal-entries/[id]]', err)
    return NextResponse.json({ error: 'Failed to load journal entry' }, { status: 500 })
  }
}
