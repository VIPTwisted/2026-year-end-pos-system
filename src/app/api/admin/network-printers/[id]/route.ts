import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const printer = await prisma.networkPrinter.findUnique({
    where: { id: params.id },
    include: { store: { select: { id: true, name: true } } },
  })
  if (!printer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(printer)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  if (body._action === 'test-connection') {
    // Simulate ping — update lastPingAt and set status to active
    const printer = await prisma.networkPrinter.update({
      where: { id: params.id },
      data: { lastPingAt: new Date(), status: 'active' },
    })
    return NextResponse.json({ success: true, printer })
  }
  const { _action, ...data } = body
  const printer = await prisma.networkPrinter.update({ where: { id: params.id }, data })
  return NextResponse.json(printer)
}
