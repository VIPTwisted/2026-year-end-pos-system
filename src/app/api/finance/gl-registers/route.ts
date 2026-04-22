import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      const register = await (prisma as any).glRegister.findUnique({ where: { id } })
      if (!register) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ register })
    }

    const registers = await (prisma as any).glRegister.findMany({
      orderBy: { registerNo: 'desc' },
      take: 200,
    })
    return NextResponse.json({ registers })
  } catch {
    return NextResponse.json({ registers: [] })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { sourceCode, userId, fromEntryNo, toEntryNo, journalBatch } = body

  try {
    const register = await (prisma as any).glRegister.create({
      data: {
        creationDate: new Date(),
        sourceCode: sourceCode ?? 'GENJNL',
        userId: userId ?? null,
        fromEntryNo: fromEntryNo ?? 0,
        toEntryNo: toEntryNo ?? 0,
        journalBatch: journalBatch ?? null,
      },
    })
    return NextResponse.json({ register }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create register', detail: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await (prisma as any).glRegister.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
