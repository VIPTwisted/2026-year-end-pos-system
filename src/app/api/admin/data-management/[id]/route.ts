import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.dataManagementJob.findUnique({ where: { id: params.id } })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(job)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { action } = body

  let data: Record<string, unknown> = {}
  if (action === 'cancel') {
    data = { status: 'cancelled' }
  } else if (action === 'retry') {
    data = { status: 'running', startedAt: new Date(), errorCount: 0, errorsJson: null }
  } else {
    data = body
  }

  const job = await prisma.dataManagementJob.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(job)
}
