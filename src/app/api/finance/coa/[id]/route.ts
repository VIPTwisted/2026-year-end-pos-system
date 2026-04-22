import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { accountName, accountType, normalBalance, parentCode, isActive, description } = body
    const account = await prisma.chartOfAccount.update({
      where: { id },
      data: {
        ...(accountName !== undefined && { accountName: accountName.trim() }),
        ...(accountType !== undefined && { accountType }),
        ...(normalBalance !== undefined && { normalBalance }),
        ...(parentCode !== undefined && { parentCode }),
        ...(isActive !== undefined && { isActive }),
        ...(description !== undefined && { description }),
      },
    })
    return NextResponse.json(account)
  } catch (err) {
    console.error('[coa PATCH]', err)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.chartOfAccount.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[coa DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
