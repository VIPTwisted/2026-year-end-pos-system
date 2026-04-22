import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const assignment = await prisma.cSUChannelAssignment.create({
    data: {
      csuId: id,
      channelId: body.channelId,
      channelName: body.channelName,
      channelType: body.channelType,
      status: 'initializing',
      initializedAt: new Date(),
    },
  })
  await prisma.commerceScaleUnit.update({ where: { id }, data: { status: 'active' } })
  return NextResponse.json(assignment, { status: 201 })
}
