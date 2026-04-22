import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      journalLines: {
        include: { entry: true },
        orderBy: { entry: { date: 'desc' } },
        take: 50,
      },
    },
  })
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(account)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.account.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If code is changing, check uniqueness
  if (body.code && body.code !== existing.code) {
    const conflict = await prisma.account.findUnique({ where: { code: body.code } })
    if (conflict) {
      return NextResponse.json({ error: `Account No. "${body.code}" is already in use` }, { status: 409 })
    }
  }

  const account = await prisma.account.update({
    where: { id },
    data: {
      ...(body.code ? { code: body.code.trim() } : {}),
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.type ? { type: body.type } : {}),
      ...(typeof body.subtype !== 'undefined' ? { subtype: body.subtype || null } : {}),
      ...(typeof body.mainAccountType !== 'undefined' ? { mainAccountType: body.mainAccountType || null } : {}),
      ...(typeof body.balance === 'number' ? { balance: body.balance } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    },
  })

  return NextResponse.json(account)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const existing = await prisma.account.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check for journal lines
  const lineCount = await prisma.journalLine.count({ where: { accountId: id } })
  if (lineCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: account has ${lineCount} journal line(s)` },
      { status: 409 }
    )
  }

  await prisma.account.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
