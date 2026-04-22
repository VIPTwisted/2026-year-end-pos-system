import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const account = await prisma.b2BAccount.findUnique({ where: { id } })
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const updated = await prisma.b2BAccount.update({
      where: { id },
      data: { isApproved: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to approve account' }, { status: 500 })
  }
}
