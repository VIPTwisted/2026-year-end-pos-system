import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = await prisma.callCenterAgent.findUnique({
    where: { id },
    include: {
      _count: { select: { calls: true, orders: true } },
      calls: {
        orderBy: { callStartedAt: 'desc' },
        take: 10,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(agent)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['name', 'email', 'extension', 'isActive', 'employeeId']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const agent = await prisma.callCenterAgent.update({ where: { id }, data })
  return NextResponse.json(agent)
}
