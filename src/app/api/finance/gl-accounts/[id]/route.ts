import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── GET /api/finance/gl-accounts/[id] ────────────────────────────────────────
// Returns single account with last 20 journal lines
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        journalLines: {
          include: { entry: true },
          orderBy: { entry: { date: 'desc' } },
          take: 20,
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (err) {
    console.error('[GET /api/finance/gl-accounts/[id]]', err)
    return NextResponse.json({ error: 'Failed to load account' }, { status: 500 })
  }
}

// ─── PATCH /api/finance/gl-accounts/[id] ──────────────────────────────────────
// Update name, subtype, mainAccountType, isActive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      name?: string
      subtype?: string
      mainAccountType?: string
      isActive?: boolean
    }

    const existing = await prisma.account.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const updated = await prisma.account.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.subtype !== undefined && { subtype: body.subtype }),
        ...(body.mainAccountType !== undefined && { mainAccountType: body.mainAccountType }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ account: updated })
  } catch (err) {
    console.error('[PATCH /api/finance/gl-accounts/[id]]', err)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

// ─── DELETE /api/finance/gl-accounts/[id] ─────────────────────────────────────
// Deactivate only — never hard-delete accounts with journal entries
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.account.findUnique({
      where: { id },
      include: { journalLines: { take: 1 } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (existing.journalLines.length > 0) {
      // Has journal entries — deactivate only, never hard-delete
      const updated = await prisma.account.update({
        where: { id },
        data: { isActive: false },
      })
      return NextResponse.json({
        account: updated,
        message: 'Account has journal entries and was deactivated rather than deleted',
      })
    }

    // No journal entries — safe to deactivate (still not hard-deleting per accounting norms)
    const updated = await prisma.account.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ account: updated, message: 'Account deactivated' })
  } catch (err) {
    console.error('[DELETE /api/finance/gl-accounts/[id]]', err)
    return NextResponse.json({ error: 'Failed to deactivate account' }, { status: 500 })
  }
}
