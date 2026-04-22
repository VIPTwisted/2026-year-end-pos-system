import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, prefix, initialValue, isReloadable, expiryMonths, isActive } = body
    const program = await prisma.giftCardProgram.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(prefix !== undefined && { prefix: prefix.trim() }),
        ...(initialValue !== undefined && { initialValue: initialValue ? parseFloat(initialValue) : null }),
        ...(isReloadable !== undefined && { isReloadable }),
        ...(expiryMonths !== undefined && { expiryMonths: expiryMonths ? parseInt(expiryMonths) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json(program)
  } catch (err) {
    console.error('[gc-programs PATCH]', err)
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.giftCardProgram.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[gc-programs DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 })
  }
}
