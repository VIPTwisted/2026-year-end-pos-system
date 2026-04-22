import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const config = await prisma.eRConfiguration.findUnique({ where: { id: params.id } })
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(config)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  // If action is 'run', increment runCount + set lastRunAt
  if (body._action === 'run') {
    const config = await prisma.eRConfiguration.update({
      where: { id: params.id },
      data: { runCount: { increment: 1 }, lastRunAt: new Date() },
    })
    return NextResponse.json(config)
  }
  const { _action, ...data } = body
  const config = await prisma.eRConfiguration.update({ where: { id: params.id }, data })
  return NextResponse.json(config)
}
